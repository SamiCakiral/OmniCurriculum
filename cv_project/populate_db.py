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
from django.conf import settings

from cv.models import PersonalInfo, Education, WorkExperience, Skill, Project, Language, Hobby, Certification

# Firestore setup
USE_FIRESTORE = settings.USE_FIRESTORE
if USE_FIRESTORE:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from google.cloud import firestore as firestore_client
    
    if not firebase_admin._apps:
        cred = credentials.Certificate(os.getenv('GOOGLE_APPLICATION_CREDENTIALS'))
        options = {
            "projectId": os.getenv('PROJECT_ID'),
            'databaseURL': os.getenv('DATABASE_URL')
        }
        firebase_admin.initialize_app(cred, options=options)
        db = firestore_client.Client(project=os.getenv('PROJECT_ID'), database=os.getenv('DATABASE_URL'))

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
    try:
        with open('personal_data.json', 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print("personal_data.json non trouvé")
        sys.exit("Fichier de données non trouvé")

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
    
    # PersonalInfo
    for lang, info in data['personal_info'].items():
        PersonalInfo.objects.create(
            name=info['name'],
            title=info['title'],
            email=info['email'],
            phone=info['phone'],
            summary=info['summary'],
            wanted_position=info['wanted_position'],
            years_of_experience=info['years_of_experience'],
            has_vehicle=info['has_vehicle'],
            region=info['region'],
            linkedin_url=info['linkedin_url'],
            linkedin_username = info['linkedin_username'],
            github_url=info['github_url'],
            github_username=info['github_username'],
            portfolio_url=info['portfolio_url'],
            photo_url=info["photo_url"],
            language=lang
        )
        if USE_FIRESTORE:
            db.collection('personal_info').document(lang).set(info)

    # Education
    for edu in data['education']:
        for lang in ['fr', 'en']:
            if lang in edu:
                Education.objects.create(
                    institution=edu[lang]['institution'],
                    degree=edu[lang].get('degree',""),
                    field_of_study=edu[lang]['field_of_study'],
                    description=edu[lang]['description'],
                    start_date=datetime.strptime(edu['start_date'], "%Y-%m-%d").date(),
                    end_date=datetime.strptime(edu['end_date'], "%Y-%m-%d").date() if edu['end_date'] else None,
                    location=edu['location'],
                    language=lang
                )
                if USE_FIRESTORE:
                    edu_data = edu[lang]
                    edu_data['start_date'] = edu['start_date']
                    edu_data['end_date'] = edu['end_date']
                    edu_data['location'] = edu['location']
                    edu_data['language'] = lang
                    db.collection('education').add(edu_data)
                
                for skill in edu.get('key_learning', []):
                    Skill.objects.get_or_create(name=skill, type='education')
                    if USE_FIRESTORE:
                        db.collection('skills').add({'name': skill, 'type': 'education'})

    # WorkExperience
    for exp in data['work_experience']:
        for lang in ['fr', 'en']:
            if lang in exp:
                WorkExperience.objects.create(
                    company=exp[lang]['company'],
                    position=exp[lang]['position'],
                    short_description=exp[lang]['short_description'],
                    long_description=exp[lang]['long_description'],
                    objectif_but=exp[lang]['Objectif_but'],
                    start_date=datetime.strptime(exp['start_date'], "%Y-%m-%d").date(),
                    end_date=datetime.strptime(exp['end_date'], "%Y-%m-%d").date() if exp['end_date'] else None,
                    location=exp['location'],
                    language=lang
                )
                if USE_FIRESTORE:
                    exp_data = exp[lang]
                    exp_data['start_date'] = exp['start_date']
                    exp_data['end_date'] = exp['end_date']
                    exp_data['location'] = exp['location']
                    exp_data['language'] = lang
                    db.collection('work_experience').add(exp_data)
                
                for skill in exp.get('key_learning', []):
                    Skill.objects.get_or_create(name=skill, type='work')
                    if USE_FIRESTORE:
                        db.collection('skills').add({'name': skill, 'type': 'work'})

    # Skills
    for skill_type, skills in data['skills'].items():
        for skill in skills:
            Skill.objects.get_or_create(name=skill, type=skill_type)
            if USE_FIRESTORE:
                db.collection('skills').add({'name': skill, 'type': skill_type})

    # Languages
    for lang in data['languages']:
        Language.objects.create(**lang)
        if USE_FIRESTORE:
            db.collection('language').add(lang)

    # Projects
    for proj in data['projects']:
        for lang in ['fr', 'en']:
            if lang in proj:
                project = Project.objects.create(
                    title=proj[lang]['title'],
                    short_description=proj[lang]['short_description'],
                    long_description=proj[lang]['long_description'],
                    github_url=proj[lang].get('github_url'),
                    live_url=proj[lang].get('live_url'),
                    language=lang
                )
                if USE_FIRESTORE:
                    proj_data = proj[lang]
                    proj_data['technologies'] = proj.get('technologies', [])
                    proj_data['language'] = lang
                    db.collection('project').add(proj_data)
                
                for tech in proj.get('technologies', []):
                    skill, _ = Skill.objects.get_or_create(name=tech, type='technology')
                    project.technologies.add(skill)

    # Hobbies
    for hobby in data['Hobbies']:
        for lang in ['fr', 'en']:
            if lang in hobby:
                Hobby.objects.create(
                    title=hobby[lang]['title'],
                    short_description=hobby[lang]['short_description'],
                    long_description=hobby[lang]['long_description'],
                    language=lang
                )
                if USE_FIRESTORE:
                    hobby_data = hobby[lang]
                    hobby_data['language'] = lang
                    db.collection('hobby').add(hobby_data)

    print("Base de données peuplée avec succès!")
    if USE_FIRESTORE:
        print("Firestore également peuplé avec succès!")

if __name__ == '__main__':
    populate_db()
