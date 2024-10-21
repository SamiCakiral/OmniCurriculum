# OmniCurriculum 🌌

## Vision 🚀
OmniCurriculum est une plateforme de CV interactive et multidimensionnelle, conçue pour présenter vos compétences et expériences sous différents angles, comme un CV quantique existant dans plusieurs états simultanément.

## Caractéristiques principales 🌟
- **Multivers de thèmes** : Basculez entre différents univers visuels pour votre CV
  - 🖥️ Thème VSCode : Pour les amateurs de code
  - 🍎 Thème Apple : Une interface épurée et élégante
  - 📸 Thème Instagram : Un CV au format de feed social
- **Backend robuste** : Propulsé par Python et Django 🐍
- **Frontend réactif** : Construit avec React et Tailwind CSS ⚛️
- **Génération de PDF** : Exportez votre CV en PDF à la volée 📄
- **Design adaptatif** : Une expérience fluide sur tous les appareils 📱💻
- **Multilingue** : Présentez votre CV en plusieurs langues 🌍

## Objectifs du projet 🎯
1. Créer une expérience utilisateur unique et mémorable
2. Démontrer des compétences techniques avancées en backend et en intégration
3. Offrir une plateforme flexible pour présenter projets et compétences
4. Se démarquer dans un océan de CV traditionnels
5. Faciliter la personnalisation et la mise à jour du CV

## Stack technologique 🛠️
- **Backend** : Python, Django, Django REST Framework
- **Frontend** : React, Tailwind CSS, React Router
- **Base de données** : SQLite (développement), PostgreSQL (production)
- **Déploiement** : Google Cloud Platform (App Engine)
- **Autres** : Google Cloud SQL, Google Cloud Storage

## Roadmap 🗺️
- [x] Mise en place de l'architecture de base (Backend Django + Frontend React)
- [x] Création des modèles de données pour les informations du CV
- [x] Développement des API REST pour accéder aux données du CV
- [x] Configuration du frontend React avec React Router
- [x] Intégration de Tailwind CSS pour le styling
- [x] Création d'une page d'accueil interactive
- [x] Développement du thème VSCode
- [x] Implémentation du support multilingue (français et anglais)
- [x] Implémentation de la génération de PDF
- [x] Développement du thème Clair/Sombre
- [ ] Intégration de l'API GitHub
- [ ] Système de gestion de contenu pour faciliter les mises à jour
- [ ] Optimisation des performances et du référencement
- [ ] Déploiement sur GCP App Engine

## Installation et configuration locale 🔧
1. Clonez le repository
2. Installez les dépendances backend : `pip install -r requirements.txt`
3. Installez les dépendances frontend : `cd frontend && npm install`
4. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
   ```
   SECRET_KEY=votre_secret_key
   DEBUG=True
   DB_NAME=votre_nom_de_base_de_donnees
   DB_USER=votre_utilisateur_db
   DB_PASSWORD=votre_mot_de_passe_db
   LANGUAGE_CODE=fr-fr
   TIME_ZONE=Europe/Paris
   ```
5. Configurez la base de données et effectuez les migrations : `python manage.py migrate`
6. Lancez le serveur de développement Django : `python manage.py runserver`
7. Dans un autre terminal, lancez l'application React : `cd frontend && npm start`

## Déploiement sur GCP App Engine 🚀
1. Assurez-vous d'avoir un compte Google Cloud Platform et un projet créé
2. Installez et configurez le SDK Google Cloud
3. Créez une instance Cloud SQL PostgreSQL
4. Mettez à jour votre fichier `.env` avec les informations de production :
   ```
   SECRET_KEY=votre_secret_key_production
   DEBUG=False
   DB_NAME=votre_nom_de_base_de_donnees_production
   DB_USER=votre_utilisateur_db_production
   DB_PASSWORD=votre_mot_de_passe_db_production
   CLOUDSQL_CONNECTION_NAME=votre-projet:region:nom-instance
   ```
5. Créez un fichier `app.yaml` à la racine du projet (voir la documentation pour le contenu)
6. Déployez l'application avec la commande :
   ```
   gcloud app deploy --set-env-vars "$(cat .env | xargs)"
   ```

## Comment contribuer 🤝
Ce projet est actuellement en développement actif. Les contributions et suggestions sont les bienvenues !

## Licence 📜
[À déterminer]

---
Propulsé par la passion et le café ☕ | Créé avec ❤️ par Cakiral Sami
