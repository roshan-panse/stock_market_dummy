from decimal import Decimal
from datetime import timedelta

from django.utils import timezone
from rest_framework.views import APIView

from .models import PortfolioSnapshot
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



class PortfolioPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        range_value = request.query_params.get("range", "1Y")

        days_by_range = {
            "1D": 1,
            "1W": 7,
            "1M": 30,
            "6M": 180,
            "1Y": 365,
        }

        if range_value not in days_by_range:
            return Response(
                {"detail": "Invalid range."},
                status=400,
            )

        now = timezone.now()
        cutoff = now - timedelta(
            days=days_by_range[range_value]
        )

        holdings = Holding.objects.filter(
            user=request.user
        ).select_related("stock")

        invested_value = sum(
            (
                holding.quantity
                * holding.stock.current_price
                for holding in holdings
            ),
            Decimal("0"),
        )

        cash = request.user.account.cash_balance
        current_total = cash + invested_value

        # Save a snapshot at most once every 5 minutes per user.
        latest = PortfolioSnapshot.objects.filter(
            user=request.user
        ).order_by("-recorded_at").first()

        if (
            latest is None
            or now - latest.recorded_at >= timedelta(minutes=5)
        ):
            PortfolioSnapshot.objects.create(
                user=request.user,
                total_value=current_total,
                recorded_at=now,
            )

        snapshots = PortfolioSnapshot.objects.filter(
            user=request.user,
            recorded_at__gte=cutoff,
        ).order_by("recorded_at")

        return Response([
            {
                "label": snapshot.recorded_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%b %d"),
                "value": float(snapshot.total_value),
            }
            for snapshot in snapshots
        ])
