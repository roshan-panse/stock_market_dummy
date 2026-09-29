from django.db import models
from django.contrib.auth.models import User
from stocks.models import Stock


class Transaction(models.Model):

    class TransactionType(models.TextChoices):
        BUY = 'BUY', 'Buy'
        SELL = 'SELL', 'Sell'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    transaction_type = models.CharField(
        max_length=4,
        choices=TransactionType.choices
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.transaction_type} - "
            f"{self.stock.symbol}"
        )