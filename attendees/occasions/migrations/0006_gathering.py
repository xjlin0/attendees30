# Generated by Django 3.0.2 on 2020-01-21 03:21

import attendees.persons.models.utility
from django.db import migrations, models
from django.contrib.postgres.fields.jsonb import JSONField
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('schedule', '0012_auto_20191025_1852'),
        ('occasions', '0005_meet'),
    ]

    operations = [
        migrations.CreateModel(
            name='Gathering',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('start', models.DateTimeField(blank=False, null=False)),
                ('finish', models.DateTimeField(blank=False, null=False, help_text="Required for user to filter by time")),
                ('is_removed', models.BooleanField(default=False)),
                ('object_id', models.CharField(max_length=36, null=False, blank=False, default='0')),
                ('meet', models.ForeignKey(on_delete=models.SET(0), to='occasions.Meet')),
                ('content_type', models.ForeignKey(help_text='site: django_content_type id for table name', on_delete=models.SET(0), to='contenttypes.ContentType')),
                ('display_name', models.CharField(blank=True, null=True, max_length=50, help_text="02/09/2020, etc")),
                ('infos', JSONField(blank=True, default=dict, help_text='Example: {"LG_location": "F207", "link": "https://..."}. Please keep {} here even no data', null=True)),
            ],
            options={
                'db_table': 'occasions_gatherings',
                'ordering': ['meet', 'start'],
            },
            bases=(models.Model, attendees.persons.models.utility.Utility),
        ),
        migrations.AddConstraint(
            model_name='gathering',
            constraint=models.UniqueConstraint(fields=('meet_id', 'content_type', 'object_id', 'start'), condition=models.Q(is_removed=False), name='uniq_meet_location_time'),
        ),
    ]
