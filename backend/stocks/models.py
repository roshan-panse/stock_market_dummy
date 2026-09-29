from django.db import models


class Stock(models.Model):
    symbol = models.CharField(max_length=20, unique=True)
    company_name = models.CharField(max_length=200)
    sector = models.CharField(max_length=100)

    previous_close = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    current_price = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"



class PriceHistory(models.Model):
    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        related_name='price_history'
    )

    price = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    volume = models.BigIntegerField(
        null=True,
        blank=True
    )

    recorded_at = models.DateTimeField()

    class Meta:
        ordering = ['recorded_at']

    def __str__(self):
        return f"{self.stock.symbol} - {self.price}"