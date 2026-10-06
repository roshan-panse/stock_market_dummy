from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from stocks.models import Stock

from .models import Watchlist
from .serializers import WatchlistSerializer


class WatchlistView(generics.ListAPIView):
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(
            user=self.request.user
        ).select_related("stock")


class AddWatchlistView(generics.CreateAPIView):
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        symbol = request.data.get("symbol")

        if not symbol:
            return Response(
                {"detail": "Stock symbol is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            stock = Stock.objects.get(
                symbol=symbol,
                is_active=True
            )
        except Stock.DoesNotExist:
            return Response(
                {"detail": "Stock not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        watchlist, created = Watchlist.objects.get_or_create(
            user=request.user,
            stock=stock
        )

        if not created:
            return Response(
                {"detail": "Stock is already in your watchlist."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            WatchlistSerializer(watchlist).data,
            status=status.HTTP_201_CREATED
        )


class RemoveWatchlistView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(
            user=self.request.user
        )