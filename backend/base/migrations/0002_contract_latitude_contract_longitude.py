# Generated by Django 4.1.7 on 2023-02-28 12:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("base", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="contract",
            name="latitude",
            field=models.FloatField(blank=True, default=1.0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="contract",
            name="longitude",
            field=models.FloatField(blank=True, default=1.0),
            preserve_default=False,
        ),
    ]