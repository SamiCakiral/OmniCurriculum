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
        name="Remplissez avec votre nom complet. Par exemple : Jean-Claude Van Damme",
        email="Votre email professionnel. Exemple : muscles@kickboxing.com",
        phone="Votre numéro de téléphone. Par exemple : 0123456789 (appelez-moi pour des cours de karaté)",
        summary="Écrivez un résumé accrocheur. Par exemple : Je suis un ingénieur en devenir, tellement dévoué que j'ai créé ce site web pour le prouver. Si je peux coder, je peux tout faire !"
    )

    # Education
    Education.objects.create(
        institution="Votre école. Exemple : École Nationale Supérieure des Arts et Métiers du Rire",
        degree="Votre diplôme actuel ou visé. Exemple : Master en Ingénierie des Blagues",
        field_of_study="Votre domaine d'étude. Exemple : Humour Appliqué à l'Ingénierie",
        start_date=timezone.now().date() - timedelta(days=1825),
        end_date=timezone.now().date() - timedelta(days=1095)
    )
    Education.objects.create(
        institution="Votre école précédente. Exemple : Lycée des Comiques en Herbe",
        degree="Votre diplôme précédent. Exemple : Baccalauréat Scientifique option Jonglerie",
        field_of_study="Votre domaine d'étude précédent. Exemple : Sciences du Rire",
        start_date=timezone.now().date() - timedelta(days=2555),
        end_date=timezone.now().date() - timedelta(days=1825)
    )

    # WorkExperience
    WorkExperience.objects.create(
        company="Nom de l'entreprise. Exemple : MegaCorp Innovations Futuristes",
        position="Votre poste. Exemple : Stagiaire Ninja du Café",
        start_date=timezone.now().date() - timedelta(days=730),
        description="Description de vos responsabilités. Exemple : Maître dans l'art de préparer le café parfait tout en résolvant des équations différentielles. Expert en organisation de réunions où personne ne s'endort (grâce au café susmentionné)."
    )
    WorkExperience.objects.create(
        company="Autre entreprise. Exemple : Startup des Rêves Impossibles",
        position="Autre poste. Exemple : Architecte en Châteaux de Cartes Numériques",
        start_date=timezone.now().date() - timedelta(days=1460),
        end_date=timezone.now().date() - timedelta(days=730),
        description="Description humoristique. Exemple : Concepteur de structures de données aussi stables que des châteaux de cartes. Spécialiste en jonglage de bugs et en équilibrage d'algorithmes sur la pointe d'une aiguille."
    )
    WorkExperience.objects.create(
        company="Entreprise précédente. Exemple : L'Usine à Gags Technologiques",
        position="Poste précédent. Exemple : Apprenti Sorcier du Code",
        start_date=timezone.now().date() - timedelta(days=1825),
        end_date=timezone.now().date() - timedelta(days=1460),
        description="Description amusante. Exemple : Responsable de la transformation de bugs en features et de café en code. Expert en invocation de solutions créatives à des problèmes inexistants."
    )

    # Skills
    skills = [
        "Programmation en Python (je peux faire parler les serpents)",
        "JavaScript Ninja (je code plus vite que mon ombre)",
        "Maître Jedi de React (que la force du state soit avec vous)",
        "Dompteur de Node.js (je fais courir les serveurs comme des hamsters)",
        "Jongleur de Docker (je containerise même mes repas)",
        "Pilote de Kubernetes (capitaine de l'orchestre des conteneurs)",
        "Magicien AWS (je fais apparaître des serveurs comme par magie)",
        "Explorateur de Google Cloud (à la recherche du Big Data perdu)",
        "Dresseur de TensorFlow (mes modèles sont bien élevés)",
        "Alchimiste PyTorch (je transforme les données en or)",
        "SQL Whisperer (je parle couramment le langage des bases de données)",
        "Dompteur de MongoDB (mes documents sont bien dressés)",
        "Maître Git (je contrôle les versions mieux que Doctor Who)",
        "Acrobate du CI/CD (je déploie en salto arrière)",
        "Gourou Agile/Scrum (je sprinte plus vite que Usain Bolt)"
    ]
    for skill in skills:
        Skill.objects.create(name=skill)

    # Langues
    languages = [
        "Anglais : Courant (même avec l'accent de la Reine)",
        "Espagnol : Intermédiaire (je peux commander une paella sans incident diplomatique)",
        "Français : Natif (oui, je sais dire plus que 'omelette du fromage')",
        "Klingon : Notions (utile pour les réunions d'équipe tendues)"
    ]
    for language in languages:
        Skill.objects.create(name=language)

    # Soft skills
    soft_skills = [
        "Résolution de problèmes (même ceux qui n'existent pas encore)",
        "Travail d'équipe (je peux coder en pair programming avec moi-même)",
        "Communication (je parle couramment le langage des machines)",
        "Adaptabilité (je peux travailler efficacement même sans café... pendant 5 minutes)",
        "Créativité (j'invente des bugs pour pouvoir les résoudre ensuite)"
    ]
    for skill in soft_skills:
        Skill.objects.create(name=skill)

    # Projects
    Project.objects.create(
        title="SkyNet 2.0 - L'IA qui fait le café",
        description="Développement d'une IA révolutionnaire capable de préparer le café parfait tout en prédisant la fin du monde. Heureusement, elle est trop occupée à faire du café pour mettre ses plans à exécution.",
        url="https://github.com/skynet-cafe-edition"
    )
    Project.objects.create(
        title="Application de Téléportation Quantique des Bugs",
        description="Création d'une application qui téléporte magiquement les bugs de votre code vers celui de vos concurrents. Utilise une combinaison de magie noire, de physique quantique et de beaucoup de chance.",
        url="https://github.com/bug-be-gone"
    )

    print("Base de données peuplée avec succès!")

if __name__ == '__main__':
    populate_db()