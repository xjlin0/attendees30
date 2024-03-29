from django.urls import path, include
from rest_framework import routers

from attendees.occasions.views import (
    datagrid_assembly_all_attendances_list_view,
    datagrid_user_organization_attendances_list_view,
    datagrid_coworker_organization_attendances_list_view,
    gatherings_list_view,
    attendances_list_view,
    organization_meets_viewset,
    api_family_organization_attendances_viewset,
    api_family_organization_characters_viewset,
    api_family_organization_gatherings_viewset,
    api_assembly_meet_attendances_viewset,
    api_assembly_meet_characters_viewset,
    api_assembly_meet_teams_viewset,
    api_assembly_meet_gatherings_viewset,
    series_gatherings_viewset,
    api_organization_meet_team_viewset,
    api_organization_meet_gatherings_viewset,
    api_user_assembly_characters_viewset,
    api_user_assembly_meets_viewset,
    api_user_assembly_viewset,
    api_coworker_organization_attendances_viewset,
)


app_name = "occasions"

router = routers.DefaultRouter()
router.register(
    'api/(?P<division_slug>.+)/(?P<assembly_slug>.+)/assembly_meet_attendances',
    api_assembly_meet_attendances_viewset,
    basename='attendance',
)
router.register(
    'api/(?P<division_slug>.+)/(?P<assembly_slug>.+)/assembly_meet_characters',
    api_assembly_meet_characters_viewset,
    basename='character',
)
router.register(
    'api/(?P<division_slug>.+)/(?P<assembly_slug>.+)/assembly_meet_teams',
    api_assembly_meet_teams_viewset,
    basename='team',
)
router.register(
    'api/(?P<division_slug>.+)/(?P<assembly_slug>.+)/assembly_meet_gatherings',
    api_assembly_meet_gatherings_viewset,
    basename='gathering',
)
router.register(
    'api/organization_meet_teams',
    api_organization_meet_team_viewset,
    basename='team',
)
router.register(
    'api/organization_team_gatherings',
    api_organization_meet_gatherings_viewset,
    basename='gathering',
)
router.register(
    'api/series_gatherings',
    series_gatherings_viewset,
    basename='series_gatherings',  # request.resolver_match.url_name will be series_gatherings-list
)
router.register(
    'api/user_assembly_characters',
    api_user_assembly_characters_viewset,
    basename='character',
)
router.register(
    'api/user_assembly_meets',
    api_user_assembly_meets_viewset,
    basename='meet',
)
router.register(
    'api/organization_meets',
    organization_meets_viewset,
    basename='meet',
)
router.register(
    'api/coworker_organization_attendances',
    api_coworker_organization_attendances_viewset,
    basename='attendance',
)
router.register(
    'api/family_organization_attendances',
    api_family_organization_attendances_viewset,
    basename='attendance',
)
router.register(
    'api/family_organization_characters',
    api_family_organization_characters_viewset,
    basename='character',
)
router.register(
    'api/family_organization_gatherings',
    api_family_organization_gatherings_viewset,
    basename='gathering',
)
router.register(
    'api/user_assemblies',
    api_user_assembly_viewset,
    basename='assembly',
)


urlpatterns = [
    path('', include(router.urls)),
    path(
        "<slug:division_slug>/<slug:assembly_slug>/datagrid_assembly_all_attendances/",
        view=datagrid_assembly_all_attendances_list_view,
        name="datagrid_assembly_all_attendances",
    ),
    path(
        'datagrid_coworker_organization_attendances/',
        view=datagrid_coworker_organization_attendances_list_view,
        name='datagrid_coworker_organization_attendances',
    ),
    path(
        'datagrid_user_organization_attendances/',
        kwargs={'attendee_id': None},
        view=datagrid_user_organization_attendances_list_view,
        name='datagrid_user_organization_attendances',
    ),
    path(
        'datagrid_user_organization_attendances/<str:attendee_id>',
        view=datagrid_user_organization_attendances_list_view,
        name='datagrid_user_organization_attendances',
    ),
    path(
        'gatherings/',
        view=gatherings_list_view,
        name='gatherings_list_view',
    ),
    path(
        'attendances/',
        view=attendances_list_view,
        name='attendances_list_view',
    ),
]
