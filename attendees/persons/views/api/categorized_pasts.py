import time
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from attendees.persons.models import Attendee, Utility, Past
from attendees.persons.serializers import PastSerializer
from attendees.users.authorization.route_guard import SpyGuard
from attendees.users.models import MenuAuthGroup


class ApiCategorizedPastsViewSet(LoginRequiredMixin, SpyGuard, viewsets.ModelViewSet):
    """
    API endpoint that allows Past(history/experience) of an attendee (in header X-TARGET-ATTENDEE-ID) to be viewed/edited.
    All actions including DELETE needs search params of category__type in order to pass permission check
    Todo 20210530 tried with UserPassesTestMixin failed due to the lack of query_params in ASGIRequest
    """
    serializer_class = PastSerializer

    def get_queryset(self):
        category__type = self.request.query_params.get('category__type', '')
        menu_name = self.__class__.__name__ + category__type.capitalize()  # self.get_view_name() => Api Categorized Pasts List
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
        requester_permission = {'infos__show_secret__' + self.request.user.attendee_uuid_str(): True}

        if past_id:
            qs = target_attendee.pasts.filter(
                Q(organization=self.request.user.organization),
                Q(pk=past_id),
                Q(category__type=category__type),
                (   Q(infos__show_secret={})
                    |
                    Q(infos__show_secret__isnull=True)
                    |
                    Q(**requester_permission)),
            )
        else:
            qs = target_attendee.pasts.filter(
                Q(organization=self.request.user.organization),
                Q(category__type=category__type),
                Q(is_removed=False),
                (   Q(infos__show_secret={})
                    |
                    Q(infos__show_secret__isnull=True)
                    |
                    Q(**requester_permission)),
            )

        if self.request.user.is_counselor():
            return qs
        else:
            return qs.exclude(category__display_name=Past.COUNSELING)

    def perform_create(self, serializer):  #SpyGuard ensured requester & target_attendee belongs to the same org.
        serializer.save(organization=self.request.user.organization)


api_categorized_pasts_viewset = ApiCategorizedPastsViewSet
