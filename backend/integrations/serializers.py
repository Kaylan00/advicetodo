from rest_framework import serializers


class HolidaySerializer(serializers.Serializer):
    date = serializers.DateField(read_only=True)
    name = serializers.CharField(read_only=True)
