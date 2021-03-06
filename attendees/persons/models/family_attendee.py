from django.db import models
from model_utils.models import TimeStampedModel, SoftDeletableModel


class FamilyAttendee(TimeStampedModel, SoftDeletableModel):
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    family = models.ForeignKey('persons.Family', null=False, blank=False, on_delete=models.CASCADE)
    attendee = models.ForeignKey('persons.Attendee', null=False, blank=False, on_delete=models.CASCADE)
    role = models.ForeignKey('persons.Relation', related_name='role', null=False, blank=False, on_delete=models.SET(0), verbose_name='attendee is', help_text="[Title] the family role of the attendee?")
    display_order = models.SmallIntegerField(default=30000, blank=False, null=False, db_index=True, help_text="0 will be first family")  # In current Attendee update page, FamilyAttendee order by created of family
    start = models.DateField(null=True, blank=True, help_text='date joining family')
    finish = models.DateField(null=True, blank=True, help_text='date leaving family')

    def __str__(self):
        return '%s %s %s' % (self.family, self.role, self.attendee)

    class Meta:
        db_table = 'persons_family_attendees'
        ordering = ('display_order', )
        constraints = [
            models.UniqueConstraint(fields=['family', 'attendee'], condition=models.Q(is_removed=False), name="family_attendee")
        ]
