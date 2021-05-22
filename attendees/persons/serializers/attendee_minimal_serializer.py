from pathlib import Path

from attendees.persons.models import Attendee
from rest_framework import serializers

from attendees.persons.serializers import FamilyAttendeeSerializer
from attendees.whereabouts.serializers import PlaceSerializer


class AttendeeMinimalSerializer(serializers.ModelSerializer):
    places = PlaceSerializer(many=True, read_only=True)
    familyattendee_set = FamilyAttendeeSerializer(read_only=True, many=True)
    photo = serializers.ImageField(use_url=True, required=False)   # trying DevExtreme dxFileUploader https://supportcenter.devexpress.com/ticket/details/t404408
    joined_meets = serializers.JSONField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(many=False, read_only=True)  # For MVP, Admin UI can handle this use case. Todo: when non admins start to use app, admin need to edit this on UI

    class Meta:
        model = Attendee
        # fields = '__all__'
        fields = [f.name for f in model._meta.fields if f.name not in ['is_removed']] + [
            'joined_meets',
            # 'display_label',
            # 'division_label',
            # 'parents_notifiers_names',
            'familyattendee_set',
            # 'caregiver_email_addresses',
            'places',
        ]

    def create(self, validated_data):
        """
        Create and return a new `Attendee` instance, given the validated data.
        """

        attendee_id = self._kwargs['data'].get('attendee-id')
        deleting_photo = self._kwargs['data'].get('photo-clear', None)

        instance = Attendee.objects.get(pk=attendee_id)
        if instance:
            if deleting_photo or validated_data.get('photo', None):
                old_photo = instance.photo
                if old_photo:
                    old_file = Path(old_photo.path)
                    old_file.unlink(missing_ok=True)
                if deleting_photo:
                    validated_data['photo'] = None

            obj, created = Attendee.objects.update_or_create(
                id=attendee_id,
                defaults=validated_data,
            )

            return obj
        else:
            return None

    def update(self, instance, validated_data):
        """
        Update and return an existing `AttendingMeet` instance, given the validated data.

        """
        deleting_photo = self._kwargs['data'].get('photo-clear', None)

        if instance:
            if deleting_photo or validated_data.get('photo', None):
                old_photo = instance.photo
                if old_photo:
                    old_file = Path(old_photo.path)
                    old_file.unlink(missing_ok=True)
                if deleting_photo:
                    validated_data['photo'] = None

            obj, created = Attendee.objects.update_or_create(
                id=instance.id,
                defaults=validated_data,
            )

        return obj

