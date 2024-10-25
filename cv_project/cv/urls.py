from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PersonalInfoViewSet, EducationViewSet, WorkExperienceViewSet, 
    SkillViewSet, ProjectViewSet, LanguageViewSet, HobbyViewSet, 
    CertificationViewSet, cv_view, cv_api, generate_pdf, get_api_url,
    mistral_interaction, initialize_mistral
)
from django.contrib import admin
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'personal-info', PersonalInfoViewSet, basename='personal-info')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'work-experience', WorkExperienceViewSet, basename='work-experience')
router.register(r'skills', SkillViewSet, basename='skills')
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'languages', LanguageViewSet, basename='languages')
router.register(r'hobbies', HobbyViewSet, basename='hobbies')
router.register(r'certifications', CertificationViewSet, basename='certifications')

urlpatterns = [
    path('api/', include(router.urls)),
    path('cv/', cv_view, name='cv_view'),
    path('api/cv-html/', cv_api, name='cv_api'),
    path('api/generate-pdf/', generate_pdf, name='generate_pdf'),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('api/get-api-url/', get_api_url, name='get_api_url'),
    path('api/mistral/', mistral_interaction, name='mistral_interaction'),
    path('api/initialize-mistral/', initialize_mistral, name='initialize_mistral'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
