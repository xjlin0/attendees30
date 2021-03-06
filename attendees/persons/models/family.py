from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django.contrib.postgres.fields.jsonb import JSONField
from django.contrib.postgres.indexes import GinIndex
from model_utils.models import TimeStampedModel, SoftDeletableModel, UUIDModel


class Family(UUIDModel, TimeStampedModel, SoftDeletableModel):
    places = GenericRelation('whereabouts.Place')
    division = models.ForeignKey('whereabouts.Division', default=0, null=False, blank=False, on_delete=models.SET(0))
    attendees = models.ManyToManyField('persons.Attendee', through='FamilyAttendee', related_name='attendees')
    display_name = models.CharField(max_length=50, blank=True, null=True)
    display_order = models.SmallIntegerField(default=0, blank=False, null=False, db_index=True)
    infos = JSONField(null=True, blank=True, default=dict, help_text='Example: {"2010id": "3"}. Please keep {} here even no data')

    def __str__(self):
        return '%s family' % (self.display_name,)

    class Meta:
        db_table = 'persons_families'
        verbose_name_plural = 'Families'
        ordering = ('display_order', '-modified',)
        indexes = [
            GinIndex(fields=['infos'], name='family_infos_gin', ),
        ]

