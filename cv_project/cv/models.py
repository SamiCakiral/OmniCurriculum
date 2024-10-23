from django.db import models
from markdown import markdown

class PersonalInfo(models.Model):
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
    ]
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    summary = models.TextField()
    wanted_position = models.TextField()
    years_of_experience = models.IntegerField(null=True, blank=True)
    has_vehicle = models.BooleanField(default=False)
    region = models.CharField(max_length=100)
    linkedin_url = models.URLField(blank=True)
    linkedin_username = models.CharField(max_length=50, blank=True)
    github_url = models.URLField(blank=True)
    github_username = models.CharField(max_length=50, blank=True)
    portfolio_url = models.URLField(blank=True)
    photo_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.language})"

class Skill(models.Model):
    SKILL_TYPES = (
        ('hard', 'Compétence technique'),
        ('soft', 'Compétence personnelle'),
        ('education', 'Compétence acquise en formation'),
        ('work', 'Compétence acquise au travail'),
        ('technology', 'Technologie'),
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=SKILL_TYPES)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class Language(models.Model):
    name = models.CharField(max_length=50)
    level = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} - {self.level}"

class Hobby(models.Model):
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
    ]
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    title = models.CharField(max_length=100)
    short_description = models.TextField()
    long_description = models.TextField()

    def __str__(self):
        return f"{self.title} ({self.language})"

class Education(models.Model):
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
    ]
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    institution = models.CharField(max_length=100)
    degree = models.CharField(max_length=100)
    field_of_study = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField()
    location = models.CharField(max_length=100)
    key_learning = models.ManyToManyField(Skill, related_name='education_skills')

    def __str__(self):
        return f"{self.degree} - {self.institution} ({self.language})"

    def get_formatted_description(self):
        return markdown(self.description)

class WorkExperience(models.Model):
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
    ]
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    company = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    short_description = models.TextField()
    long_description = models.TextField()
    objectif_but = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100)
    key_learning = models.ManyToManyField(Skill, related_name='work_skills')

    def __str__(self):
        return f"{self.position} at {self.company} ({self.language})"

    def get_formatted_description(self):
        return markdown(self.long_description)

class Project(models.Model):
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
    ]
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    title = models.CharField(max_length=100)
    short_description = models.TextField()
    long_description = models.TextField()
    technologies = models.ManyToManyField(Skill, related_name='projects')
    github_url = models.URLField(blank=True, null=True)
    live_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.language})"

    def get_formatted_description(self):
        return markdown(self.long_description)

class Certification(models.Model):
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
    ]
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    name = models.CharField(max_length=100)
    issuing_organization = models.CharField(max_length=100)
    issue_date = models.DateField()
    expiration_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - {self.issuing_organization} ({self.language})"

    def get_formatted_description(self):
        return markdown(self.description)
