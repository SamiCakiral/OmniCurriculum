# Generated by Django 5.1.1 on 2024-09-30 15:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("cv", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="skill",
            name="level",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
