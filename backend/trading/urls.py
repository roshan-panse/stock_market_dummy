from django.urls import path
from .views import (
    BuyView,
    SellView,
    TransactionListView,
)

urlpatterns = [
    path("buy/", BuyView.as_view(), name="buy"),
    path("sell/", SellView.as_view(), name="sell"),
    path("transactions/", TransactionListView.as_view(), name="transactions"),
]