from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import render
from django.template.loader import render_to_string, get_template
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from PIL import Image
import base64
from io import BytesIO
import os
import json

import logging

from rest_framework.decorators import api_view
import requests
from .AIAssistant import AIAssistant
import asyncio
from asgiref.sync import async_to_sync
import time

if settings.USE_FIRESTORE:
    from firebase_admin import firestore
    db = firestore.Client(project=os.getenv('PROJECT_ID'), database=os.getenv('DATABASE_ID'))
else:
    from .models import PersonalInfo, Education, WorkExperience, Skill, Project, Language, Hobby, Certification
    from .serializers import PersonalInfoSerializer, EducationSerializer, WorkExperienceSerializer, SkillSerializer, ProjectSerializer, LanguageSerializer, HobbySerializer, CertificationSerializer

class LanguageFilterMixin:
    def get_queryset(self):
        if settings.USE_FIRESTORE:
            language = self.request.query_params.get('lang', 'fr')
            return [doc.to_dict() for doc in db.collection(self.collection_name).where('language', '==', language).get()]
        else:
            return super().get_queryset().filter(language=self.request.query_params.get('lang', 'fr'))

class BaseViewSet(LanguageFilterMixin, viewsets.ModelViewSet):
    def list(self, request):
        if settings.USE_FIRESTORE:
            queryset = self.get_queryset()
            return Response(queryset)
        else:
            return super().list(request)

class PersonalInfoViewSet(BaseViewSet):
    collection_name = 'personal_info'
    queryset = PersonalInfo.objects.all() if not settings.USE_FIRESTORE else None
    serializer_class = PersonalInfoSerializer if not settings.USE_FIRESTORE else None
    basename = 'personal-info'

class EducationViewSet(BaseViewSet):
    collection_name = 'education'
    queryset = Education.objects.all() if not settings.USE_FIRESTORE else None
    serializer_class = EducationSerializer if not settings.USE_FIRESTORE else None
    basename = 'education'

class WorkExperienceViewSet(BaseViewSet):
    collection_name = 'work_experience'
    queryset = WorkExperience.objects.all() if not settings.USE_FIRESTORE else None
    serializer_class = WorkExperienceSerializer if not settings.USE_FIRESTORE else None
    basename = 'work-experience'

class SkillViewSet(BaseViewSet):
    collection_name = 'skill'
    queryset = Skill.objects.all() if not settings.USE_FIRESTORE else None
    serializer_class = SkillSerializer if not settings.USE_FIRESTORE else None
    basename = 'skills'

    def get_queryset(self):
        if settings.USE_FIRESTORE:
            return [doc.to_dict() for doc in db.collection(self.collection_name).get()]
        else:
            return Skill.objects.all()

    def list(self, request):
        queryset = self.get_queryset()
        if settings.USE_FIRESTORE:
            return Response(queryset)
        else:
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

class ProjectViewSet(BaseViewSet):
    collection_name = 'project'
    queryset = Project.objects.all() if not settings.USE_FIRESTORE else None
    serializer_class = ProjectSerializer if not settings.USE_FIRESTORE else None
    basename = 'projects'

class LanguageViewSet(BaseViewSet):
    collection_name = 'language'
    queryset = Language.objects.all() if not settings.USE_FIRESTORE else None
    serializer_class = LanguageSerializer if not settings.USE_FIRESTORE else None
    basename = 'languages'

class HobbyViewSet(BaseViewSet):
    collection_name = 'hobby'
    queryset = Hobby.objects.all() if not settings.USE_FIRESTORE else None
    serializer_class = HobbySerializer if not settings.USE_FIRESTORE else None
    basename = 'hobbies'

class CertificationViewSet(BaseViewSet):
    collection_name = 'certification'
    queryset = Certification.objects.all() if not settings.USE_FIRESTORE else None
    serializer_class = CertificationSerializer if not settings.USE_FIRESTORE else None
    basename = 'certifications'

def generate_qr_code(data, logo_path=None, logo_position='center',scale = 0.33):
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white", image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer())

    if logo_path:
        logo = Image.open(logo_path)
        basewidth = int(img.size[0] * scale)
        wpercent = (basewidth / float(logo.size[0]))
        hsize = int((float(logo.size[1]) * float(wpercent)))
        logo = logo.resize((basewidth, hsize), Image.LANCZOS)
        
        if logo_position == 'bottomright':
            pos = (img.size[0] - logo.size[0] - 10, img.size[1] - logo.size[1] - 10)
        elif logo_position == 'bottomleft':
            pos = (10, img.size[1] - logo.size[1] - 10)
        elif logo_position == 'center':
            pos = (img.size[0] // 2 - logo.size[0] // 2, img.size[1] // 2 - logo.size[1] // 2)
        else:
            pos = (img.size[0] - logo.size[0] - 10, img.size[1] - logo.size[1] - 10)
        
        logo_with_transparency = Image.new('RGBA', img.size, (0, 0, 0, 0))
        logo_with_transparency.paste(logo, pos, logo)
        
        img = Image.alpha_composite(img.convert('RGBA'), logo_with_transparency)

    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

def get_cv_context(lang='fr', theme='light', request=None):
    if settings.USE_FIRESTORE:
        db = firestore.Client(project=os.getenv('PROJECT_ID'), database=os.getenv('DATABASE_ID'))
        
        # Personal Info
        personal_info_docs = db.collection('personal_info').where('language', '==', lang).limit(1).get()
        personal_info = next((doc.to_dict() for doc in personal_info_docs), None)
        
        if not personal_info:
            logging.error(f"No personal info found for language: {lang}")
            return None

        linkedin_logo_path = os.path.join(settings.STATIC_ROOT, 'images', 'linkedin-logo.png')
        github_logo_path = os.path.join(settings.STATIC_ROOT, 'images', 'github-logo.png')
        
        page_qr = generate_qr_code(request.build_absolute_uri() if request else "", scale=2)
        linkedin_qr = generate_qr_code(personal_info.get('linkedin_url'), linkedin_logo_path) if personal_info and 'linkedin_url' in personal_info else None
        github_qr = generate_qr_code(personal_info.get('github_url'), github_logo_path) if personal_info and 'github_url' in personal_info else None
        
        # Other collections
        education = [doc.to_dict() for doc in db.collection('education').where('language', '==', lang).get()]
        work_experience = [doc.to_dict() for doc in db.collection('work_experience').where('language', '==', lang).get()]
        skills = [doc.to_dict() for doc in db.collection('skills').get()]
        projects = [doc.to_dict() for doc in db.collection('project').where('language', '==', lang).get()]
        languages = [doc.to_dict() for doc in db.collection('language').get()]  # Sans filtre de langue
        hobbies = [doc.to_dict() for doc in db.collection('hobby').where('language', '==', lang).get()]
        certifications = [doc.to_dict() for doc in db.collection('certification').where('language', '==', lang).get()]
        
        skills_data = {
            'programming_languages': [skill for skill in skills if skill['type'] == 'programming_languages'],
            'hard_skills': [skill for skill in skills if skill['type'] == 'hard_skills'],
            'soft_skills': [skill for skill in skills if skill['type'] == 'soft_skills'],
        }
    else:
        # Le code pour SQLite reste inchangé
        personal_info = PersonalInfo.objects.filter(language=lang).first()
        
        if not personal_info:
            logging.error(f"No personal info found for language: {lang}")
            return None

        portfolio_logo_path = os.path.join(settings.STATIC_ROOT, 'images', 'portfolio-logo.png')
        linkedin_logo_path = os.path.join(settings.STATIC_ROOT, 'images', 'linkedin-logo.png')
        github_logo_path = os.path.join(settings.STATIC_ROOT, 'images', 'github-logo.png')
        
        page_qr = generate_qr_code(request.build_absolute_uri() if request else "", portfolio_logo_path)
        linkedin_qr = generate_qr_code(personal_info.linkedin_url, linkedin_logo_path) if personal_info and personal_info.linkedin_url else None
        github_qr = generate_qr_code(personal_info.github_url, github_logo_path) if personal_info and personal_info.github_url else None
        
        education = Education.objects.filter(language=lang)
        work_experience = WorkExperience.objects.filter(language=lang)
        skills = Skill.objects.all()
        projects = Project.objects.filter(language=lang)
        languages = Language.objects.all()  # Sans filtre de langue
        hobbies = Hobby.objects.filter(language=lang)
        certifications = Certification.objects.filter(language=lang)
        
        skills_data = {
            'programming_languages': [skill for skill in skills if skill.type == 'programming_languages'],
            'hard_skills': [skill for skill in skills if skill.type == 'hard_skills'],
            'soft_skills': [skill for skill in skills if skill.type == 'soft_skills'],
        }
    
    return {
        'personal_info': personal_info,
        'education': education,
        'work_experience': work_experience,
        'skills': skills_data,
        'projects': projects,
        'languages': languages,
        'hobbies': hobbies,
        'certifications': certifications,
        'lang': lang,
        'theme': theme,
        'qr_codes': {
            'page': page_qr,
            'linkedin': linkedin_qr,
            'github': github_qr,
        },
    }

def cv_view(request):
    lang = request.GET.get('lang', 'fr')
    theme = request.GET.get('theme', 'light')
    print_mode = request.GET.get('print', 'false') == 'true'
    
    context = get_cv_context(lang, theme, request)
    context['print_mode'] = print_mode
    
    return render(request, 'cv/cv_template_pdf.html', context)

def cv_api(request):
    lang = request.GET.get('lang', 'fr')
    theme = request.GET.get('theme', 'light')
    context = get_cv_context(lang, theme, request)
    html = render_to_string('cv/cv_template.html', context)
    return HttpResponse(html)

@csrf_exempt
def generate_pdf(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        lang = data.get('lang', 'fr')
        theme = data.get('theme', 'light')
        css_string = data.get('css', '')
        
        context = get_cv_context(lang, theme, request)
        
        template = get_template('cv/cv_template.html')
        html_string = template.render(context)

        font_config = FontConfiguration()
        css = CSS(string=css_string, font_config=font_config)

        html = HTML(string=html_string, base_url=request.build_absolute_uri())
        pdf = html.write_pdf(stylesheets=[css], font_config=font_config)

        response = HttpResponse(pdf, content_type='application/pdf')
        nom_prenom = context['personal_info']['name'].replace(' ', '_') if isinstance(context['personal_info'], dict) else context['personal_info'].name.replace(' ', '_')
        response['Content-Disposition'] = f'attachment; filename="CV_{nom_prenom}.pdf"'
        return response
    
    return HttpResponse("Méthode non autorisée", status=405)

def get_api_url(request):
    return JsonResponse({'apiUrl': os.environ.get('REACT_APP_API_URL', 'http://localhost:8000')})

def event_stream(assistant, user_input):
    response_generator = assistant.process_message(user_input)
    for chunk in response_generator:
        yield f"data: {json.dumps({'content': chunk})}\n\n"

@api_view(['POST'])
def mistral_interaction(request):
    user_input = request.data.get('prompt')
    language = request.data.get('language', 'fr')
    
    # Utiliser l'ID de session ou créer un ID unique pour l'utilisateur
    session_id = request.session.session_key or 'default_session'
    
    # Obtenir l'instance persistante de l'assistant
    assistant = AIAssistant.get_instance(session_id, language)

    def stream_response():
        try:
            # Créer une nouvelle boucle d'événements pour les appels asynchrones
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            # 1. Première requête pour identifier les tools à utiliser
            system_message = assistant.get_system_message()
            messages = [system_message] + assistant.conversation_history + [{"role": "user", "content": user_input}]
            
            # 2. Le modèle choisit les tools
            response = assistant.mistral.client.chat.complete(
                model=assistant.mistral.model,
                messages=messages,
                tools=assistant.get_tools(),
                tool_choice="any"
            )

            # 3. Ajouter la réponse de l'assistant avec le tool call
            assistant_message = response.choices[0].message
            messages.append({"role": "assistant", "content": assistant_message.content, "tool_calls": assistant_message.tool_calls})

            time.sleep(1)  # Respecter le rate limit

            # 4. Exécuter les tools et ajouter leurs résultats
            if assistant_message.tool_calls:
                dataContent = json.dumps({'content': 'Je vérifie les informations...\n'})
                yield f"data: {dataContent}\n\n"
                
                for tool_call in assistant_message.tool_calls:
                    function_name = tool_call.function.name
                    print(f"4. Exécution de la fonction: {function_name}")
                    if hasattr(assistant, function_name):
                        # Exécuter la fonction de manière synchrone via la boucle d'événements
                        result = loop.run_until_complete(getattr(assistant, function_name)())
                        print(f"5. Résultat obtenu: {result[:100]}...")  # Affiche les 100 premiers caractères
                        messages.append({
                            "role": "tool",
                            "name": function_name,
                            "content": result,
                            "tool_call_id": tool_call.id
                        })

                # Attendre 1 seconde avant la requête finale > free tier limit 1 rps
                time.sleep(1)

                print("6. Démarrage du streaming final...")
                current_message = ""
                stream = assistant.mistral.client.chat.stream(
                    model=assistant.mistral.model,
                    messages=messages
                )
                
                for chunk in stream:
                    if chunk.data.choices[0].delta.content:
                        content = chunk.data.choices[0].delta.content
                        current_message += content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                
                # Sauvegarder dans l'historique
                assistant.append_to_history({"role": "user", "content": user_input})
                assistant.append_to_history({"role": "assistant", "content": current_message})
            else:
                # Si pas de tool calls, on stream directement la première réponse
                content = assistant_message.content
                for char in content:
                    yield f"data: {json.dumps({'content': char})}\n\n"
                    time.sleep(0.01)  # Petit délai pour simuler le streaming
                
                assistant.append_to_history({"role": "user", "content": user_input})
                assistant.append_to_history({"role": "assistant", "content": content})

            # Fermer la boucle d'événements
            loop.close()
                    
        except Exception as e:
            print(f"Error in stream_response: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingHttpResponse(
        streaming_content=stream_response(),
        content_type='text/event-stream'
    )

@api_view(['GET'])
def initialize_mistral(request):
    language = request.query_params.get('language', 'fr')
    try:
        assistant = AIAssistant(language)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        initial_context = loop.run_until_complete(assistant.initialize())
        loop.close()
        return Response({
            "status": "success",
            "context": initial_context
        })
    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)







