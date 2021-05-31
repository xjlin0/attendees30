import time
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from attendees.persons.models import Attendee, Utility
from attendees.persons.serializers import PastSerializer
from attendees.users.authorization.route_guard import SpyGuard
from attendees.users.models import MenuAuthGroup


class ApiCategorizedPastsViewSet(LoginRequiredMixin, SpyGuard, viewsets.ModelViewSet):
    """
    API endpoint that allows Past(history/experience) of an attendee (in header X-TARGET-ATTENDEE-ID) to be viewed/edited.
    Todo 20210530 tried with UserPassesTestMixin failed due to the lack of query_params in ASGIRequest
    """
    serializer_class = PastSerializer

    def get_queryset(self):
        category__type = self.request.query_params.get('category__type', '')
        menu_name = self.__class__.__name__ + category__type.capitalize()
        url_name = Utility.underscore(menu_name)

        if not MenuAuthGroup.objects.filter(
                    menu__organization=self.request.user.organization,
                    menu__category='API',
                    menu__url_name=url_name
                ).exists():
            time.sleep(2)
            raise PermissionDenied(detail="Your user group doesn't have permissions for this")

        target_attendee = get_object_or_404(Attendee, pk=self.request.META.get('HTTP_X_TARGET_ATTENDEE_ID'))
        past_id = self.kwargs.get('pk')
        requester_permission = {'infos__show_secret__' + self.request.user.attendee_uuid_str() + self.request.user.organization.slug: True}

        if past_id:
            return target_attendee.pasts.filter(
                Q(pk=past_id),
                Q(category__type=category__type),
                (   Q(infos__show_secret={})
                    |
                    Q(**requester_permission)),
            )
        else:
            return target_attendee.pasts.filter(
                Q(category__type=category__type),
                (   Q(infos__show_secret={})
                    |
                    Q(**requester_permission)),
            )


api_categorized_pasts_viewset = ApiCategorizedPastsViewSet
