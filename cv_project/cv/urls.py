from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonalInfoViewSet, EducationViewSet, WorkExperienceViewSet, SkillViewSet, ProjectViewSet, LanguageViewSet, HobbyViewSet, CertificationViewSet, cv_view, cv_api, generate_pdf
from django.contrib import admin

router = DefaultRouter()
router.register(r'personal-info', PersonalInfoViewSet)
router.register(r'education', EducationViewSet)
router.register(r'work-experience', WorkExperienceViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'languages', LanguageViewSet)
router.register(r'hobbies', HobbyViewSet)
router.register(r'certifications', CertificationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('cv/', cv_view, name='cv_view'),
    path('api/cv-html/', cv_api, name='cv_api'),
    path('api/generate-pdf/', generate_pdf, name='generate_pdf'),
]
