
from django.urls import path
from .views import PortfolioView, PortfolioPerformanceView

urlpatterns = [
    path("", PortfolioView.as_view(), name="portfolio"),
    path(
        "performance/",
        PortfolioPerformanceView.as_view(),
        name="portfolio-performance",
    ),
]
