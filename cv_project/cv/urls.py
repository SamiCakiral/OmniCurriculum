from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonalInfoViewSet, EducationViewSet, WorkExperienceViewSet, SkillViewSet, ProjectViewSet
from django.contrib import admin

router = DefaultRouter()
router.register(r'personal-info', PersonalInfoViewSet)
router.register(r'education', EducationViewSet)
router.register(r'work-experience', WorkExperienceViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]