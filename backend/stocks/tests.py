
from datetime import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo
from decimal import Decimal
from unittest.mock import patch

from stocks.models import Stock, PriceHistory
from stocks.management.commands.simulate_prices import Command

from django.test import SimpleTestCase, TestCase

from .market import is_market_open


class MarketHoursTests(SimpleTestCase):
    @patch("stocks.market.datetime")
    def test_market_open_during_trading_hours(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 16, 10, 0,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertTrue(is_market_open())

    @patch("stocks.market.datetime")
    def test_market_closed_before_opening(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 16, 9, 0,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertFalse(is_market_open())

    @patch("stocks.market.datetime")
    def test_market_closed_after_closing(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 16, 15, 31,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertFalse(is_market_open())

    @patch("stocks.market.datetime")
    def test_market_closed_on_saturday(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 17, 10, 0,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertFalse(is_market_open())

    @patch("stocks.market.datetime")
    def test_market_closed_on_listed_holiday(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 2, 10, 0,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertFalse(is_market_open())

from datetime import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo

from django.test import SimpleTestCase

from .market import is_market_open


class MarketHoursTests(SimpleTestCase):
    @patch("stocks.market.datetime")
    def test_market_open_during_trading_hours(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 16, 10, 0,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertTrue(is_market_open())

    @patch("stocks.market.datetime")
    def test_market_closed_before_opening(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 16, 9, 0,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertFalse(is_market_open())

    @patch("stocks.market.datetime")
    def test_market_closed_after_closing(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 16, 15, 31,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertFalse(is_market_open())

    @patch("stocks.market.datetime")
    def test_market_closed_on_saturday(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 17, 10, 0,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertFalse(is_market_open())

    @patch("stocks.market.datetime")
    def test_market_closed_on_listed_holiday(self, mock_datetime):
        mock_datetime.now.return_value = datetime(
            2026, 10, 2, 10, 0,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )

        self.assertFalse(is_market_open())




class SimulatedPriceUpdateTests(TestCase):
    def test_price_update_saves_new_price_and_history(self):
        stock = Stock.objects.create(
            symbol="TEST",
            company_name="Test Company",
            sector="Testing",
            previous_close=Decimal("100.00"),
            current_price=Decimal("100.00"),
            is_active=True,
        )

        command = Command()

        # Make the random change exactly +1%.
        with patch(
            "stocks.management.commands.simulate_prices.random.uniform",
            return_value=0.01,
        ):
            command.update_simulated_prices()

        stock.refresh_from_db()

        self.assertEqual(stock.current_price, Decimal("101.00"))
        self.assertEqual(
            PriceHistory.objects.filter(stock=stock).count(),
            1,
        )
        self.assertEqual(
            PriceHistory.objects.get(stock=stock).price,
            Decimal("101.00"),
        )

