import os
import sys
import django
from django.core.management import execute_from_command_line

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cv_project.settings')
django.setup()

from django.apps import apps
from django.db import connections
from django.db.utils import OperationalError

from cv.models import PersonalInfo, Education, WorkExperience, Skill, Project, Language, Hobby, Certification
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
    Language.objects.all().delete()
    Hobby.objects.all().delete()
    Certification.objects.all().delete()
    
    # PersonalInfo
    personal_info = {
        'fr': {
            'name': "Jean Dupont",
            'title': "Ingénieur en Développement Logiciel",
            'email': "jean.dupont@email.com",
            'phone': "+33 6 12 34 56 78",
            'summary': "Ingénieur en développement logiciel passionné avec 5 ans d'expérience. Spécialisé en Python et technologies web, je cherche à relever de nouveaux défis techniques dans une équipe innovante.",
            'years_of_experience': 5,
            'has_vehicle': True,
            'region': "Paris, France",
            'linkedin_url': "https://www.linkedin.com/in/jeandupont",
            'github_url': "https://github.com/jeandupont",
            'github_username': "jeandupont"
        },
        'en': {
            'name': "John Smith",
            'title': "Software Development Engineer",
            'email': "john.smith@email.com",
            'phone': "+1 (555) 123-4567",
            'summary': "Passionate software development engineer with 5 years of experience. Specialized in Python and web technologies, I'm looking to take on new technical challenges in an innovative team.",
            'years_of_experience': 5,
            'has_vehicle': True,
            'region': "San Francisco, CA",
            'linkedin_url': "https://www.linkedin.com/in/johnsmith",
            'github_url': "https://github.com/johnsmith",
            'github_username': "johnsmith"
        }
    }

    for lang, info in personal_info.items():
        PersonalInfo.objects.create(**info, language=lang)

    # Education
    education_data = [
        {
            'fr': {
                'institution': "École Polytechnique",
                'degree': "Diplôme d'ingénieur",
                'field_of_study': "Informatique et Sciences des Données",
                'description': "Formation d'élite en ingénierie avec spécialisation en informatique et analyse de données."
            },
            'en': {
                'institution': "Stanford University",
                'degree': "Master of Science",
                'field_of_study': "Computer Science and Data Science",
                'description': "Elite engineering program with a focus on computer science and data analysis."
            },
            'start_date': timezone.now().date() - timedelta(days=2190),
            'end_date': timezone.now().date() - timedelta(days=1095)
        },
        # ... (ajoutez d'autres formations si nécessaire)
    ]

    for edu in education_data:
        for lang, data in edu.items():
            if lang in ['fr', 'en']:
                Education.objects.create(**data, start_date=edu['start_date'], end_date=edu['end_date'], language=lang)

    # WorkExperience
    work_experience_data = [
        {
            'fr': {
                'company': "TechInnovate Solutions",
                'position': "Développeur Full Stack Senior",
                'description': "Développement et maintenance d'applications web complexes utilisant Django et React. Leader technique sur plusieurs projets clés pour des clients internationaux."
            },
            'en': {
                'company': "TechInnovate Solutions",
                'position': "Senior Full Stack Developer",
                'description': "Development and maintenance of complex web applications using Django and React. Technical lead on several key projects for international clients."
            },
            'start_date': timezone.now().date() - timedelta(days=730),
            'end_date': None
        },
        # ... (ajoutez d'autres expériences professionnelles si nécessaire)
    ]

    for exp in work_experience_data:
        for lang, data in exp.items():
            if lang in ['fr', 'en']:
                WorkExperience.objects.create(**data, start_date=exp['start_date'], end_date=exp['end_date'], language=lang)

    # Skills
    hard_skills = ["Python", "Django", "Flask", "JavaScript", "React", "Node.js", "Docker", "Kubernetes", "AWS", "Git", "SQL", "MongoDB", "Machine Learning", "Data Analysis", "RESTful APIs"]
    soft_skills = ["Résolution de problèmes complexes", "Travail d'équipe", "Communication technique", "Gestion de projet", "Apprentissage rapide"]

    for skill in hard_skills:
        Skill.objects.create(name=skill, type='hard')
    for skill in soft_skills:
        Skill.objects.create(name=skill, type='soft')

    # Languages
    languages = [
        {'name': "Anglais", 'level': "Courant (TOEIC 950)"},
        {'name': "Espagnol", 'level': "Intermédiaire"},
        {'name': "Français", 'level': "Langue maternelle"}
    ]
    for lang in languages:
        Language.objects.create(**lang)

    # Hobbies
    hobbies = ["Photographie", "Randonnée", "Programmation open-source", "Lecture de science-fiction"]
    for hobby in hobbies:
        Hobby.objects.create(name=hobby)

    # Projects
    projects_data = [
        {
            'fr': {
                'title': "Plateforme d'Analyse Prédictive pour E-commerce",
                'short_description': "Solution d'analyse pour optimiser les stocks et les ventes",
                'long_description': "Développement d'une solution d'analyse prédictive pour optimiser les stocks et les ventes d'une plateforme e-commerce. Utilisation de Python, scikit-learn et Django pour le backend, et React pour le frontend.",
                'github_url': "https://github.com/jeandupont/ecommerce-predictor",
                'live_url': "https://ecommerce-predictor.example.com"
            },
            'en': {
                'title': "E-commerce Predictive Analysis Platform",
                'short_description': "Analytics solution to optimize inventory and sales",
                'long_description': "Development of a predictive analytics solution to optimize inventory and sales for an e-commerce platform. Using Python, scikit-learn, and Django for the backend, and React for the frontend.",
                'github_url': "https://github.com/johnsmith/ecommerce-predictor",
                'live_url': "https://ecommerce-predictor.example.com"
            }
        },
        # ... (ajoutez d'autres projets si nécessaire)
    ]

    for project in projects_data:
        for lang, data in project.items():
            if lang in ['fr', 'en']:
                proj = Project.objects.create(**data, language=lang)
                proj.technologies.set(Skill.objects.filter(name__in=["Python", "Django", "React", "Machine Learning"]))

    # Certifications
    certifications_data = [
        {
            'fr': {
                'name': "AWS Certified Solutions Architect",
                'issuing_organization': "Amazon Web Services",
                'description': "Certification professionnelle validant l'expertise en conception d'architectures cloud sur AWS."
            },
            'en': {
                'name': "AWS Certified Solutions Architect",
                'issuing_organization': "Amazon Web Services",
                'description': "Professional certification validating expertise in designing cloud architectures on AWS."
            },
            'issue_date': timezone.now().date() - timedelta(days=365),
            'expiration_date': timezone.now().date() + timedelta(days=730),
            'credential_id': "AWS-CSA-123456",
            'credential_url': "https://www.youracclaim.com/badges/aws-certified-solutions-architect"
        },
        # ... (ajoutez d'autres certifications si nécessaire)
    ]

    for cert in certifications_data:
        for lang, data in cert.items():
            if lang in ['fr', 'en']:
                Certification.objects.create(**data, issue_date=cert['issue_date'], expiration_date=cert['expiration_date'], credential_id=cert['credential_id'], credential_url=cert['credential_url'], language=lang)

    print("Base de données peuplée avec succès avec des données réalistes en français et en anglais!")

if __name__ == '__main__':
    populate_db()
