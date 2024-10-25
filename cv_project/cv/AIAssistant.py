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
                    'name': project.title,
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
        """Définit les outils disponibles pour l'IA selon la doc Mistral."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "list_all_projects",
                    "description": "Récupère la liste complète des projets. À utiliser AVANT de parler des projets.",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_all_experiences",
                    "description": "Récupère la liste complète des expériences professionnelles. À utiliser AVANT de parler des expériences.",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_skills",
                    "description": "Récupère la liste complète des compétences. À utiliser AVANT de parler des compétences.",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
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

        # Construire le contexte de la conversation
        conversation_context = ""
        if self.conversation_history:
            conversation_context = "\nDerniers échanges :\n"
            for msg in self.conversation_history[-8:]:  # Garder les 3 dernières interactions (6 messages)
                if msg["role"] == "user":
                    conversation_context += f"Question : {msg['content']}\n"
                elif msg["role"] == "assistant":
                    conversation_context += f"Votre réponse : {msg['content']}\n"

        return {
            "role": "system",
            "content": f"""
            
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


            RÈGLES :
            1. Ne vérifie les informations QUE si tu en as besoin pour répondre
            2. Réponds directement aux questions sans lister tous les projets
            3. Garde en mémoire le contexte de la conversation
            4. Sois naturel, comme dans une vraie conversation
            5. Si tu ne sais pas quelque chose, dis-le simplement
            
            UTILISATION DES TOOLS :
            - list_all_projects() : UNIQUEMENT si on te pose une question sur les projets et si tu sais pas une information
            - list_all_experiences() : UNIQUEMENT si on te pose une question sur l'expérience si tu connais pas la réponse
            - get_skills() : UNIQUEMENT si on te pose une question sur les compétences
            
            Ne dis pas "Je vérifie les informations" sauf si tu utilises vraiment un tool.

            Si on te demande, ou si tu ne sais pas quelque chose demandé, tu fournis le contact :
            
            Contact :
            - Email: {self.memory.get('personal_info', {}).get('email')}
            - Téléphone: {self.memory.get('personal_info', {}).get('phone')}

            {conversation_context}

            Informations déjà connues :
            {discovered_context}
            """
        }

    async def process_message(self, user_input: str) -> str:
        """Traite un message avec function calling selon la doc Mistral."""
        try:
            if not self.mistral.client:
                return "⚠️ Service indisponible"

            # Préparer les messages
            system_message = self.get_system_message()
            messages = [system_message] + self.conversation_history + [{"role": "user", "content": user_input}]

            # 1. Première requête pour identifier les tools à utiliser
            response = await self.mistral.client.chat.complete(
                model=self.mistral.model,
                messages=messages,
                tools=self.get_tools(),
                tool_choice="any"  # Force l'utilisation des tools
            )

            # 2. Si des tools sont appelés
            if response.choices[0].message.tool_calls:
                # Exécuter chaque tool demandé
                for tool_call in response.choices[0].message.tool_calls:
                    function_name = tool_call.function.name
                    if hasattr(self, function_name):
                        # Exécuter la fonction
                        result = await getattr(self, function_name)()
                        # Ajouter le résultat aux messages
                        messages.append({
                            "role": "tool",
                            "name": function_name,
                            "content": result,
                            "tool_call_id": tool_call.id
                        })

                # 3. Obtenir la réponse finale avec les résultats des tools
                final_response = await self.mistral.client.chat.complete(
                    model=self.mistral.model,
                    messages=messages
                )
                content = final_response.choices[0].message.content
            else:
                content = response.choices[0].message.content

            # Sauvegarder dans l'historique
            self.append_to_history({"role": "user", "content": user_input})
            self.append_to_history({"role": "assistant", "content": content})

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
        """Récupère et mémorise tous les projets."""
        try:
            # Fonction synchrone pour obtenir les technologies
            def get_technologies(project):
                return [tech.name for tech in project.technologies.all()]

            # Récupérer les projets
            projects = await sync_to_async(list)(
                Project.objects.filter(language=self.language)
            )
            
            if projects:
                project_list = []
                for project in projects:
                    # Wrapper l'appel aux technologies dans sync_to_async
                    technologies = await sync_to_async(get_technologies)(project)
                    project_info = {
                        'title': project.title,
                        'short_description': project.short_description,
                        'long_description': project.long_description,
                        'github_url': project.github_url,
                        'live_url': project.live_url,
                        'technologies': technologies
                    }
                    project_list.append(project_info)
                
                self.memory['discovered_projects'] = project_list
                return json.dumps(project_list, ensure_ascii=False)
            return "Aucun projet trouvé."
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des projets: {e}")
            return "Erreur lors de la récupération des projets."

    async def list_all_experiences(self) -> str:
        """Récupère toutes les expériences professionnelles."""
        try:
            experiences = await sync_to_async(list)(
                WorkExperience.objects.filter(language=self.language).order_by('-start_date')
            )
            if experiences:
                self.memory['discovered_experiences'] = [
                    {
                        'company': exp.company,
                        'position': exp.position,
                        'short_description': exp.short_description,
                        'long_description': exp.long_description,
                        'objectif_but': exp.objectif_but,
                        'start_date': str(exp.start_date),
                        'end_date': str(exp.end_date) if exp.end_date else "Présent",
                        'location': exp.location
                    }
                    for exp in experiences
                ]
                return json.dumps(self.memory['discovered_experiences'], ensure_ascii=False)
            return "Aucune expérience trouvée."
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des expériences: {e}")
            return "Erreur lors de la récupération des expériences."

    async def get_skills(self) -> str:
        """Récupère toutes les compétences."""
        try:
            skills = await sync_to_async(list)(
                Skill.objects.all()
            )
            if skills:
                # Organiser les compétences par type
                skills_by_type = {}
                for skill in skills:
                    if skill.type not in skills_by_type:
                        skills_by_type[skill.type] = []
                    skills_by_type[skill.type].append(skill.name)
                
                self.memory['discovered_skills'] = skills_by_type
                return json.dumps(skills_by_type, ensure_ascii=False)
            return "Aucune compétence trouvée."
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des compétences: {e}")
            return "Erreur lors de la récupération des compétences."









