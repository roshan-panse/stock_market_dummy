from django.urls import path
from .views import StockListView, PriceHistoryView

urlpatterns = [
    path('', StockListView.as_view(), name='stock-list'),
    path(
        '<str:symbol>/price-history/',
        PriceHistoryView.as_view(),
        name='price-history',
    ),
]