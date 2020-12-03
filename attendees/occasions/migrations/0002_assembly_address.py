# Generated by Django 3.0.2 on 2020-01-14 02:05

import attendees.persons.models.utility
from django.db import migrations, models
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('whereabouts', '0003_address'),
        ('occasions', '0001_assembly'),
    ]

    operations = [
        migrations.CreateModel(
            name='AssemblyAddress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('is_removed', models.BooleanField(default=False)),
                ('address', models.ForeignKey(on_delete=models.CASCADE, to='whereabouts.Address')),
                ('assembly', models.ForeignKey(on_delete=models.SET(0), to='occasions.Assembly')),
                ('category', models.CharField(default='normal', help_text='primary, backup, etc', max_length=20, null=True)),
            ],
            options={
                'db_table': 'occasions_assembly_addresses',
                'verbose_name_plural': 'Assembly Addresses',
            },
            bases=(models.Model, attendees.persons.models.utility.Utility),
        ),
        migrations.AddField(
            model_name='assembly',
            name='addresses',
            field=models.ManyToManyField(through='occasions.AssemblyAddress', to='whereabouts.Address'),
        ),
        migrations.AddConstraint(
            model_name='assemblyaddress',
            constraint=models.UniqueConstraint(fields=('assembly', 'address'), name='assembly_address'),
        ),
    ]
