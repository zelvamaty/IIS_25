from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import CourseSerializer, UserSerializer, RoomSerializer
from .models import Course, User, Room, Term, Registration

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class IsGuaranteeOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return (request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or obj.guarantee == request.user))

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrReadOnly]


    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'ADMIN':
                return User.objects.all()
            else:
                return User.objects.filter(id=user.id)
        return User.objects.none()

    @action (detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request, pk=None):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    #admin can edit users TODO: missing password change
    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def patch_user(self, request, pk=None):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], permission_classes=[IsAdmin])
    def delete_user(self, request, pk=None):
        user = self.get_object()
        user.delete()
        return Response({'detail': 'User deleted.'})


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    http_method_names = ['get', 'post', 'head']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'ADMIN':
                return Course.objects.all()
            else:
                return Course.objects.filter(approved=True) | Course.objects.filter(guarantee=user)
        return Course.objects.filter(approved=True)

    def perform_create(self, serializer):
        serializer.save(guarantee=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        course = self.get_object()
        print(f"User role: {request.user.role}")
        if request.user.role != 'ADMIN':
            return Response({'detail': 'Only admins can approve courses.'}, status=403)
        course.approved = True
        course.save()
        return Response({'detail': 'Course approved.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        course = self.get_object()
        if request.user.role != 'ADMIN':
            return Response({'detail': 'Only admins can reject courses.'}, status=403)
        course.approved = False
        course.save()
        return Response({'detail': 'Course rejected.'})

    @action(detail=True, methods=['patch'], permission_classes=[IsGuaranteeOrAdmin])
    def patch_course(self, request, pk=None):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    #delete course
    @action(detail=True, methods=['delete'], permission_classes=[IsGuaranteeOrAdmin])
    def delete_course(self, request, pk=None):
        course = self.get_object()
        course.delete()
        return Response({'detail': 'Course deleted.'})


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'ADMIN':
                return Room.objects.all()
        return Room.objects.none()











