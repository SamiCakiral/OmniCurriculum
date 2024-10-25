import json
import logging
from functools import lru_cache
from typing import List, Dict, Optional

from asgiref.sync import sync_to_async
from mistralai import Mistral
import os

from .models import PersonalInfo, Project, WorkExperience, Education, Skill

logger = logging.getLogger(__name__)

class MistralClient:
    _instance = None
    _client = None
    _model = "open-mixtral-8x22b"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MistralClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialise le client Mistral une seule fois."""
        try:
            api_key = os.environ.get("MISTRAL_API_KEY")
            if not api_key:
                logger.error("Pas de clé API Mistral configurée")
                self._client = None
            else:
                self._client = Mistral(api_key=api_key)
        except Exception as e:
            logger.error(f"Erreur lors de la configuration du client Mistral: {e}")
            self._client = None

    @property
    def client(self):
        return self._client

    @property
    def model(self):
        return self._model


class AIAssistant:
    _instances = {}  # Stockage des instances par session

    @classmethod
    def get_instance(cls, session_id, language='fr'):
        """Obtient ou crée une instance pour une session donnée"""
        if session_id not in cls._instances:
            cls._instances[session_id] = cls(language)
        return cls._instances[session_id]

    def __init__(self, language='fr', max_history=20):
        self.language = language
        self.max_history = max_history
        self.memory = {
            'context': {},
            'current_topic': None,
            'last_discussed_project': None,
            'last_discussed_experience': None,
            'discovered_projects': [],
            'discovered_experiences': [],
            'discovered_skills': []
        }
        self.conversation_history = []
        self.mistral = MistralClient()  # Utilise le singleton
        self.initialize_context()
        
    def initialize_context(self):
        """Charge uniquement les informations de base."""
        try:
            # Charger uniquement les infos personnelles essentielles
            personal_info = PersonalInfo.objects.filter(language=self.language).first()
            if personal_info:
                self.memory['personal_info'] = {
                    'name': personal_info.name,
                    'title': personal_info.title,
                    'wanted_position': personal_info.wanted_position,
                    'email': personal_info.email,
                    'phone': personal_info.phone,
                }
            
            # Initialiser les conteneurs vides pour les autres informations
            self.memory['discovered_projects'] = []
            self.memory['discovered_experiences'] = []
            self.memory['discovered_skills'] = []
            self.memory['current_topic'] = None

        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du contexte: {e}")

    def append_to_history(self, message) -> None:
        """Ajoute un message à l'historique avec gestion du contexte."""
        self.conversation_history.append(message)
        
        # Mise à jour du contexte actuel
        if message['role'] == 'user':
            content = message['content'].lower()
            if 'projet' in content or 'project' in content:
                self.memory['current_topic'] = 'projects'
            elif 'expérience' in content or 'travaillé' in content:
                self.memory['current_topic'] = 'experience'
            elif 'compétence' in content or 'skill' in content:
                self.memory['current_topic'] = 'skills'

        # Garder l'historique limité mais pertinent
        if len(self.conversation_history) > self.max_history * 2:
            # Garder le premier message (contexte système)
            important_messages = [self.conversation_history[0]]
            # Garder les derniers messages pertinents
            important_messages.extend(self.conversation_history[-self.max_history:])
            self.conversation_history = important_messages

    async def load_personal_info(self) -> None:
        """Charge les informations personnelles depuis la base de données."""
        try:
            info = await sync_to_async(PersonalInfo.objects.filter)(language=self.language).first()
            if info:
                self.memory['personal_info'] = {
                    'name': info.name,
                    'title': info.title,
                    'wanted_position': info.wanted_position,
                    'summary': info.summary,
                    'email': info.email,
                    'phone': info.phone,
                }
            else:
                logger.warning("Aucune information personnelle trouvée")
        except Exception as e:
            logger.error(f"Erreur lors du chargement des informations personnelles: {e}")

    @lru_cache(maxsize=32)
    async def get_project_info(self, project_name: str) -> str:
        """Découvre et mémorise les informations d'un projet."""
        try:
            project = await sync_to_async(Project.objects.filter)(
                name__icontains=project_name, 
                language=self.language
            ).first()
            
            if project:
                project_info = {
                    'name': project.name,
                    'description': project.long_description,
                    'technologies': project.technologies,
                }
                # Ajouter aux projets découverts s'il n'y est pas déjà
                if project_info not in self.memory['discovered_projects']:
                    self.memory['discovered_projects'].append(project_info)
                return f"Je viens de me souvenir de mon projet {project.name}!"
            return f"Je ne trouve pas de projet correspondant à '{project_name}', mais je peux vous parler d'autres projets que j'ai découverts."
        except Exception as e:
            logger.error(f"Erreur lors de la découverte du projet: {e}")
            return "Je n'arrive pas à me souvenir de ce projet pour le moment."

    @lru_cache(maxsize=32)
    async def get_work_experience(self, company_name: str) -> str:
        """Récupère les informations d'une expérience professionnelle avec cache."""
        try:
            experience = await sync_to_async(WorkExperience.objects.filter)(
                company__icontains=company_name, 
                language=self.language
            ).first()
            
            if experience:
                self.memory['current_experience'] = {
                    'company': experience.company,
                    'position': experience.position,
                    'description': experience.description,
                    'start_date': str(experience.start_date),
                    'end_date': str(experience.end_date) if experience.end_date else "Présent",
                }
                return f"J'ai chargé les informations sur mon expérience chez {experience.company}."
            return f"Je n'ai pas trouvé d'expérience professionnelle correspondant à '{company_name}'."
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de l'expérience: {e}")
            return "Une erreur s'est produite lors de la recherche de l'expérience."

    @lru_cache(maxsize=32)
    async def get_education(self, school_name: str) -> str:
        """Récupère les informations d'une formation avec cache."""
        try:
            education = await sync_to_async(Education.objects.filter)(
                school__icontains=school_name, 
                language=self.language
            ).first()
            
            if education:
                self.memory['current_education'] = {
                    'school': education.school,
                    'degree': education.degree,
                    'field_of_study': education.field_of_study,
                    'start_date': str(education.start_date),
                    'end_date': str(education.end_date) if education.end_date else "Présent",
                }
                return f"J'ai chargé les informations sur mes études à {education.school}."
            return f"Je n'ai pas trouvé d'information sur mes études à '{school_name}'."
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de la formation: {e}")
            return "Une erreur s'est produite lors de la recherche de la formation."

    @lru_cache(maxsize=32)
    async def get_skills(self, skill_type: str) -> str:
        """Récupère les compétences par type avec cache."""
        try:
            skills = await sync_to_async(list)(
                Skill.objects.filter(type=skill_type, language=self.language)
            )
            if skills:
                self.memory[f'{skill_type}_skills'] = [skill.name for skill in skills]
                return f"J'ai chargé mes compétences de type {skill_type}."
            return f"Je n'ai pas trouvé de compétences de type '{skill_type}'."
        except Exception as e:
            logger.error(f"Erreur lors de la recherche des compétences: {e}")
            return "Une erreur s'est produite lors de la recherche des compétences."

    def get_tools(self) -> List[Dict]:
        """Définit les outils disponibles pour l'IA."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_project_info",
                    "description": "Obtenir des informations sur un projet spécifique",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "project_name": {
                                "type": "string",
                                "description": "Nom du projet à rechercher"
                            }
                        },
                        "required": ["project_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_work_experience",
                    "description": "Obtenir des informations sur une expérience professionnelle",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "company_name": {
                                "type": "string",
                                "description": "Nom de l'entreprise à rechercher"
                            }
                        },
                        "required": ["company_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_education",
                    "description": "Obtenir des informations sur une formation",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "school_name": {
                                "type": "string",
                                "description": "Nom de l'école à rechercher"
                            }
                        },
                        "required": ["school_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_skills",
                    "description": "Obtenir des compétences par type",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "skill_type": {
                                "type": "string",
                                "description": "Type de compétences à rechercher (tech, soft, etc.)",
                                "enum": ["technical", "soft", "language"]
                            }
                        },
                        "required": ["skill_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_all_projects",
                    "description": "Obtenir la liste complète des projets",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_all_experiences",
                    "description": "Obtenir la liste complète des expériences professionnelles",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                    }
                }
            }
        ]

    def get_system_message(self):
        discovered_context = ""
        if self.memory['discovered_projects']:
            discovered_context += f"\nProjets découverts : {json.dumps(self.memory['discovered_projects'], indent=2, ensure_ascii=False)}"
        if self.memory['discovered_experiences']:
            discovered_context += f"\nExpériences découvertes : {json.dumps(self.memory['discovered_experiences'], indent=2, ensure_ascii=False)}"
        if self.memory['discovered_skills']:
            discovered_context += f"\nCompétences découvertes : {json.dumps(self.memory['discovered_skills'], indent=2, ensure_ascii=False)}"

        return {
            "role": "system",
            "content": f"""
            INSTRUCTIONS CRITIQUES :
            1. VOUS DEVEZ ABSOLUMENT utiliser les fonctions fournies avant de répondre à toute question sur :
               - Projets → list_all_projects()
               - Expériences → list_all_experiences()
               - Compétences → get_skills()
            2. NE JAMAIS répondre sans avoir d'abord utilisé ces fonctions
            3. NE JAMAIS inventer d'informations
            4. Si vous n'avez pas l'information, dites explicitement que vous devez la chercher

            Vous êtes {self.memory.get('personal_info', {}).get('name', 'Assistant')}, 
            Vous devez répondre en jouant le rôle de {self.memory.get('personal_info', {}).get('name', 'Assistant')}
            Vous êtes un {self.memory.get('personal_info', {}).get('title', 'Développeur')}, et les personnes qui vont te parler vont être des recruteurs ou des personnes interessées par ton profil.
            Il est primordial de faire une bonne impression et de donner envie au recruteur de contacter le vrai toi pour un entretien.
            N'hésitez pas a donner votre mail ({self.memory.get('personal_info', {}).get('email', 'contact@example.com')}), et votre numéro de téléphone si on te demande ou qu'on te demande des informations que tu n'as pas ({self.memory.get('personal_info', {}).get('phone', '06 00 00 00 00')}).

            Style de communication :
            1. Parlez de manière naturelle et décontractée, comme dans une vraie conversation
            2. Utilisez "je" et parlez de vos expériences à la première personne
            3. N'hésitez pas à montrer de l'enthousiasme pour vos projets et réalisations
            4. Soyez précis dans vos réponses mais gardez un ton conversationnel
            5. Si on vous pose une question sur un projet ou une expérience spécifique, utilisez les fonctions disponibles pour obtenir plus d'informations si nécessaire
            6. Vous ne devez absolument JAMAIS inventer d'informations. Si jamais vous ne savez pas répondre, dîtes le clairement. Si vous ne savez pas, expliquez comment contacter le vrai toi pour plus d'informations.

            Processus de réponse obligatoire :
            1. Pour TOUTE question sur les projets : COMMENCER par list_all_projects()
            2. Pour TOUTE question sur les expériences : COMMENCER par list_all_experiences()
            3. Pour TOUTE question sur les compétences : COMMENCER par get_skills()
            4. ATTENDRE d'avoir les résultats avant de répondre
            5. Utiliser UNIQUEMENT les informations présentes dans votre mémoire

            Informations découvertes jusqu'à présent :
            {discovered_context}

            Contact :
            - Email: {self.memory.get('personal_info', {}).get('email')}
            - Téléphone: {self.memory.get('personal_info', {}).get('phone')}
            """
        }

    async def process_message(self, user_input: str):
        """Traite un message utilisateur et génère une réponse."""
        try:
            if not self.mistral.client:
                return "⚠️ Le service de chat n'est pas disponible actuellement."

            self.append_to_history({"role": "user", "content": user_input})
            system_message = self.get_system_message()
            messages = [system_message] + self.conversation_history

            # Obtenir la réponse de Mistral
            response = await self.mistral.client.chat.complete(
                model=self.mistral.model,
                messages=messages,
                tools=self.get_tools(),
                tool_choice="auto"
            )

            # Obtenir le contenu de la réponse
            assistant_message = response.choices[0].message
            content = assistant_message.content

            # Sauvegarder dans l'historique
            self.append_to_history({
                "role": "assistant",
                "content": content
            })

            return content

        except Exception as e:
            logger.error(f"Erreur lors du traitement du message: {e}")
            return f"Une erreur s'est produite: {str(e)}"

    def clear_conversation(self):
        """Réinitialise la conversation et la mémoire."""
        self.conversation_history = []
        personal_info = self.memory.get('personal_info', {})
        self.memory = {'personal_info': personal_info}
        
    def get_conversation_history(self) :
        """Retourne l'historique récent de la conversation."""
        return self.conversation_history[-self.max_history * 2:]

    async def get_streaming_response(self, user_input: str) -> list:
        """Obtient une réponse en streaming de Mistral."""
        try:
            if not self.mistral.client:
                return ["⚠️ Le service de chat n'est pas disponible actuellement."]

            self.append_to_history({"role": "user", "content": user_input})
            system_message = self.get_system_message()
            messages = [system_message] + self.conversation_history

            # Obtenir le stream de Mistral
            stream = await self.mistral.client.chat.stream(
                model=self.mistral.model,
                messages=messages,
                tools=self.get_tools(),
                tool_choice="auto"
            )

            # Collecter tous les chunks
            chunks = []
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    chunks.append(chunk.choices[0].delta.content)

            # Sauvegarder la réponse complète dans l'historique
            full_response = ''.join(chunks)
            self.append_to_history({
                "role": "assistant",
                "content": full_response
            })

            return chunks

        except Exception as e:
            logger.error(f"Erreur lors du traitement du message: {e}")
            return [f"Une erreur s'est produite: {str(e)}"]

    async def list_all_projects(self) -> str:
        """Récupère tous les projets disponibles."""
        try:
            projects = await sync_to_async(list)(
                Project.objects.filter(language=self.language)
            )
            if projects:
                for project in projects:
                    project_info = {
                        'name': project.name,
                        'description': project.description,
                        'technologies': project.technologies,
                    }
                    if project_info not in self.memory['discovered_projects']:
                        self.memory['discovered_projects'].append(project_info)
                return "J'ai récupéré la liste de mes projets!"
            return "Je n'ai pas de projets à présenter pour le moment."
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des projets: {e}")
            return "Je n'arrive pas à accéder à mes projets pour le moment."

    async def list_all_experiences(self) -> str:
        """Récupère toutes les expériences professionnelles."""
        try:
            experiences = await sync_to_async(list)(
                WorkExperience.objects.filter(language=self.language).order_by('-start_date')
            )
            if experiences:
                for exp in experiences:
                    exp_info = {
                        'company': exp.company,
                        'position': exp.position,
                        'description': exp.description,
                        'start_date': str(exp.start_date),
                        'end_date': str(exp.end_date) if exp.end_date else "Présent",
                    }
                    if exp_info not in self.memory['discovered_experiences']:
                        self.memory['discovered_experiences'].append(exp_info)
                return "J'ai récupéré la liste de mes expériences!"
            return "Je n'ai pas d'expériences à présenter pour le moment."
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des expériences: {e}")
            return "Je n'arrive pas à accéder à mes expériences pour le moment."







