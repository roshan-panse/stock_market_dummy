from django.db import models
from django.contrib.auth.models import User
from stocks.models import Stock


class Watchlist(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='watchlist'
    )

    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='watchlisted_by'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'stock'],
                name='unique_user_stock_watchlist'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.stock.symbol}"