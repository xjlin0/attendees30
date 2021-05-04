# Generated by Django 3.0.2 on 2020-01-14 06:22

import attendees.persons.models.utility
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('whereabouts', '0003_contact'),
    ]

    operations = [
        migrations.CreateModel(
            name='Campus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('is_removed', models.BooleanField(default=False)),
                ('contact', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='whereabouts.Contact')),
                ('display_name', models.CharField(db_index=True, max_length=50)),
                ('slug', models.SlugField(max_length=50, unique=True)),
            ],
            options={
                'db_table': 'whereabouts_campus',
                'verbose_name_plural': 'Campuses',
            },
            bases=(models.Model, attendees.persons.models.utility.Utility),
        ),
    ]
