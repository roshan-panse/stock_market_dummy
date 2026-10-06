from rest_framework import serializers

from .models import Watchlist


class WatchlistSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol")
    companyName = serializers.CharField(source="stock.company_name")
    currentPrice = serializers.DecimalField(
        source="stock.current_price",
        max_digits=15,
        decimal_places=2
    )
    previousClose = serializers.DecimalField(
        source="stock.previous_close",
        max_digits=15,
        decimal_places=2
    )

    class Meta:
        model = Watchlist
        fields = [
            "id",
            "symbol",
            "companyName",
            "currentPrice",
            "previousClose",
            "created_at",
        ]