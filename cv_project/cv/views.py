from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import render
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.template.loader import get_template
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
from django.conf import settings
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from PIL import Image
import base64
from io import BytesIO
from django.views.decorators.csrf import csrf_exempt
import os
import json
from .models import PersonalInfo, Education, WorkExperience, Skill, Project, Language, Hobby, Certification
from .serializers import PersonalInfoSerializer, EducationSerializer, WorkExperienceSerializer, SkillSerializer, ProjectSerializer, LanguageSerializer, HobbySerializer, CertificationSerializer

class LanguageFilterMixin:
    def get_queryset(self):
        queryset = super().get_queryset()
        language = self.request.query_params.get('lang', 'fr')
        return queryset.filter(language=language)

class PersonalInfoViewSet(LanguageFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = PersonalInfo.objects.all()
    serializer_class = PersonalInfoSerializer

class EducationViewSet(LanguageFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer

class WorkExperienceViewSet(LanguageFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = WorkExperience.objects.all()
    serializer_class = WorkExperienceSerializer

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class ProjectViewSet(LanguageFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer

class HobbyViewSet(LanguageFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Hobby.objects.all()
    serializer_class = HobbySerializer

class CertificationViewSet(LanguageFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer

def generate_qr_code(data, logo_path=None, logo_position='bottomright'):
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white", image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer())

    if logo_path:
        logo = Image.open(logo_path)
        # Redimensionner le logo pour qu'il occupe environ 15% du QR code
        basewidth = int(img.size[0] * 0.10)
        wpercent = (basewidth / float(logo.size[0]))
        hsize = int((float(logo.size[1]) * float(wpercent)))
        logo = logo.resize((basewidth, hsize), Image.LANCZOS)
        
        # Calculer la position pour le logo dans le coin
        if logo_position == 'bottomright':
            pos = (img.size[0] - logo.size[0] - 10, img.size[1] - logo.size[1] - 10)
        elif logo_position == 'bottomleft':
            pos = (10, img.size[1] - logo.size[1] - 10)
        else:  # Par défaut, en bas à droite
            pos = (img.size[0] - logo.size[0] - 10, img.size[1] - logo.size[1] - 10)
        
        # Créer une nouvelle image avec un fond transparent pour le logo
        logo_with_transparency = Image.new('RGBA', img.size, (0, 0, 0, 0))
        logo_with_transparency.paste(logo, pos, logo)
        
        # Combiner le QR code avec le logo
        img = Image.alpha_composite(img.convert('RGBA'), logo_with_transparency)

    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

def get_cv_context(lang='fr', theme='light', request=None):
    personal_info = PersonalInfo.objects.filter(language=lang).first()
    
    # Chemins vers les logos
    linkedin_logo_path = os.path.join(settings.STATIC_ROOT, 'images', 'linkedin-logo.png')
    github_logo_path = os.path.join(settings.STATIC_ROOT, 'images', 'github-logo.png')
    
    # Generate QR codes
    page_qr = generate_qr_code(request.build_absolute_uri() if request else "")
    linkedin_qr = generate_qr_code(personal_info.linkedin_url, linkedin_logo_path) if personal_info and personal_info.linkedin_url else None
    github_qr = generate_qr_code(personal_info.github_url, github_logo_path) if personal_info and personal_info.github_url else None
    
    return {
        'personal_info': PersonalInfo.objects.filter(language=lang).first(),
        'education': Education.objects.filter(language=lang),
        'work_experience': WorkExperience.objects.filter(language=lang),
        'skills': {
            'programming_languages': Skill.objects.filter(type='programming_languages'),
            'hard_skills': Skill.objects.filter(type='hard_skills'),
            'soft_skills': Skill.objects.filter(type='soft_skills'),
        },
        'projects': Project.objects.filter(language=lang),
        'languages': Language.objects.all(),
        'hobbies': Hobby.objects.filter(language=lang),
        'certifications': Certification.objects.filter(language=lang),
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
    
    return render(request, 'cv/cv_template.html', context)

def cv_api(request):
    lang = request.GET.get('lang', 'fr')
    theme = request.GET.get('theme', 'light')
    context = get_cv_context(lang, theme,request)
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
        nom_prenom = context['personal_info'].name.replace(' ', '_')
        response['Content-Disposition'] = f'attachment; filename="CV_{nom_prenom}.pdf"'
        return response
    
    return HttpResponse("Méthode non autorisée", status=405)
