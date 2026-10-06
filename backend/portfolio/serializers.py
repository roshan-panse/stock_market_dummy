from rest_framework import serializers
from .models import Holding


class HoldingSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol")
    companyName = serializers.CharField(source="stock.company_name")
    sector = serializers.CharField(source="stock.sector")
    currentPrice = serializers.DecimalField(
        source="stock.current_price",
        max_digits=15,
        decimal_places=2
    )

    investedAmount = serializers.SerializerMethodField()
    currentValue = serializers.SerializerMethodField()
    profitLoss = serializers.SerializerMethodField()

    class Meta:
        model = Holding
        fields = [
            "id",
            "symbol",
            "companyName",
            "sector",
            "quantity",
            "average_buy_price",
            "currentPrice",
            "investedAmount",
            "currentValue",
            "profitLoss",
        ]

    def get_investedAmount(self, obj):
        return float(obj.quantity * obj.average_buy_price)

    def get_currentValue(self, obj):
        return float(obj.quantity * obj.stock.current_price)

    def get_profitLoss(self, obj):
        return float(
            obj.quantity *
            (obj.stock.current_price - obj.average_buy_price)
        )