from rest_framework import serializers
from .models import UserLocation

class UserLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLocation
        fields = ["id", "user_identifier", "latitude", "longitude", "accuracy", "timestamp"]
        read_only_fields = ["id", "timestamp"]

    def validate_user_identifier(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("This field cannot be blank.")
        if len(value) > 100:
            raise serializers.ValidationError("Must be 100 characters or fewer.")
        return value

    def validate_latitude(self, value):
        if not -90 <= float(value) <= 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if not -180 <= float(value) <= 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value

    def validate_accuracy(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Accuracy cannot be negative.")
        return value
