from django.urls import path, include
from rest_framework import routers

from attendees.persons.views import (
    api_all_relations_viewset,
    api_assembly_meet_attendings_viewset,
    api_attendee_families_viewset,
    api_data_attendings_viewset,
    api_datagrid_data_attendees_viewset,
    api_datagrid_data_attendee_viewset,
    api_datagrid_data_attendingmeet_viewset,
    api_assembly_meet_attendees_viewset,
    api_datagrid_data_familyattendees_viewset,
    datagrid_assembly_all_attendings_list_view,
    datagrid_assembly_data_attendees_list_view,
    datagrid_assembly_data_attendings_list_view,
    datagrid_attendee_update_view,
    info_of_attendee_create_view,
    api_attendee_attendings_viewset,
    attendee_update_view,
    attendees_update_view,
    attendee_detail_view,
    api_user_meet_attendings_viewset,
    api_family_organization_attendings_viewset,
)

app_name = "persons"

router = routers.DefaultRouter()  # (trailing_slash=False)
router.register(
    'api/datagrid_data_attendees',
    api_datagrid_data_attendees_viewset,
    basename='attending',
)
router.register(
    'api/(?P<division_slug>.+)/(?P<assembly_slug>.+)/assembly_meet_attendings',
    api_assembly_meet_attendings_viewset,
    basename='attending',
)
router.register(
    'api/attendee_attendings',
    api_attendee_attendings_viewset,
    basename='attending',
)
router.register(
    'api/(?P<division_slug>.+)/(?P<assembly_slug>.+)/data_attendings',
    api_data_attendings_viewset,
    basename='attending',
)
router.register(
    'api/(?P<division_slug>.+)/(?P<assembly_slug>.+)/assembly_meet_attendees',
    api_assembly_meet_attendees_viewset,
    basename='attendee',
)
router.register(
    'api/user_meet_attendings',
    api_user_meet_attendings_viewset,
    basename='attending',
)
router.register(
    'api/family_organization_attendings',
    api_family_organization_attendings_viewset,
    basename='attending',
)
router.register(
    'api/datagrid_data_attendee',
    api_datagrid_data_attendee_viewset,
    basename='attendee',
)
router.register(
    'api/datagrid_data_attendingmeet/(?P<attendingmeet_id>.+)',
    api_datagrid_data_attendingmeet_viewset,
    basename='attendingmeet',
)
router.register(
    'api/datagrid_data_familyattendees',
    api_datagrid_data_familyattendees_viewset,
    basename='familyattendee',
)
router.register(
    'api/all_relations',
    api_all_relations_viewset,
    basename='relation',
)
router.register(
    'api/attendee_families',
    api_attendee_families_viewset,
    basename='family',
)

urlpatterns = [
    path('',
        include(router.urls)
    ),

    path(
        "<slug:division_slug>/<slug:assembly_slug>/datagrid_assembly_all_attendings/",
        view=datagrid_assembly_all_attendings_list_view,
        name="datagrid_assembly_all_attendings",
    ),

    path(
        "<slug:division_slug>/<slug:assembly_slug>/datagrid_assembly_data_attendees/",
        view=datagrid_assembly_data_attendees_list_view,
        name="datagrid_assembly_data_attendees",
    ),

    path(
        "<slug:division_slug>/<slug:assembly_slug>/datagrid_assembly_data_attendings/",
        view=datagrid_assembly_data_attendings_list_view,
        name="datagrid_assembly_data_attendings",
    ),

    path(
        "attendee_detail_view/<str:attendee_id>",
        view=attendee_detail_view,
        name="attendee_detail_view",
    ),

    path(
        "attendee_detail_view/",
        view=attendee_detail_view,
        name="attendee_detail_view",
    ),

    path(
        "attendee_update_view/<str:attendee_id>",
        view=attendee_update_view,
        name="attendee_update_view",
    ),

    path(
        "attendee_update_view/",
        view=attendee_update_view,
        name="attendee_update_view",
    ),

    path(
        "attendees_update_view/<str:attendee_id>",
        view=attendees_update_view,
        name="attendees_update_view",
    ),

    path(
        "attendees_update_view/",
        view=attendees_update_view,
        name="attendees_update_view",
    ),

    path(
        '<slug:division_slug>/<slug:assembly_slug>/datagrid_attendee_update_view/',
        view=datagrid_attendee_update_view,
        name='datagrid_attendee_update_view',
    ),
    path(
        '<slug:division_slug>/<slug:assembly_slug>/datagrid_attendee_update_view/<str:attendee_id>',
        view=datagrid_attendee_update_view,
        name='datagrid_attendee_update_view',
    ),
]
