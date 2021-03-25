from django.contrib.postgres.aggregates.general import ArrayAgg, JSONBAgg

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Func, Value
from django.shortcuts import get_object_or_404

from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response

from attendees.persons.models import Attendee
from attendees.persons.services import AttendeeService
from attendees.persons.serializers import AttendeeMinimalSerializer


class ApiDatagridDataAttendeeViewSet(LoginRequiredMixin, ModelViewSet):  # from GenericAPIView
    """
    API endpoint that allows single attendee to be viewed or edited.
    """
    serializer_class = AttendeeMinimalSerializer
    # queryset = Attendee.objects.all()

    def retrieve(self, request, *args, **kwargs):
        attendee_id = self.request.query_params.get('attendee_id')
        print("entering retrieve ... ")
        attendee = Attendee.objects.annotate(
            joined_meets=JSONBAgg(
                Func(
                    Value('slug'), 'attendings__meets__slug',
                    Value('display_name'), 'attendings__meets__display_name',
                    function='jsonb_build_object'
                ),
            )
                    # joined_meets=ArrayAgg('attendings__meets__slug', distinct=True),
                   ).filter(pk=attendee_id).first()
        # attendee = get_object_or_404(queryset)
        serializer = AttendeeMinimalSerializer(attendee)
        return Response(serializer.data)

    def get_queryset(self):
        """

        """
        current_user = self.request.user
        querying_attendee_id = self.kwargs.get('attendee_id')
        # return AttendeeService.single_record(
        #     current_user=current_user,
        #     attendee_id=querying_attendee_id,
        # )

        return Attendee.objects.annotate(
                    joined_meets=JSONBAgg(
                        Func(
                            Value('attending_id'), 'attendings__id',
                            Value('reggistration_id'), 'attendings__registration__id',
                            Value('attendingmeet_id'), 'attendings__attendingmeet__id',
                            Value('attending_start'), 'attendings__attendingmeet__start',
                            Value('attending_finish'), 'attendings__attendingmeet__finish',
                            Value('meet_slug'), 'attendings__meets__slug',
                            Value('meet_name'), 'attendings__meets__display_name',
                            function='jsonb_build_object'
                        ),
                    )
                    # joined_meets=ArrayAgg('attendings__meets__slug', distinct=True),
               ).filter(pk=querying_attendee_id)


api_datagrid_data_attendee_viewset = ApiDatagridDataAttendeeViewSet
