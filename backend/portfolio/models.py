from django.db import models
from django.contrib.auth.models import User
from stocks.models import Stock


class Holding(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='holdings'
    )

    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='holdings'
    )

    quantity = models.PositiveIntegerField()

    average_buy_price = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'stock'],
                name='unique_user_stock_holding'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.stock.symbol}"