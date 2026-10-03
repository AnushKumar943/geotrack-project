from django.urls import path
from .views import LocationCreateView, LatestLocationsView, LocationHistoryView

urlpatterns = [
    path("locations/", LocationCreateView.as_view(), name="location-create"),
    path("locations/latest/", LatestLocationsView.as_view(), name="locations-latest"),
    path("locations/history/", LocationHistoryView.as_view(), name="locations-history"),
]
