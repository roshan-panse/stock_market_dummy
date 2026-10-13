
import time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone

from accounts.models import Account
from portfolio.models import Holding, PortfolioSnapshot


class Command(BaseCommand):
    help = "Record portfolio values for all users every five minutes."

    def handle(self, *args, **options):
        self.stdout.write("Portfolio snapshot recorder started.")

        while True:
            now = timezone.now()

            accounts = Account.objects.select_related("user").all()

            for account in accounts:
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

            self.stdout.write(
                f"Recorded snapshots at {now.isoformat()}"
            )

            time.sleep(300)
