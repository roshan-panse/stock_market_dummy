from django.urls import path

from .views import (
    StockListView,
    PriceHistoryView,
    MarketStatusView,
)

urlpatterns = [
    path("", StockListView.as_view(), name="stock-list"),
    path("market-status/", MarketStatusView.as_view(), name="market-status"),
    path("<str:symbol>/price-history/", PriceHistoryView.as_view(), name="price-history"),
]