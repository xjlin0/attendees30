# Generated by Django 3.0.2 on 2020-02-01 14:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('occasions', '0008_attendance'),
        ('persons', '0010_locate'),
    ]

    operations = [
        migrations.AddField(
            model_name='attending',
            name='gatherings',
            field=models.ManyToManyField(through='occasions.Attendance', to='occasions.Gathering'),
        ),
    ]
