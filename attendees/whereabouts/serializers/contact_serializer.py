
from rest_framework import serializers

from attendees.whereabouts.models import Contact


class ContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contact
        fields = '__all__'

