from rest_framework import serializers
from .models import Transaction

class BuySerializer(serializers.Serializer):
    symbol = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)


class SellSerializer(serializers.Serializer):
    symbol = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
class TransactionSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.symbol")
    companyName = serializers.CharField(source="stock.company_name")

    type = serializers.CharField(source="transaction_type")
    date = serializers.DateTimeField(source="created_at")
    total = serializers.DecimalField(
        source="total_amount",
        max_digits=15,
        decimal_places=2
    )

    price = serializers.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    class Meta:
        model = Transaction
        fields = [
            "id",
            "symbol",
            "companyName",
            "type",
            "quantity",
            "price",
            "total",
            "date",
        ]