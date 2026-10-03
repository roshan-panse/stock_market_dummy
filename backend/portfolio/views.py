from decimal import Decimal

from django.db.models import Sum
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Holding
from .serializers import HoldingSerializer


class PortfolioView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = HoldingSerializer

    def get(self, request):
        holdings = Holding.objects.filter(
            user=request.user
        ).select_related("stock")

        holding_data = HoldingSerializer(
            holdings,
            many=True
        ).data

        invested = Decimal("0")
        current_value = Decimal("0")
        sector_values = {}

        for holding in holdings:
            invested_amount = (
                holding.quantity * holding.average_buy_price
            )

            current_amount = (
                holding.quantity * holding.stock.current_price
            )

            invested += invested_amount
            current_value += current_amount

            sector = holding.stock.sector

            sector_values[sector] = (
                sector_values.get(sector, Decimal("0"))
                + current_amount
            )

        profit_loss = current_value - invested

        if invested > 0:
            profit_loss_percent = (
                profit_loss / invested
            ) * Decimal("100")
        else:
            profit_loss_percent = Decimal("0")

        cash = request.user.account.cash_balance
        total_value = cash + current_value

        allocation = [
            {
                "sector": sector,
                "value": float(value),
            }
            for sector, value in sector_values.items()
        ]

        return Response({
            "summary": {
                "totalValue": float(total_value),
                "invested": float(invested),
                "profitLoss": float(profit_loss),
                "profitLossPercent": float(profit_loss_percent),
                "cash": float(cash),
            },
            "holdings": holding_data,
            "allocation": allocation,
        })