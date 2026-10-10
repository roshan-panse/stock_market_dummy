from datetime import timedelta
import requests
from stocks.market import is_market_open
from django.utils import timezone
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Stock, PriceHistory
from .serializers import StockSerializer, PriceHistorySerializer
from django.db import transaction
from rest_framework.exceptions import APIException
from .models import ChartPrice
from .services.chart_service import fetch_historical_prices
from rest_framework import status

class StockListView(generics.ListAPIView):
    queryset = Stock.objects.filter(is_active=True)
    serializer_class = StockSerializer


class PriceHistoryView(generics.ListAPIView):
    serializer_class = PriceHistorySerializer

    def get_queryset(self):
        symbol = self.kwargs['symbol']
        range_value = self.request.query_params.get('range', '1M')

        queryset = PriceHistory.objects.filter(
            stock__symbol=symbol,
            stock__is_active=True
        )

        today = timezone.now()

        range_days = {
            '1D': 1,
            '1W': 7,
            '1M': 30,
            '6M': 180,
            '1Y': 365,
        }

        days = range_days.get(range_value, 30)

        start_date = today - timedelta(days=days)

        return queryset.filter(
            recorded_at__gte=start_date
        ).order_by('recorded_at')



class MarketStatusView(APIView):
    def get(self, request):
        return Response({
            "isOpen": is_market_open()
        })




class ChartView(APIView):
    def get(self, request, symbol):
        range_value = request.query_params.get("range", "1M")

        if range_value not in ["1W", "1M", "6M"]:
            return Response(
                {"detail": "Range must be 1W, 1M, or 6M."},
                status=400,
            )

        try:
            stock = Stock.objects.get(
                symbol__iexact=symbol,
                is_active=True,
            )
        except Stock.DoesNotExist:
            return Response(
                {"detail": "Stock not found."},
                status=404,
            )

        # Fetch first. Do not delete cached records before this succeeds.
        try:
            prices = fetch_historical_prices(
                stock.symbol,
                range_value,
            )
        except (ValueError, requests.RequestException) as exc:
            return Response(
                {"detail": str(exc)},
                status=502,
            )

        # Replace this stock's cached historical prices safely.
        with transaction.atomic():
            ChartPrice.objects.filter(stock=stock).delete()

            ChartPrice.objects.bulk_create([
                ChartPrice(
                    stock=stock,
                    date=item["date"],
                    price=item["price"],
                )
                for item in prices
            ])

        # Read back the saved records.
        saved_prices = list(
            ChartPrice.objects.filter(stock=stock).order_by("date")
        )

        # For 6M, show one closing price per week for a cleaner chart.
        if range_value == "6M":
            weekly_prices = {}

            for item in saved_prices:
                week_key = item.date.isocalendar()[:2]
                weekly_prices[week_key] = item

            chart_prices = list(weekly_prices.values())
        elif range_value == "1W":
            chart_prices = saved_prices[-5:]
        else:
            chart_prices = saved_prices[-22:]

        return Response([
            {
                "label": item.date.strftime("%b %d"),
                "price": item.price,
            }
            for item in chart_prices
        ])




class IntradayChartView(APIView):
    def get(self, request, symbol):
        try:
            stock = Stock.objects.get(
                symbol__iexact=symbol,
                is_active=True,
            )
        except Stock.DoesNotExist:
            return Response(
                {"detail": "Stock not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        today = timezone.localdate()

        # While the market is open, prefer today's simulated prices.
        if is_market_open():
            prices = PriceHistory.objects.filter(
                stock=stock,
                recorded_at__date=today,
            ).order_by("recorded_at")

        else:
            # After close, find the latest date with saved prices.
            latest = (
                PriceHistory.objects
                .filter(stock=stock)
                .order_by("-recorded_at")
                .first()
            )

            if latest is None:
                return Response([])

            latest_date = timezone.localtime(
                latest.recorded_at
            ).date()

            prices = PriceHistory.objects.filter(
                stock=stock,
                recorded_at__date=latest_date,
            ).order_by("recorded_at")

        # If today's records aren't available yet, use the latest
        # recorded session instead of returning an empty chart.
        if not prices.exists():
            latest = (
                PriceHistory.objects
                .filter(stock=stock)
                .order_by("-recorded_at")
                .first()
            )

            if latest is None:
                return Response([])

            latest_date = timezone.localtime(
                latest.recorded_at
            ).date()

            prices = PriceHistory.objects.filter(
                stock=stock,
                recorded_at__date=latest_date,
            ).order_by("recorded_at")

        return Response([
            {
                "label": timezone.localtime(
                    item.recorded_at
                ).strftime("%H:%M"),
                "price": item.price,
            }
            for item in prices
        ])