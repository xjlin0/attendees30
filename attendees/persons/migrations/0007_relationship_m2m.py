# Generated by Django 3.0.2 on 2020-01-13 03:03
from uuid import uuid4
from attendees.persons.models.utility import Utility
from django.contrib.postgres.fields.jsonb import JSONField
from django.db import migrations, models
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('persons', '0006_attendee'),
    ]

    operations = [
        migrations.CreateModel(
            name='Relationship',
            fields=[
                ('id', model_utils.fields.UUIDField(default=uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('is_removed', models.BooleanField(default=False)),
                ('relation', models.ForeignKey('persons.Relation', related_name='relation', null=False, blank=False, on_delete=models.SET(0), verbose_name='to_attendee is', help_text="[Title] What would from_attendee call to_attendee?")),
                ('emergency_contact', models.BooleanField('to_attendee is the emergency contact?', default=False, null=False, blank=False, help_text="[from_attendee decide:] Notify to_attendee of from_attendee's emergency?")),
                ('scheduler', models.BooleanField('to_attendee is the scheduler?', default=False, null=False, blank=False, help_text="[from_attendee decide:] to_attendee can view/change the schedules of the from_attendee?")),
                ('from_attendee', models.ForeignKey(on_delete=models.CASCADE, related_name='from_attendee', to='persons.Attendee')),
                ('to_attendee', models.ForeignKey(on_delete=models.CASCADE, related_name='to_attendee', to='persons.Attendee')),
                ('start', models.DateField(blank=True, null=True)),
                ('finish', models.DateTimeField(null=False, blank=False, default=Utility.forever, help_text='The relation will be ended at when')),
                ('in_family', models.ForeignKey(blank=True, null=True, on_delete=models.SET_NULL, related_name='in_family', to='persons.Family')),
                ('infos', JSONField(blank=True, null=True, default=Utility.relationship_infos, help_text='Example: {"show_secret": {"attendee1id": true, "attendee2id": false}}. Please keep {} here even no data')),
            ],
            options={
                'db_table': 'persons_relationships',
            },
            bases=(models.Model, Utility),
        ),
        migrations.AddField(
            model_name='attendee',
            name='related_ones',
            field=models.ManyToManyField(related_name='related_to', through='persons.Relationship', to='persons.Attendee'),
        ),
        migrations.AddConstraint(
            model_name='relationship',
            constraint=models.UniqueConstraint(fields=('from_attendee', 'to_attendee', 'relation'), name='attendee_relation'),
        ),
        migrations.AddIndex(
            model_name='relationship',
            index=django.contrib.postgres.indexes.GinIndex(fields=['infos'], name='relationship_infos_gin'),
        ),
    ]
