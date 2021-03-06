from django.db import models
from django.core.exceptions import ValidationError
from model_utils.models import TimeStampedModel, SoftDeletableModel
from . import Utility


class AttendingMeet(TimeStampedModel, SoftDeletableModel, Utility):
    """
    Served as a partial template for attendance
    """
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    attending = models.ForeignKey('Attending', on_delete=models.SET(0), null=False, blank=False)
    meet = models.ForeignKey('occasions.Meet', on_delete=models.SET(0), null=False, blank=False)
    start = models.DateTimeField(null=False, blank=False, db_index=True, default=Utility.now_with_timezone)
    finish = models.DateTimeField(null=False, blank=False, db_index=True, help_text="Required for user to filter by time")
    #  Todo: team = models.ForeignKey('Team', default=None, null=True, blank=True, on_delete=models.SET_NULL, help_text="empty for main meet")
    character = models.ForeignKey('occasions.Character', null=False, blank=False, on_delete=models.SET(0))
    category = models.CharField(max_length=20, default='primary', blank=False, null=False, help_text='primary, secondary, etc (primary will be displayed first)')

    def clean(self):
        if not self.attending.registration.assembly == self.meet.assembly == self.character.assembly:
            raise ValidationError("The attending meet's assembly, registered assembly and character's assembly needed to be the same, please pick another registration, character or meet")

    class Meta:
        db_table = 'persons_attending_meets'
        constraints = [
            models.UniqueConstraint(fields=['attending', 'meet'], condition=models.Q(is_removed=False), name="attending_meet")
        ]

    def __str__(self):
        return '%s %s' % (self.attending, self.meet)
