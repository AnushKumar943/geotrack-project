from django.contrib import admin
from .models import UserLocation

@admin.register(UserLocation)
class UserLocationAdmin(admin.ModelAdmin):
    list_display = ("user_identifier", "latitude", "longitude", "accuracy", "timestamp")
    list_filter = ("user_identifier", "timestamp")
    search_fields = ("user_identifier",)
    readonly_fields = ("id", "timestamp")
