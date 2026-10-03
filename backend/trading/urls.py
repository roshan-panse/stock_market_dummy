from django.urls import path
from .views import BuyView

urlpatterns = [
    path("buy/", BuyView.as_view(), name="buy"),
]