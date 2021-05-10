# Generated by Django 3.0.2 on 2020-01-21 06:04
from uuid import uuid4
from address.models import AddressField
import attendees.persons.models.utility
from attendees.persons.models import Utility
from django.contrib.postgres.fields.jsonb import JSONField
from django.contrib.postgres.indexes import GinIndex
from django.db import migrations, models
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('whereabouts', '0000_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Place',
            fields=[
                ('id', model_utils.fields.UUIDField(default=uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('is_removed', models.BooleanField(default=False)),
                ('address', AddressField(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name='place', to='address.Address')),
                ('content_type', models.ForeignKey(on_delete=models.CASCADE, to='contenttypes.ContentType', null=False, blank=False)),
                ('display_order', models.SmallIntegerField(blank=False, default=0, null=False)),
                ('object_id', models.CharField(max_length=36, null=False, blank=False)),
                ('address_type', models.CharField(max_length=20, default='street', blank=True, null=True, help_text='mailing, remote or street address')),
                ('address_extra', models.CharField(max_length=50, blank=True, null=True, help_text='i.e. Apartment number')),
                ('start', models.DateTimeField(blank=True, null=True, help_text='optional')),
                ('finish', models.DateTimeField(blank=True, null=True, help_text='optional')),
                ('display_name', models.CharField(db_index=True, max_length=50, default='main', blank=False, null=False, help_text='main, resident, etc (main will be displayed first)')),
                ('infos', JSONField(blank=True, default=Utility.default_infos, help_text="please keep {} here even there's no data", null=True)),
            ],
            options={
                'db_table': 'whereabouts_places',
                'ordering': ('content_type', 'object_id', 'display_order',),
            },
            bases=(models.Model, attendees.persons.models.utility.Utility),
        ),
        migrations.AddConstraint(
            model_name='place',
            constraint=models.UniqueConstraint(fields=('content_type', 'object_id', 'address', 'address_extra'), name='address_object'),
        ),
        migrations.AddIndex(
            model_name='place',
            index=GinIndex(fields=['infos'], name='infos_fields_gin'),
        ),
    ]
