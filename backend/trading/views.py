from decimal import Decimal

from django.db import transaction
from django.contrib.auth.models import User

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from stocks.models import Stock
from portfolio.models import Holding

from .models import Transaction
from .serializers import (
    BuySerializer,
    SellSerializer,
    TransactionSerializer,
)


class BuyView(generics.GenericAPIView):
    serializer_class = BuySerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        symbol = serializer.validated_data["symbol"]
        quantity = serializer.validated_data["quantity"]

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

        account = request.user.account

        price = stock.current_price
        total_amount = price * quantity

        if account.cash_balance < total_amount:
            return Response(
                {"detail": "Insufficient cash balance."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            # Deduct cash
            account.cash_balance -= total_amount
            account.save()

            # Get existing holding, or create a new one
            holding, created = Holding.objects.get_or_create(
                user=request.user,
                stock=stock,
                defaults={
                    "quantity": quantity,
                    "average_buy_price": price,
                }
            )

            if not created:
                old_quantity = holding.quantity
                old_average_price = holding.average_buy_price

                new_quantity = old_quantity + quantity

                new_average_price = (
                    (
                        (old_quantity * old_average_price)
                        + (quantity * price)
                    )
                    / new_quantity
                )

                holding.quantity = new_quantity
                holding.average_buy_price = new_average_price
                holding.save()

            # Record transaction
            Transaction.objects.create(
                user=request.user,
                stock=stock,
                transaction_type=Transaction.TransactionType.BUY,
                quantity=quantity,
                price=price,
                total_amount=total_amount,
            )

            return Response(
                
                {
                    "message": f"Bought {quantity} share(s) of {stock.symbol} successfully.",
                    "symbol": stock.symbol,
                    "quantity": quantity,
                    "price": float(price),
                    "totalAmount": float(total_amount),
                    "cashBalance": float(account.cash_balance),
                },
                status=status.HTTP_201_CREATED
)




class SellView(generics.GenericAPIView):
    serializer_class = SellSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        symbol = serializer.validated_data["symbol"]
        quantity = serializer.validated_data["quantity"]

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

        try:
            holding = Holding.objects.get(
                user=request.user,
                stock=stock
            )
        except Holding.DoesNotExist:
            return Response(
                {"detail": "You do not own this stock."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > holding.quantity:
            return Response(
                {"detail": "You cannot sell more shares than you own."},
                status=status.HTTP_400_BAD_REQUEST
            )

        account = request.user.account

        price = stock.current_price
        total_amount = price * quantity

        with transaction.atomic():

            account.cash_balance += total_amount
            account.save()

            holding.quantity -= quantity

            if holding.quantity == 0:
                holding.delete()
            else:
                holding.save()

            Transaction.objects.create(
                user=request.user,
                stock=stock,
                transaction_type=Transaction.TransactionType.SELL,
                quantity=quantity,
                price=price,
                total_amount=total_amount,
            )

        return Response(
            {
                "message": f"Sold {quantity} share(s) of {stock.symbol} successfully.",
                "symbol": stock.symbol,
                "quantity": quantity,
                "price": float(price),
                "totalAmount": float(total_amount),
                "cashBalance": float(account.cash_balance),
            },
            status=status.HTTP_201_CREATED
        )

class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        ).select_related("stock").order_by("-created_at")