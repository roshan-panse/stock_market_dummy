from decimal import Decimal
from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Account
from portfolio.models import Holding, PortfolioSnapshot
from stocks.models import Stock


class PortfolioAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="investor",
            password="test-password-123",
        )
        self.account = Account.objects.create(
            user=self.user,
            cash_balance=Decimal("99760.00"),
        )
        self.stock = Stock.objects.create(
            symbol="TEST",
            company_name="Test Company",
            sector="Technology",
            previous_close=Decimal("100.00"),
            current_price=Decimal("120.00"),
            is_active=True,
        )
        Holding.objects.create(
            user=self.user,
            stock=self.stock,
            quantity=2,
            average_buy_price=Decimal("100.00"),
        )
        self.client.force_authenticate(user=self.user)

    def test_portfolio_summary_calculates_cash_holdings_and_profit_loss(self):
        response = self.client.get("/api/portfolio/")

        self.assertEqual(response.status_code, 200)
        summary = response.data["summary"]

        self.assertEqual(summary["cash"], 99760.0)
        self.assertEqual(summary["invested"], 200.0)
        self.assertEqual(summary["profitLoss"], 40.0)
        self.assertEqual(summary["profitLossPercent"], 20.0)
        self.assertEqual(summary["totalValue"], 100000.0)
        self.assertEqual(len(response.data["holdings"]), 1)
        self.assertEqual(response.data["holdings"][0]["quantity"], 2)
        self.assertEqual(response.data["holdings"][0]["currentValue"], 240.0)
        self.assertEqual(
            response.data["allocation"],
            [{"sector": "Technology", "value": 240.0}],
        )

    def test_empty_portfolio_has_zero_invested_and_profit_loss(self):
        Holding.objects.filter(user=self.user).delete()

        response = self.client.get("/api/portfolio/")

        self.assertEqual(response.status_code, 200)
        summary = response.data["summary"]
        self.assertEqual(summary["cash"], 99760.0)
        self.assertEqual(summary["invested"], 0.0)
        self.assertEqual(summary["profitLoss"], 0.0)
        self.assertEqual(summary["profitLossPercent"], 0.0)
        self.assertEqual(summary["totalValue"], 99760.0)
        self.assertEqual(response.data["holdings"], [])
        self.assertEqual(response.data["allocation"], [])

    def test_portfolio_endpoint_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/portfolio/")

        self.assertEqual(response.status_code, 401)

    def test_performance_endpoint_creates_snapshot_and_returns_it(self):
        response = self.client.get("/api/portfolio/performance/?range=1M")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["value"], 100000.0)
        self.assertEqual(PortfolioSnapshot.objects.filter(user=self.user).count(), 1)

    def test_performance_endpoint_does_not_add_snapshot_within_five_minutes(self):
        PortfolioSnapshot.objects.create(
            user=self.user,
            total_value=Decimal("99000.00"),
            recorded_at=timezone.now() - timedelta(minutes=2),
        )

        response = self.client.get("/api/portfolio/performance/?range=1W")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(PortfolioSnapshot.objects.filter(user=self.user).count(), 1)

    def test_performance_endpoint_rejects_invalid_range(self):
        response = self.client.get("/api/portfolio/performance/?range=2Y")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["detail"], "Invalid range.")

    def test_performance_endpoint_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/portfolio/performance/")

        self.assertEqual(response.status_code, 401)
