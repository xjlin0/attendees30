import time
from itertools import groupby
from operator import itemgetter

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import F, Q

from rest_framework import viewsets
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.utils import json
from rest_framework.response import Response

from attendees.occasions.models import Meet
from attendees.occasions.serializers.meet import MeetSerializer


class OrganizationMeetsViewSet(LoginRequiredMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows all Meet in current user's organization filtered by date to be viewed or edited.
    Todo 20210711 only coworkers/organizers can see all Meets, general users should only see what they attended
    Todo 20210815 if limiting by meet's shown_audience, non-coworker assigned to non-public meets won't show
    """
    serializer_class = MeetSerializer

    def transform_result(self, data, grouping):
        if grouping:
            grouping_data = []
            for c_title, items in groupby(data, itemgetter(grouping)):
                grouping_data.append({"key": c_title, "items": list(items)})
            return grouping_data

        else:
            return data

    def list(self, request, *args, **kwargs):
        grouping = request.query_params.get('grouping')
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(self.transform_result(serializer.data, grouping))

        serializer = self.get_serializer(queryset, many=True)
        return Response(self.transform_result(serializer.data, grouping))

    def get_queryset(self):
        current_user_organization = self.request.user.organization

        if current_user_organization:
            start = self.request.query_params.get('start')
            finish = self.request.query_params.get('finish')

            extra_filter = Q(assembly__division__organization=current_user_organization)

            if start:
                extra_filter.add((Q(finish__isnull=True) | Q(finish__gte=start)), Q.AND)

            if finish:
                extra_filter.add((Q(start__isnull=True) | Q(start__lte=finish)), Q.AND)

            return Meet.objects.filter(extra_filter).annotate(
                assembly_name=F('assembly__display_name'),
            ).order_by('assembly_name')

        else:
            time.sleep(2)
            raise AuthenticationFailed(detail='Have you registered any events of the organization?')


organization_meets_viewset = OrganizationMeetsViewSet
