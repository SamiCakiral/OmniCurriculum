# Generated by Django 5.1.1 on 2024-10-23 05:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("cv", "0003_certification_hobby_language_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="hobby",
            old_name="name",
            new_name="title",
        ),
        migrations.RenameField(
            model_name="workexperience",
            old_name="description",
            new_name="long_description",
        ),
        migrations.RemoveField(
            model_name="hobby",
            name="description",
        ),
        migrations.RemoveField(
            model_name="project",
            name="description",
        ),
        migrations.AddField(
            model_name="education",
            name="key_learning",
            field=models.ManyToManyField(
                related_name="education_skills", to="cv.skill"
            ),
        ),
        migrations.AddField(
            model_name="education",
            name="location",
            field=models.CharField(default="Undefined", max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="hobby",
            name="language",
            field=models.CharField(
                choices=[("fr", "Français"), ("en", "English")],
                default="fr",
                max_length=2,
            ),
        ),
        migrations.AddField(
            model_name="hobby",
            name="long_description",
            field=models.TextField(default="Undefined"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="hobby",
            name="short_description",
            field=models.TextField(default="Undefined"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="personalinfo",
            name="portfolio_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="workexperience",
            name="key_learning",
            field=models.ManyToManyField(related_name="work_skills", to="cv.skill"),
        ),
        migrations.AddField(
            model_name="workexperience",
            name="location",
            field=models.CharField(default="undefined", max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="workexperience",
            name="objectif_but",
            field=models.TextField(default="undefined"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="workexperience",
            name="short_description",
            field=models.TextField(default="undefined"),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="education",
            name="end_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="project",
            name="short_description",
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name="skill",
            name="type",
            field=models.CharField(
                choices=[
                    ("hard", "Compétence technique"),
                    ("soft", "Compétence personnelle"),
                    ("education", "Compétence acquise en formation"),
                    ("work", "Compétence acquise au travail"),
                    ("technology", "Technologie"),
                ],
                max_length=10,
            ),
        ),
    ]