from django.urls import path

from .views import (
    StockListView,
    PriceHistoryView,
    MarketStatusView,
    ChartView,
    IntradayChartView,
)

urlpatterns = [
    path("", StockListView.as_view(), name="stock-list"),
    path("market-status/", MarketStatusView.as_view(), name="market-status"),
    path("<str:symbol>/price-history/", PriceHistoryView.as_view(), name="price-history"),
    path("<str:symbol>/chart/", ChartView.as_view(), name="stock-chart"),
    path(
     "<str:symbol>/intraday/",
     IntradayChartView.as_view(),
     name="stock-intraday",
    ),
]