

import time
import random
from datetime import datetime

from zoneinfo import ZoneInfo

import yfinance as yf
from decimal import Decimal

from django.core.management.base import BaseCommand

from django.utils import timezone

from accounts.models import Account
from portfolio.models import Holding, PortfolioSnapshot
from stocks.market import is_market_open
from stocks.models import Stock, PriceHistory


MARKET_TZ = ZoneInfo("Asia/Kolkata")
SNAPSHOT_INTERVAL = 300  # 5 minutes
CLOSE_REFRESH_RETRY = 900  # 15 minutes


class Command(BaseCommand):
    help = "Update stock prices and portfolio snapshots automatically."

    def update_simulated_prices(self):
        for stock in Stock.objects.filter(is_active=True):
            old_price = stock.current_price
            change = Decimal(str(random.uniform(-0.02, 0.02)))
            new_price = max(
                Decimal("1.00"),
                old_price * (Decimal("1") + change),
            ).quantize(Decimal("0.01"))

            stock.current_price = new_price
            stock.save(update_fields=["current_price", "updated_at"])

            PriceHistory.objects.create(
                stock=stock,
                price=new_price,
                recorded_at=timezone.now(),
            )

            self.stdout.write(
                f"{stock.symbol}: ₹{old_price} → ₹{new_price}"
            )

    def refresh_closing_prices(self):
        """Fetch the latest available daily close for each active stock."""
        refreshed = 0

        for stock in Stock.objects.filter(is_active=True):
            try:
                ticker = yf.Ticker(f"{stock.symbol}.NS")
                history = ticker.history(period="5d", interval="1d")

                if history.empty or "Close" not in history:
                    self.stdout.write(
                        self.style.WARNING(
                            f"No closing data for {stock.symbol}; keeping last price."
                        )
                    )
                    continue

                closes = history["Close"].dropna()
                if closes.empty:
                    continue

                close_value = float(closes.iloc[-1])
                if not (close_value > 0 and close_value < float("inf")):
                    continue

                closing_price = Decimal(str(close_value)).quantize(
                    Decimal("0.01")
                )

                stock.current_price = closing_price
                stock.save(update_fields=["current_price", "updated_at"])

                PriceHistory.objects.create(
                    stock=stock,
                    price=closing_price,
                    recorded_at=timezone.now(),
                )

                refreshed += 1
                self.stdout.write(
                    f"{stock.symbol}: closing price ₹{closing_price}"
                )

            except Exception as exc:
                self.stderr.write(
                    f"Could not refresh {stock.symbol}: {exc}"
                )

        self.stdout.write(
            f"Closing-price refresh finished: {refreshed} stock(s) updated."
        )
        return refreshed

    def record_portfolio_snapshots(self):
        now = timezone.now()

        for account in Account.objects.select_related("user").all():
            holdings = Holding.objects.filter(
                user=account.user
            ).select_related("stock")

            stock_value = sum(
                (
                    holding.quantity * holding.stock.current_price
                    for holding in holdings
                ),
                Decimal("0"),
            )

            total_value = account.cash_balance + stock_value

            PortfolioSnapshot.objects.create(
                user=account.user,
                total_value=total_value,
                recorded_at=now,
            )

        self.stdout.write("Portfolio snapshots recorded.")

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("Automatic market worker started.")
        )

        last_snapshot = time.monotonic()
        last_close_attempt_date = None
        next_close_retry = 0

        try:
            while True:
                now = datetime.now(MARKET_TZ)
                market_open = is_market_open()

                if market_open:
                    self.update_simulated_prices()
                    time.sleep(10)

                else:
                    # Attempt one closing-price refresh per date, retrying
                    # periodically if data could not be fetched.
                    today = now.date()
                    monotonic_now = time.monotonic()

                    if (
                        last_close_attempt_date != today
                        or monotonic_now >= next_close_retry
                    ):
                        self.refresh_closing_prices()
                        last_close_attempt_date = today
                        next_close_retry = (
                            time.monotonic() + CLOSE_REFRESH_RETRY
                        )

                    time.sleep(60)

                if time.monotonic() - last_snapshot >= SNAPSHOT_INTERVAL:
                    self.record_portfolio_snapshots()
                    last_snapshot = time.monotonic()

        except KeyboardInterrupt:
            self.stdout.write("Automatic market worker stopped.")
