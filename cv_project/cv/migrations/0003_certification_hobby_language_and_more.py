# Generated by Django 5.1.1 on 2024-10-20 19:52

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("cv", "0002_alter_skill_level"),
    ]

    operations = [
        migrations.CreateModel(
            name="Certification",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "language",
                    models.CharField(
                        choices=[("fr", "Français"), ("en", "English")],
                        default="fr",
                        max_length=2,
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("issuing_organization", models.CharField(max_length=100)),
                ("issue_date", models.DateField()),
                ("expiration_date", models.DateField(blank=True, null=True)),
                ("credential_id", models.CharField(blank=True, max_length=100)),
                ("credential_url", models.URLField(blank=True)),
                ("description", models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="Hobby",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("description", models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="Language",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=50)),
                ("level", models.CharField(max_length=50)),
            ],
        ),
        migrations.RenameField(
            model_name="project",
            old_name="url",
            new_name="live_url",
        ),
        migrations.RemoveField(
            model_name="project",
            name="image",
        ),
        migrations.RemoveField(
            model_name="skill",
            name="level",
        ),
        migrations.AddField(
            model_name="education",
            name="description",
            field=models.TextField(default="À Définir"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="education",
            name="language",
            field=models.CharField(
                choices=[("fr", "Français"), ("en", "English")],
                default="fr",
                max_length=2,
            ),
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="github_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="github_username",
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="has_vehicle",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="language",
            field=models.CharField(
                choices=[("fr", "Français"), ("en", "English")],
                default="fr",
                max_length=2,
            ),
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="linkedin_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="photo_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="region",
            field=models.CharField(default="À Définir", max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="title",
            field=models.CharField(default="À définir", max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="years_of_experience",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="project",
            name="github_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="project",
            name="language",
            field=models.CharField(
                choices=[("fr", "Français"), ("en", "English")],
                default="fr",
                max_length=2,
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="long_description",
            field=models.TextField(default="À définir"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="project",
            name="short_description",
            field=models.CharField(default="À définir", max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="skill",
            name="type",
            field=models.CharField(
                choices=[
                    ("hard", "Compétence technique"),
                    ("soft", "Compétence personnelle"),
                ],
                default="À définir",
                max_length=4,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="workexperience",
            name="language",
            field=models.CharField(
                choices=[("fr", "Français"), ("en", "English")],
                default="fr",
                max_length=2,
            ),
        ),
        migrations.AlterField(
            model_name="education",
            name="end_date",
            field=models.DateField(default=datetime.date(2024, 10, 20)),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="project",
            name="technologies",
            field=models.ManyToManyField(related_name="projects", to="cv.skill"),
        ),
        migrations.AlterField(
            model_name="skill",
            name="name",
            field=models.CharField(max_length=100),
        ),
    ]