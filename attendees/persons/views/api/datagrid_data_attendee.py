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

    # def retrieve(self, request, *args, **kwargs):
    #     attendee_id = self.kwargs.get('pk')
    #     attendee =  Attendee.objects.annotate(
    #                 joined_meets=JSONBAgg(
    #                     Func(
    #                         Value('attendingmeet_id'), 'attendings__attendingmeet__id',
    #                         Value('attending_finish'), 'attendings__attendingmeet__finish',
    #                         Value('attending_start'), 'attendings__attendingmeet__start',
    #                         Value('meet_name'), 'attendings__meets__display_name',
    #                         function='jsonb_build_object'
    #                     ),
    #                 ),
    #                 # contacts=ArrayAgg('attendings__meets__slug', distinct=True),
    #            ).filter(pk=attendee_id)
    #     serializer = AttendeeMinimalSerializer(attendee)
    #     return Response(serializer.data)

    def get_queryset(self):
        """

        """
        current_user = self.request.user  # Todo: guard this API so only admin or scheduler can call it.
        querying_attendee_id = self.kwargs.get('pk')

        return Attendee.objects.annotate(
                    joined_meets=JSONBAgg(
                        Func(
                            Value('attendingmeet_id'), 'attendings__attendingmeet__id',
                            Value('attending_finish'), 'attendings__attendingmeet__finish',
                            Value('attending_start'), 'attendings__attendingmeet__start',
                            Value('meet_name'), 'attendings__meets__display_name',
                            function='jsonb_build_object'
                        ),
                    ),
                    # contacts=ArrayAgg('attendings__meets__slug', distinct=True),
               ).filter(pk=querying_attendee_id)


api_datagrid_data_attendee_viewset = ApiDatagridDataAttendeeViewSet
