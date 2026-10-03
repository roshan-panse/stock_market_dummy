from datetime import timedelta

from django.utils import timezone
from rest_framework import generics

from .models import Stock, PriceHistory
from .serializers import StockSerializer, PriceHistorySerializer


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