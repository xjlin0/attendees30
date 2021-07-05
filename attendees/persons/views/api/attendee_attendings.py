import time

from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from attendees.occasions.models import Attendance
from attendees.persons.models import Attending, Attendee
from attendees.persons.serializers.attending_minimal_serializer import AttendingMinimalSerializer


class ApiAttendeeAttendingsViewSet(LoginRequiredMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows Attending of an attendee to be viewed or edited.
    """
    serializer_class = AttendingMinimalSerializer

    def get_queryset(self):
        target_attendee = get_object_or_404(Attendee, pk=self.request.META.get('HTTP_X_TARGET_ATTENDEE_ID'))
        current_user_organization = self.request.user.organization
        is_self = current_user_organization and self.request.user.attendee and self.request.user.attendee == target_attendee
        is_privileged = current_user_organization and self.request.user.privileged()
        if target_attendee and (is_self or is_privileged):  # Todo: scheduler should be able to do it too
            attending_id = self.kwargs.get('pk')
            qs = Attending.objects.filter(
                attendee=target_attendee,
                attendee__division__organization=current_user_organization
            )  # With correct data this query will only work if current user's org is the same as targeting attendee's

            if attending_id:
                return qs.filter(pk=attending_id)
            else:
                return qs

        #     return AttendingService.by_assembly_meet_characters(
        #         assembly_slug=self.kwargs['assembly_slug'],
        #         meet_slugs=self.request.query_params.getlist('meets[]', []),
        #         character_slugs=self.request.query_params.getlist('characters[]', []),
        #     )
        # return Attending.objects.select_related().prefetch_related().filter(
        #     meets__slug__in=meet_slugs,
        #     attendingmeet__character__slug__in=character_slugs,
        #     meets__assembly__slug=assembly_slug,
        # ).distinct()

        else:
            time.sleep(2)
            raise PermissionDenied(detail='Are you data admin or counselor?')

    def perform_create(self, serializer):
        target_attendee = get_object_or_404(Attendee, pk=self.request.META.get('HTTP_X_TARGET_ATTENDEE_ID'))
        if target_attendee.under_same_org_with(self.request.user.attendee and self.request.user.attendee.id):
            serializer.save(attendee=target_attendee)

        else:
            time.sleep(2)
            raise PermissionDenied(detail="Can't create attending across different organization")

    def perform_destroy(self, instance):
        target_attendee = get_object_or_404(Attendee, pk=self.request.META.get('HTTP_X_TARGET_ATTENDEE_ID'))
        if self.request.user.privileged_to_edit(target_attendee.id):
            for attendingmeet in instance.attendingmeet_set.all():
                Attendance.objects.filter(gathering__meet=attendingmeet.meet, attending=attendingmeet.attending).delete()
            instance.attendingmeet_set.all().delete()
            registration = instance.registration
            instance.delete()
            if not registration.attending_set.exists():
                registration.delete()

        else:
            time.sleep(2)
            raise PermissionDenied(detail='Not allowed to delete attendings')


api_attendee_attendings_viewset = ApiAttendeeAttendingsViewSet
