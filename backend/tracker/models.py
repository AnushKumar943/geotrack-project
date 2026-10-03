import uuid
from django.db import models

class UserLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_identifier = models.CharField(max_length=100, db_index=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=6)
    longitude = models.DecimalField(max_digits=10, decimal_places=6)
    accuracy = models.FloatField(null=True, blank=True, help_text="Estimated accuracy in metres")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["timestamp"]
        indexes = [models.Index(fields=["user_identifier", "timestamp"])]

    def __str__(self):
        return f"{self.user_identifier} @ {self.latitude}, {self.longitude}"
