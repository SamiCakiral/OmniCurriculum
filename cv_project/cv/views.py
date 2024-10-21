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
