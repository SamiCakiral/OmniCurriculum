import os
import sys
import django
import json
from django.core.management import execute_from_command_line
from django.utils import timezone
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cv_project.settings')
django.setup()

from django.apps import apps
from django.db import connections
from django.db.utils import OperationalError

from cv.models import PersonalInfo, Education, WorkExperience, Skill, Project, Language, Hobby, Certification

def check_database_connection():
    db_conn = connections['default']
    try:
        db_conn.cursor()
    except OperationalError:
        sys.exit("Impossible de se connecter à la base de données. Vérifiez vos paramètres de connexion.")

def check_and_create_migrations():
    try:
        print("Création des migrations pour l'application 'cv'...")
        execute_from_command_line(['manage.py', 'makemigrations', 'cv'])
        
        cv_app = apps.get_app_config('cv')
        if not os.path.exists(os.path.join(cv_app.path, 'migrations')):
            os.makedirs(os.path.join(cv_app.path, 'migrations'))
            open(os.path.join(cv_app.path, 'migrations', '__init__.py'), 'a').close()
        
        print("Application des migrations...")
        execute_from_command_line(['manage.py', 'migrate', 'cv'])
    except Exception as e:
        print(f"Erreur lors de la création ou de l'application des migrations : {e}")
        sys.exit(1)

def load_data():
    try: # Si vous avez rempli un fichier avec vos infos personnelles, vous trouverez vos données
        with open('personal_data.json', 'r', encoding='utf-8') as file: 
            return json.load(file) 
    except FileNotFoundError:
        print("personal_data.json non trouvé, utilisation de fictional_data.json")
        try: # Sinon vous aurez un fichier avec des données fictives
            with open('fictional_data.json', 'r', encoding='utf-8') as file:
                return json.load(file)
        except FileNotFoundError:
            print("fictional_data.json non trouvé")
            sys.exit("Aucun fichier de données trouvé")

def populate_db():
    check_database_connection()
    check_and_create_migrations()
    
    data = load_data()
    
    # Suppression des données existantes
    PersonalInfo.objects.all().delete()
    Education.objects.all().delete()
    WorkExperience.objects.all().delete()
    Skill.objects.all().delete()
    Project.objects.all().delete()
    Language.objects.all().delete()
    Hobby.objects.all().delete()
    Certification.objects.all().delete()
    
    # PersonalInfo
    for lang, info in data['personal_info'].items():
        PersonalInfo.objects.create(**info, language=lang)

    # Education
    for edu in data['education']:
        for lang in ['fr', 'en']:
            if lang in edu:
                Education.objects.create(
                    institution=edu[lang]['institution'],
                    degree=edu[lang].get('degree', ''),
                    field_of_study=edu[lang]['field_of_study'],
                    description=edu[lang]['description'],
                    start_date=datetime.strptime(edu['start_date'], "%Y-%m-%d").date(),
                    end_date=datetime.strptime(edu['end_date'], "%Y-%m-%d").date() if edu['end_date'] else None,
                    location=edu.get('location', ''),
                    language=lang
                )

    # WorkExperience
    for exp in data['work_experience']:
        for lang in ['fr', 'en']:
            if lang in exp:
                WorkExperience.objects.create(
                    company=exp[lang]['company'],
                    position=exp[lang]['position'],
                    description=exp[lang]['description'],
                    start_date=datetime.strptime(exp['start_date'], "%Y-%m-%d").date(),
                    end_date=datetime.strptime(exp['end_date'], "%Y-%m-%d").date() if exp['end_date'] else None,
                    location=exp.get('location', ''),
                    language=lang
                )

    # Skills
    for skill_type, skills in data['skills'].items():
        for skill in skills:
            Skill.objects.create(name=skill, type=skill_type.rstrip('_skills'))

    # Languages
    for lang in data['languages']:
        Language.objects.create(**lang)

    # Hobbies
    for hobby in data.get('hobbies', []):
        Hobby.objects.create(name=hobby)

    # Projects
    for proj in data['projects']:
        for lang in ['fr', 'en']:
            if lang in proj:
                project = Project.objects.create(
                    title=proj[lang]['title'],
                    short_description=proj[lang]['short_description'],
                    long_description=proj[lang]['long_description'],
                    github_url=proj[lang]['github_url'],
                    live_url=proj[lang].get('live_url'),
                    language=lang
                )
                project.technologies.set(Skill.objects.filter(name__in=proj['technologies']))

    # Certifications
    for cert in data.get('certifications', []):
        for lang in ['fr', 'en']:
            if lang in cert:
                Certification.objects.create(
                    name=cert[lang]['name'],
                    issuing_organization=cert[lang]['issuing_organization'],
                    description=cert[lang]['description'],
                    issue_date=datetime.strptime(cert['issue_date'], "%Y-%m-%d").date(),
                    expiration_date=datetime.strptime(cert['expiration_date'], "%Y-%m-%d").date() if cert['expiration_date'] else None,
                    credential_id=cert.get('credential_id', ''),
                    credential_url=cert.get('credential_url', ''),
                    language=lang
                )

    print("Base de données peuplée avec succès!")

if __name__ == '__main__':
    populate_db()
