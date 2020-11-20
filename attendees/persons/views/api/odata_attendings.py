

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework.utils import json
from rest_framework.viewsets import ModelViewSet

from attendees.persons.models import Attending
from attendees.persons.services import AttendingService
from attendees.persons.serializers import AttendingMinimalSerializer


@method_decorator([login_required], name='dispatch')
class ApiODataAttendingsViewSet(ModelViewSet):  # from GenericAPIView
    """
    API endpoint that allows Attending to be viewed or edited.
    """
    serializer_class = AttendingMinimalSerializer

    # Todo: probably also need to check if the assembly belongs to the division
    def get_queryset(self):
        """
        still need to work with filter and grouping and move to service layer
        filter = '["attendee","contains","Lydia"]'  or '[["id","=",3],"and",["attendee","contains","John"]]'
        group =  '[{"selector":"attendee.division","desc":false,"isExpanded":false}]'
        :return: queryset ordered by query params from DataGrid
        """
        current_user_organization = self.request.user.organization
        orderby_string = self.request.query_params.get('sort', '[{"selector":"id","desc":false}]')  # default order
        orderby_list = []
        for orderby_dict in json.loads(orderby_string):
            direction = '-' if orderby_dict.get('desc', False) else ''
            field = orderby_dict.get('selector', 'id').replace('.', '__')  # convert attendee.division to attendee__division
            orderby_list.append(direction + field)

        meet_slugs = ['d7c8Fd-cfcc-congregation-roaster', 'd7c8Fd-cfcc-congregation-directory',
                      'd7c8Fd-cfcc-congregation-member', 'd7c8Fd-cfcc-congregation-care']
        character_slugs = ['d7c8Fd-cfcc-congregation-data-general', 'd7c8Fd-cfcc-congregation-data-member',
                           'd7c8Fd-cfcc-congregation-data-directory']
        assembly_slug = 'cfcc-congregation-data'

        return Attending.objects.filter(
            attendee__division__organization=current_user_organization,
            meets__slug__in=meet_slugs,
            attendingmeet__character__slug__in=character_slugs,
            meets__assembly__slug=assembly_slug,
        ).order_by(*orderby_list).distinct()


api_odata_attendings_viewset = ApiODataAttendingsViewSet
