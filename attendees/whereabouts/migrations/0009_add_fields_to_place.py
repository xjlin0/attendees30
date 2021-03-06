# Generated by Django 3.0.14 on 2021-05-31 14:57 to bypass place <-> organization dependency and ensure the order of db columns

import attendees.persons.models.utility
import django.contrib.postgres.fields.jsonb
import django.contrib.postgres.indexes
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('whereabouts', '0008_room'),
    ]

    operations = [
        migrations.AddField(
            model_name='place',
            name='organization',
            field=models.ForeignKey(default=0, on_delete=models.SET(0), to='whereabouts.Organization'),
        ),
        migrations.AddField(
            model_name='place',
            name='content_type',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE,
                                    to='contenttypes.ContentType'),
        ),
        migrations.AddField(
            model_name='place',
            name='object_id',
            field=models.CharField(default='0', max_length=36),
        ),
        # migrations.AddField(
        #     model_name='place',
        #     name='address_type',
        #     field=models.CharField(blank=True, default='street', help_text='mailing, remote or street address',
        #                            max_length=20, null=True),
        # ),
        # migrations.AddField(
        #     model_name='place',
        #     name='address_extra',
        #     field=models.CharField(blank=True, help_text='i.e. Apartment number', max_length=50, null=True),
        # ),
        migrations.AddField(
            model_name='place',
            name='start',
            field=models.DateField(blank=True, help_text='optional, moved in date', null=True),
        ),
        migrations.AddField(
            model_name='place',
            name='finish',
            field=models.DateField(blank=True, help_text='optional, moved out date', null=True),
        ),
        migrations.AddField(
            model_name='place',
            name='display_name',
            field=models.CharField(db_index=True, default='main', help_text='main, resident, etc (main will be displayed first)', max_length=50),
        ),
        migrations.AddField(
            model_name='place',
            name='infos',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=attendees.persons.models.utility.Utility.default_infos, help_text="please keep {} here even there's no data", null=True),
        ),
        migrations.AlterModelOptions(
            name='place',
            options={'ordering': ('organization', 'content_type', 'object_id', 'display_order')},
        ),
        migrations.AddIndex(
            model_name='place',
            index=django.contrib.postgres.indexes.GinIndex(fields=['infos'], name='place_infos_gin'),
        ),
        migrations.AddConstraint(
            model_name='place',
            constraint=models.UniqueConstraint(condition=models.Q(is_removed=False), fields=('organization', 'content_type', 'object_id', 'address'), name='address_object'),
        ),
    ]
