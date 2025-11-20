from rest_framework import routers
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, UserViewSet, RoomViewSet, TermViewSet, RegistrationViewSet, GradeViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')

router.register(r'users', UserViewSet, basename='user')

router.register(r'rooms', RoomViewSet, basename='room')

router.register(r'terms', TermViewSet, basename='term')
router.register(r'registrations', RegistrationViewSet, basename='registration')
router.register(r'grades', GradeViewSet, basename='grade')


urlpatterns = [
    path('', include(router.urls)),

    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),

]