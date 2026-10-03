from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserLocation
from .serializers import UserLocationSerializer


class LocationCreateView(generics.CreateAPIView):
    queryset = UserLocation.objects.all()
    serializer_class = UserLocationSerializer


class LatestLocationsView(APIView):
    def get(self, request):
        # Return exactly one newest record for each identifier.
        identifiers = (
            UserLocation.objects.order_by()
            .values_list("user_identifier", flat=True)
            .distinct()
        )
        records = []
        for identifier in identifiers:
            record = (
                UserLocation.objects.filter(user_identifier=identifier)
                .order_by("-timestamp")
                .first()
            )
            if record:
                records.append(record)
        return Response(UserLocationSerializer(records, many=True).data)


class LocationHistoryView(APIView):
    def get(self, request):
        identifier = (request.query_params.get("user_identifier") or "").strip()
        if not identifier:
            return Response(
                {"detail": "Query parameter 'user_identifier' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        locations = UserLocation.objects.filter(user_identifier=identifier).order_by("timestamp")
        return Response(UserLocationSerializer(locations, many=True).data)
