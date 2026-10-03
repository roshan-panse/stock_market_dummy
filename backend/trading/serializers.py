from rest_framework import serializers


class BuySerializer(serializers.Serializer):
    symbol = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)