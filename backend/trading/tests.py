from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Account
from portfolio.models import Holding
from stocks.models import Stock
from trading.models import Transaction


class TradingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="trader",
            password="test-password-123",
        )
        self.account = Account.objects.create(
            user=self.user,
            cash_balance=Decimal("100000.00"),
        )
        self.stock = Stock.objects.create(
            symbol="TEST",
            company_name="Test Company",
            sector="Technology",
            previous_close=Decimal("100.00"),
            current_price=Decimal("100.00"),
            is_active=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_buy_deducts_cash_and_creates_holding_and_transaction(self):
        response = self.client.post(
            "/api/trading/buy/",
            {"symbol": "TEST", "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.account.refresh_from_db()
        holding = Holding.objects.get(user=self.user, stock=self.stock)
        transaction_record = Transaction.objects.get(user=self.user)

        self.assertEqual(self.account.cash_balance, Decimal("99800.00"))
        self.assertEqual(holding.quantity, 2)
        self.assertEqual(holding.average_buy_price, Decimal("100.00"))
        self.assertEqual(transaction_record.transaction_type, Transaction.TransactionType.BUY)
        self.assertEqual(transaction_record.quantity, 2)
        self.assertEqual(transaction_record.total_amount, Decimal("200.00"))
        self.assertEqual(response.data["cashBalance"], 99800.0)

    def test_buy_updates_weighted_average_price_for_existing_holding(self):
        Holding.objects.create(
            user=self.user,
            stock=self.stock,
            quantity=2,
            average_buy_price=Decimal("100.00"),
        )
        self.stock.current_price = Decimal("120.00")
        self.stock.save(update_fields=["current_price"])

        response = self.client.post(
            "/api/trading/buy/",
            {"symbol": "TEST", "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        holding = Holding.objects.get(user=self.user, stock=self.stock)
        self.account.refresh_from_db()

        self.assertEqual(holding.quantity, 3)
        self.assertEqual(holding.average_buy_price, Decimal("106.67"))
        self.assertEqual(self.account.cash_balance, Decimal("99880.00"))
        self.assertEqual(Transaction.objects.filter(user=self.user).count(), 1)

    def test_buy_rejects_insufficient_cash_without_changing_data(self):
        self.account.cash_balance = Decimal("50.00")
        self.account.save(update_fields=["cash_balance"])

        response = self.client.post(
            "/api/trading/buy/",
            {"symbol": "TEST", "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.account.refresh_from_db()
        self.assertEqual(self.account.cash_balance, Decimal("50.00"))
        self.assertFalse(Holding.objects.filter(user=self.user).exists())
        self.assertFalse(Transaction.objects.filter(user=self.user).exists())

    def test_buy_rejects_unknown_or_inactive_stock(self):
        unknown_response = self.client.post(
            "/api/trading/buy/",
            {"symbol": "MISSING", "quantity": 1},
            format="json",
        )
        self.assertEqual(unknown_response.status_code, 404)

        self.stock.is_active = False
        self.stock.save(update_fields=["is_active"])
        inactive_response = self.client.post(
            "/api/trading/buy/",
            {"symbol": "TEST", "quantity": 1},
            format="json",
        )
        self.assertEqual(inactive_response.status_code, 404)
        self.assertEqual(Transaction.objects.count(), 0)

    def test_buy_rejects_zero_or_negative_quantity(self):
        for quantity in (0, -1):
            with self.subTest(quantity=quantity):
                response = self.client.post(
                    "/api/trading/buy/",
                    {"symbol": "TEST", "quantity": quantity},
                    format="json",
                )
                self.assertEqual(response.status_code, 400)

        self.assertEqual(Transaction.objects.count(), 0)

    def test_sell_adds_cash_and_reduces_holding(self):
        Holding.objects.create(
            user=self.user,
            stock=self.stock,
            quantity=3,
            average_buy_price=Decimal("90.00"),
        )
        self.stock.current_price = Decimal("110.00")
        self.stock.save(update_fields=["current_price"])

        response = self.client.post(
            "/api/trading/sell/",
            {"symbol": "TEST", "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.account.refresh_from_db()
        holding = Holding.objects.get(user=self.user, stock=self.stock)
        transaction_record = Transaction.objects.get(user=self.user)

        self.assertEqual(self.account.cash_balance, Decimal("100110.00"))
        self.assertEqual(holding.quantity, 2)
        self.assertEqual(transaction_record.transaction_type, Transaction.TransactionType.SELL)
        self.assertEqual(transaction_record.total_amount, Decimal("110.00"))

    def test_selling_all_shares_removes_holding(self):
        Holding.objects.create(
            user=self.user,
            stock=self.stock,
            quantity=2,
            average_buy_price=Decimal("100.00"),
        )

        response = self.client.post(
            "/api/trading/sell/",
            {"symbol": "TEST", "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertFalse(Holding.objects.filter(user=self.user, stock=self.stock).exists())
        self.account.refresh_from_db()
        self.assertEqual(self.account.cash_balance, Decimal("100200.00"))

    def test_sell_rejects_quantity_greater_than_holding(self):
        Holding.objects.create(
            user=self.user,
            stock=self.stock,
            quantity=1,
            average_buy_price=Decimal("100.00"),
        )

        response = self.client.post(
            "/api/trading/sell/",
            {"symbol": "TEST", "quantity": 2},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.account.refresh_from_db()
        self.assertEqual(self.account.cash_balance, Decimal("100000.00"))
        self.assertEqual(Holding.objects.get(user=self.user, stock=self.stock).quantity, 1)
        self.assertFalse(Transaction.objects.filter(user=self.user).exists())

    def test_sell_rejects_stock_not_owned(self):
        response = self.client.post(
            "/api/trading/sell/",
            {"symbol": "TEST", "quantity": 1},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Transaction.objects.filter(user=self.user).exists())

    def test_trading_endpoints_require_authentication(self):
        self.client.force_authenticate(user=None)

        buy_response = self.client.post(
            "/api/trading/buy/",
            {"symbol": "TEST", "quantity": 1},
            format="json",
        )
        sell_response = self.client.post(
            "/api/trading/sell/",
            {"symbol": "TEST", "quantity": 1},
            format="json",
        )

        self.assertEqual(buy_response.status_code, 401)
        self.assertEqual(sell_response.status_code, 401)
