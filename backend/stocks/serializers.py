from rest_framework import serializers
from .models import Stock, PriceHistory


class StockSerializer(serializers.ModelSerializer):
    companyName = serializers.CharField(source='company_name')
    previousClose = serializers.DecimalField(
        source='previous_close',
        max_digits=15,
        decimal_places=2
    )
    currentPrice = serializers.DecimalField(
        source='current_price',
        max_digits=15,
        decimal_places=2
    )
    change = serializers.SerializerMethodField()
    changePercent = serializers.SerializerMethodField()
    open = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = [
            'id',
            'symbol',
            'companyName',
            'sector',
            'previousClose',
            'currentPrice',
            'change',
            'changePercent',
            'open',
            'is_active',
        ]

    def get_change(self, obj):
        return obj.current_price - obj.previous_close

    def get_changePercent(self, obj):
        if obj.previous_close == 0:
            return 0

        return (
            (obj.current_price - obj.previous_close)
            / obj.previous_close
        ) * 100

    def get_open(self, obj):
        # We don't currently store opening price in the database.
        # For now, use previous close as a placeholder.
        return obj.previous_close
class PriceHistorySerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = PriceHistory
        fields = [
            'id',
            'label',
            'price',
        ]

    def get_label(self, obj):
        return obj.recorded_at.strftime('%d %b')

    def get_price(self, obj):
        return float(obj.price)