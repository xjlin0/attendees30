# Generated by Django 3.0.13 on 2021-05-22 22:07

import attendees.persons.models.utility
import django.contrib.postgres.fields.jsonb
import django.contrib.postgres.indexes
from django.db import migrations, models

import django.utils.timezone
import model_utils.fields
from private_storage.fields import PrivateFileField
from private_storage.storage.files import PrivateFileSystemStorage
from uuid import uuid4


class Migration(migrations.Migration):

    dependencies = [
        ('persons', '0002_note'),
    ]
    operations = [
        migrations.CreateModel(
            name='Past',
            fields=[
                ('id', model_utils.fields.UUIDField(default=uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('is_removed', models.BooleanField(default=False)),
                ('organization', models.ForeignKey(on_delete=models.SET(0), to='whereabouts.Organization')),
                ('category', models.ForeignKey(help_text="subtype: for education it's primary/high/college sub-types etc", on_delete=models.SET(0), to='persons.Category')),
                ('display_order', models.SmallIntegerField(db_index=True, default=30000)),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.ContentType')),
                ('object_id', models.CharField(max_length=36)),
                ('start', models.DateTimeField(blank=True, default=attendees.persons.models.utility.Utility.now_with_timezone, null=True)),
                ('finish', models.DateTimeField(blank=True, null=True)),
                ('display_name', models.CharField(blank=True, max_length=50, null=True)),
                ('infos', django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=attendees.persons.models.utility.Utility.relationship_infos, help_text='Example: {"show_secret": {"attendee1id": true, "attendee2id": false}}. Please keep {} here even no data', null=True)),
            ],
            options={
                'db_table': 'persons_pasts',
                'ordering': ('organization', 'category__type', 'display_order', 'category__display_order', 'start'),
            },
            bases=(models.Model, attendees.persons.models.utility.Utility),
        ),
        migrations.AddIndex(
            model_name='past',
            index=django.contrib.postgres.indexes.GinIndex(fields=['infos'], name='past_infos_gin'),
        ),
    ]

