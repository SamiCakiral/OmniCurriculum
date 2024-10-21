from rest_framework import viewsets
from rest_framework.response import Response
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

class HobbyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hobby.objects.all()
    serializer_class = HobbySerializer

class CertificationViewSet(LanguageFilterMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer

from django.shortcuts import render
from django.template.loader import render_to_string
from django.http import HttpResponse
from .models import PersonalInfo, Education, WorkExperience, Skill, Project

def cv_view(request):
    context = {
        'personal_info': PersonalInfo.objects.first(),
        'education': Education.objects.all(),
        'work_experience': WorkExperience.objects.all(),
        'skills': Skill.objects.all(),
        'projects': Project.objects.all(),
    }
    return render(request, 'cv/cv_template.html', context)

def cv_api(request):
    context = {
        'personal_info': PersonalInfo.objects.first(),
        'education': Education.objects.all(),
        'work_experience': WorkExperience.objects.all(),
        'skills': Skill.objects.all(),
        'projects': Project.objects.all(),
    }
    html = render_to_string('cv/cv_template.html', context)
    return HttpResponse(html)

from django.template.loader import get_template
from weasyprint import HTML, CSS
from django.conf import settings
import os

def generate_pdf(request):
    lang = request.GET.get('lang', 'fr')
    theme = request.GET.get('theme', 'dark')
    
    context = {
        'personal_info': PersonalInfo.objects.filter(language=lang).first(),
        'education': Education.objects.filter(language=lang),
        'work_experience': WorkExperience.objects.filter(language=lang),
        'hard_skills': Skill.objects.filter(type='hard'),
        'soft_skills': Skill.objects.filter(type='soft'),
        'languages': Language.objects.all(),
        'projects': Project.objects.filter(language=lang),
        'certifications': Certification.objects.filter(language=lang),
        'hobbies': Hobby.objects.all(),
        'lang': lang,
        'theme': theme,
    }

    template = get_template('cv/cv_template.html')
    html_string = template.render(context)

    css = CSS(string='''
        @page {
            size: A4;
            margin: 0;
        }
        @font-face {
            font-family: 'Fira Code';
            src: url('path/to/FiraCode-Regular.ttf') format('truetype');
        }
        body {
            font-family: 'Fira Code', monospace;
        }
    ''')

    html = HTML(string=html_string, base_url=request.build_absolute_uri())
    pdf = html.write_pdf(stylesheets=[css])

    response = HttpResponse(pdf, content_type='application/pdf')
    nom_prenom = context['personal_info'].name.replace(' ', '_')
    response['Content-Disposition'] = f'attachment; filename="CV_{nom_prenom}.pdf"'
    return response
