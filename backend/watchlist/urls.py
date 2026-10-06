from django.urls import path

from .views import (
    WatchlistView,
    AddWatchlistView,
    RemoveWatchlistView,
)

urlpatterns = [
    path("", WatchlistView.as_view(), name="watchlist"),
    path("add/", AddWatchlistView.as_view(), name="watchlist-add"),
    path(
        "<int:pk>/",
        RemoveWatchlistView.as_view(),
        name="watchlist-remove",
    ),
]