# Generated by Django 3.0.2 on 2020-01-14 04:36

import attendees.persons.models.utility
from django.contrib.postgres.fields.jsonb import JSONField
from django.db import migrations, models
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('occasions', '0003_price'),
        ('persons', '0007_relationship_m2m'),
    ]

    operations = [
        migrations.CreateModel(
            name='Registration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('is_removed', models.BooleanField(default=False)),
                ('assembly', models.ForeignKey(null=True, on_delete=models.deletion.SET_NULL, to='occasions.Assembly')),
                ('registrant', models.ForeignKey(null=True, on_delete=models.deletion.SET_NULL, to='persons.Attendee')),
                ('infos', JSONField(blank=True, default=dict, help_text='Example: {"price": "150.75", "donation": "85.00", "credit": "35.50", "apply_type": "online", "apply_key": "001"}. Please keep {} here even no data', null=True)),
            ],
            options={
                'db_table': 'persons_registrations',
                'ordering': ('assembly', 'registrant__last_name', 'registrant__first_name'),
            },
            bases=(models.Model, attendees.persons.models.utility.Utility),
        ),
        migrations.AddConstraint(
            model_name='registration',
            constraint=models.UniqueConstraint(fields=('assembly', 'registrant'), condition=models.Q(is_removed=False), name='assembly_registrant'),
        ),
        migrations.AddIndex(
            model_name='registration',
            index=django.contrib.postgres.indexes.GinIndex(fields=['infos'], name='registration_infos_gin'),
        ),
    ]
