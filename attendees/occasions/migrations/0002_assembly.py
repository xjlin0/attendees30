# Generated by Django 3.0.2 on 2020-01-13 14:49

import attendees.persons.models.utility
from django.db import migrations, models
from django.contrib.postgres.fields.jsonb import JSONField
from django.contrib.postgres.indexes import GinIndex

import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('occasions', '0001_message_template'),
    ]

    operations = [
        migrations.CreateModel(
            name='Assembly',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('start', models.DateTimeField(blank=True, help_text='optional', null=True)),
                ('finish', models.DateTimeField(blank=True, help_text='optional', null=True)),
                ('is_removed', models.BooleanField(default=False)),
                ('display_order', models.SmallIntegerField(blank=False, default=0, null=False)),
                ('need_age', models.BooleanField('Does registration need age info?', null=False, blank=False, default=False, help_text="Does the age info of the participants required?")),
                ('division', models.ForeignKey(on_delete=models.SET(0), to='whereabouts.Division')),
                ('category', models.CharField(default='normal', help_text='normal, no-display, etc', max_length=20, blank=False, null=False, db_index=True)),
                ('slug', models.SlugField(max_length=50, unique=True, help_text='format: Organization_name-Assembly_name')),
                ('display_name', models.CharField(max_length=50, blank=False, null=False, help_text='Uniq within Organization, adding year helps')),
                ('infos', JSONField(blank=True, default=dict, help_text="please keep {} here even there's no data", null=True)),
            ],
            options={
                'db_table': 'occasions_assemblies',
                'verbose_name_plural': 'Assemblies',
                'ordering': ('division', 'display_order'),
            },
            bases=(models.Model, attendees.persons.models.utility.Utility),
        ),
        migrations.AddIndex(
            model_name='Assembly',
            index=GinIndex(fields=['infos'], name='assembly_infos_gin'),
        ),
    ]
