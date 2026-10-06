from stocks.market import is_market_open
import random
import time
from decimal import Decimal

from django.core.management.base import BaseCommand

from stocks.models import Stock, PriceHistory


class Command(BaseCommand):
    help = "Continuously simulate stock price movements"

    def update_prices(self):
        stocks = Stock.objects.filter(is_active=True)

        for stock in stocks:
            current_price = stock.current_price

            # Random movement between -2% and +2%
            change_percent = Decimal(str(random.uniform(-0.02, 0.02)))

            new_price = current_price * (Decimal("1") + change_percent)

            # Keep price positive and round to 2 decimal places
            new_price = max(Decimal("1.00"), new_price)
            new_price = new_price.quantize(Decimal("0.01"))

            stock.current_price = new_price
            stock.save(update_fields=["current_price", "updated_at"])

            PriceHistory.objects.create(
                stock=stock,
                price=new_price,
                recorded_at=stock.updated_at,
            )

            self.stdout.write(
                f"{stock.symbol}: ₹{current_price} → ₹{new_price}"
            )

    def handle(self, *args, **options):

     self.stdout.write(
        self.style.SUCCESS(
            "Starting price simulator... Press Ctrl+C to stop."
             )
     )

     try:
        while True:
            if is_market_open():
                self.update_prices()
                self.stdout.write(
                    self.style.SUCCESS(
                        "Prices updated. Waiting 10 seconds...\n"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        "Market is closed. Waiting 60 seconds...\n"
                    )
                )

            time.sleep(60)

     except KeyboardInterrupt:
        self.stdout.write(
            self.style.WARNING(
                "\nPrice simulator stopped."
            )
        )