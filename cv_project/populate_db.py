import os
import sys
import django
from django.core.management import execute_from_command_line

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cv_project.settings')
django.setup()

from django.apps import apps
from django.db import connections
from django.db.utils import OperationalError

from cv.models import PersonalInfo, Education, WorkExperience, Skill, Project
from django.utils import timezone
from datetime import timedelta

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
        
        # Vérifier si les fichiers de migration ont été créés
        cv_app = apps.get_app_config('cv')
        if not os.path.exists(os.path.join(cv_app.path, 'migrations')):
            os.makedirs(os.path.join(cv_app.path, 'migrations'))
            open(os.path.join(cv_app.path, 'migrations', '__init__.py'), 'a').close()
        
        print("Application des migrations...")
        execute_from_command_line(['manage.py', 'migrate', 'cv'])
    except Exception as e:
        print(f"Erreur lors de la création ou de l'application des migrations : {e}")
        sys.exit(1)

def populate_db():
    check_database_connection()
    check_and_create_migrations()
    
    # Suppression des données existantes
    PersonalInfo.objects.all().delete()
    Education.objects.all().delete()
    WorkExperience.objects.all().delete()
    Skill.objects.all().delete()
    Project.objects.all().delete()
    
    # PersonalInfo
    PersonalInfo.objects.create(
        name="Jean Dupont",
        email="jean.dupont@email.com",
        phone="+33 6 12 34 56 78",
        summary="Ingénieur en développement logiciel passionné avec 5 ans d'expérience. Spécialisé en Python et technologies web, je cherche à relever de nouveaux défis techniques dans une équipe innovante."
    )

    # Education
    Education.objects.create(
        institution="École Polytechnique",
        degree="Diplôme d'ingénieur",
        field_of_study="Informatique et Sciences des Données",
        start_date=timezone.now().date() - timedelta(days=2190),
        end_date=timezone.now().date() - timedelta(days=1095)
    )
    Education.objects.create(
        institution="Lycée Henri IV",
        degree="Baccalauréat Scientifique",
        field_of_study="Spécialité Mathématiques",
        start_date=timezone.now().date() - timedelta(days=2920),
        end_date=timezone.now().date() - timedelta(days=2555)
    )

    # WorkExperience
    WorkExperience.objects.create(
        company="TechInnovate Solutions",
        position="Développeur Full Stack Senior",
        start_date=timezone.now().date() - timedelta(days=730),
        description="Développement et maintenance d'applications web complexes utilisant Django et React. Leader technique sur plusieurs projets clés pour des clients internationaux."
    )
    WorkExperience.objects.create(
        company="DataViz Corp",
        position="Ingénieur Logiciel",
        start_date=timezone.now().date() - timedelta(days=1460),
        end_date=timezone.now().date() - timedelta(days=730),
        description="Conception et implémentation de solutions de visualisation de données pour le secteur financier. Utilisation de Python, D3.js et PostgreSQL."
    )
    WorkExperience.objects.create(
        company="StartUpNow",
        position="Développeur Junior",
        start_date=timezone.now().date() - timedelta(days=1825),
        end_date=timezone.now().date() - timedelta(days=1460),
        description="Participation au développement d'une application mobile de gestion de tâches. Travail en méthode Agile et utilisation de React Native."
    )

    # Skills
    skills = [
        "Python", "Django", "Flask", "JavaScript", "React", "Node.js",
        "Docker", "Kubernetes", "AWS", "Git", "SQL", "MongoDB",
        "Machine Learning", "Data Analysis", "RESTful APIs"
    ]
    for skill in skills:
        Skill.objects.create(name=skill)

    # Langues
    languages = [
        "Anglais : Courant (TOEIC 950)",
        "Espagnol : Intermédiaire",
        "Français : Langue maternelle"
    ]
    for language in languages:
        Skill.objects.create(name=language)

    # Soft skills
    soft_skills = [
        "Résolution de problèmes complexes",
        "Travail d'équipe",
        "Communication technique",
        "Gestion de projet",
        "Apprentissage rapide"
    ]
    for skill in soft_skills:
        Skill.objects.create(name=skill)

    # Projects
    Project.objects.create(
        title="Plateforme d'Analyse Prédictive pour E-commerce",
        description="Développement d'une solution d'analyse prédictive pour optimiser les stocks et les ventes d'une plateforme e-commerce. Utilisation de Python, scikit-learn et Django pour le backend, et React pour le frontend.",
        url="https://github.com/jeandupont/ecommerce-predictor"
    )
    Project.objects.create(
        title="Application Mobile de Suivi Fitness",
        description="Création d'une application mobile cross-platform pour le suivi d'activités sportives et de nutrition. Développée avec React Native et intégration d'une API RESTful personnalisée.",
        url="https://github.com/jeandupont/fitness-tracker-app"
    )

    print("Base de données peuplée avec succès avec des données réalistes!")

if __name__ == '__main__':
    populate_db()
