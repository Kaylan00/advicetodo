from django.urls import path

from .views import HolidayListView

urlpatterns = [
    path("holidays/", HolidayListView.as_view(), name="holidays"),
]
