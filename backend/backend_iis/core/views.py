from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response


from .serializers import CourseSerializer, UserSerializer, RoomSerializer, TermSerializer, MyPasswordChangeSerializer, \
    GradeSerializer, RegisterSerializer, RegistrationSerializer
from .models import Course, User, Room, Term, Registration, CourseEnrollment, Grade

def is_admin(user):
    return user and user.is_authenticated and user.role == 'ADMIN'
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)

class IsGuaranteeOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return is_admin(request.user) or obj.guarantee == request.user

class IsLecturerOrGuaranteeOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Course):  # If obj is a Course
            return (
                is_admin(request.user) or
                obj.guarantee == request.user or
                request.user in obj.lecturers.all()
            )
        elif hasattr(obj, 'registration'):  # If obj is related to a Grade
            course = obj.registration.term.course
            return (
                is_admin(request.user) or
                course.guarantee == request.user or
                request.user in course.lecturers.all()
            )
        return False
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user)

class IsGuaranteeOrAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user) or obj.guarantee == request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrReadOnly]


    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'ADMIN':
                return User.objects.all()
            return User.objects.exclude(role='ADMIN')
        return User.objects.none()

    @action (detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request, pk=None):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard(self, request, pk=None):
        user = self.get_object()
        if request.user != user and not is_admin(request.user):
            return Response({'detail': 'You do not have permission to view this dashboard.'}, status=403)
        serializer = self.get_serializer(user)
        data = serializer.data
        data['courses_guaranteed'] = Course.objects.filter(guarantee=user).count()
        data['courses_lectured'] = Course.objects.filter(lecturers=user).count()
        data['courses_enrolled'] = CourseEnrollment.objects.filter(user=user, role='APPROVED').count()
        return Response(data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def patch_user(self, request, pk=None):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_user(self, request, pk=None):
        user = self.get_object()
        if request.user.role != 'ADMIN' and request.user != user: # only admin or self can delete
            return Response({'detail': 'You do not have permission to delete this user.'}, status=403)
        user.delete()
        return Response({'detail': 'User deleted.'})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        user = request.user
        serializer = MyPasswordChangeSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            new_password = serializer.validated_data['new_password1']
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Password changed successfully.'})

        return Response(serializer.errors, status=400)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    http_method_names = ['get', 'post', 'head', 'patch', 'delete']

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

    @action(detail=True, methods=['post'], permission_classes=[IsGuaranteeOrAdmin])
    def add_lecturer(self, request, pk=None):
        course = self.get_object()
        lecturer_id = request.data.get('lecturer_id')
        try:
            lecturer = User.objects.get(id=lecturer_id)
        except User.DoesNotExist:
            return Response({'detail': 'Lecturer not found.'}, status=404)
        course.lecturers.add(lecturer)
        return Response({'detail': 'Lecturer added to course.'})

    @action(detail=True, methods=['post'], permission_classes=[IsGuaranteeOrAdmin])
    def remove_lecturer(self, request, pk=None):
        course = self.get_object()
        lecturer_id = request.data.get('lecturer_id')
        try:
            lecturer = User.objects.get(id=lecturer_id)
        except User.DoesNotExist:
            return Response({'detail': 'Lecturer not found.'}, status=404)
        course.lecturers.remove(lecturer)
        return Response({'detail': 'Lecturer removed from course.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if not course.approved:
            return Response({'detail': 'Cannot enroll in unapproved course.'}, status=400)

        if course.course_enrollments.filter(user=user).exists():
            return Response({'detail': 'Already enrolled in this course.'}, status=400)

        if user == course.guarantee or user in course.lecturers.all():
            return Response({'detail': 'Guarantee or lecturer cannot enroll as student.'}, status=400)

        if course.enrolled_count() >= course.capacity:
            return Response({'detail': 'Course is full.'}, status=400)

        course.course_enrollments.create(user=user, role='PENDING')

        if course.auto_confirm:
            if course.enrolled_count() < course.capacity:
                enrollment = course.course_enrollments.get(user=user)
                enrollment.role = 'APPROVED'
                enrollment.save()
                return Response({'detail': 'Enrolled in course successfully.'})

        return Response({'detail': 'Pending approval for enrollment.'})

    @action(detail=True, methods=['post'], permission_classes=[IsGuaranteeOrAdmin])
    def approve_enrollment(self, request, pk=None):
        course = self.get_object()
        enrollment_id = request.data.get('enrollment_id')
        try:
            enrollment = course.course_enrollments.get(id=enrollment_id, role='PENDING')
        except CourseEnrollment.DoesNotExist:
            return Response({'detail': 'Pending enrollment not found.'}, status=404)
        enrollment.role = 'APPROVED'
        enrollment.save()
        return Response({'detail': 'Enrollment approved.'})

    @action(detail=True, methods=['post'], permission_classes=[IsGuaranteeOrAdmin])
    def reject_enrollment(self, request, pk=None):
        course = self.get_object()
        enrollment_id = request.data.get('enrollment_id')
        try:
            enrollment = course.course_enrollments.get(id=enrollment_id, role='PENDING')
        except CourseEnrollment.DoesNotExist:
            return Response({'detail': 'Pending enrollment not found.'}, status=404)
        enrollment.role = 'REJECTED'
        enrollment.save()
        return Response({'detail': 'Enrollment rejected.'})

    @action(detail=True, methods=['get'], permission_classes=[IsLecturerOrGuaranteeOrAdmin])
    def list_students(self, request, pk=None):
        course = self.get_object()
        if (is_admin(request.user) or course.guarantee == request.user):
            students = course.course_enrollments.select_related('user')
            student_data = [{'id': enrollment.user.id, 'username': enrollment.user.username,
                             'first_name': enrollment.user.first_name, 'last_name': enrollment.user.last_name,
                             'role': enrollment.role}
                            for enrollment in students]
            return Response(student_data)
        if request.user in course.lecturers.all():
            students = course.course_enrollments.filter(role='APPROVED').select_related('user')
            student_data = [{'id': enrollment.user.id, 'username': enrollment.user.username,
                             'first_name': enrollment.user.first_name, 'last_name': enrollment.user.last_name}
                            for enrollment in students]
            return Response(student_data)
        return Response({'detail': 'You do not have permission to view students of this course.'}, status=403)




class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Room.objects.all()

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def patch_room(self, request, pk=None):
        room = self.get_object()
        serializer = self.get_serializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], permission_classes=[IsAdmin])
    def delete_room(self, request, pk=None):
        room = self.get_object()
        room.delete()
        return Response({'detail': 'Room deleted.'})




class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [IsGuaranteeOrAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Term.objects.all()


    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def patch_term(self, request, pk=None):
        term = self.get_object()
        serializer = self.get_serializer(term, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], permission_classes=[IsAdmin])
    def delete_term(self, request, pk=None):
        term = self.get_object()
        term.delete()
        return Response({'detail': 'Term deleted.'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def schedule(self, request, pk=None):
        user = request.user
        registrations = Registration.objects.filter(user=user).select_related('term')
        term_data = [{'id': reg.term.id, 'course': reg.term.course.title,
                      'room': reg.term.room.name, 'type': reg.term.type,
                      'start_time': reg.term.start_time, 'end_time': reg.term.end_time}
                     for reg in registrations]
        return Response(term_data)


class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Registration.objects.filter(user=user)
        return Registration.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        term = serializer.validated_data['term']
        course = term.course
        if not course.approved:
            raise ValidationError('Cannot register for unapproved course.')
        if Registration.objects.filter(user=user, term=term).exists():
            raise ValidationError('Already registered for this term.')
        if user == course.guarantee or user in course.lecturers.all():
            raise ValidationError('Guarantee or lecturer cannot register as student.')
        if course.enrolled_count() >= course.capacity:
            raise ValidationError('Course is full.')

        serializer.save(user=user)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_registration(self, request, pk=None):
        registration = self.get_object()
        user = request.user
        course = registration.term.course
        if registration.user != user and not is_admin(user) and course.guarantee != user:
            return Response({'detail': 'You do not have permission to delete this registration.'}, status=403)
        registration.delete()
        return Response({'detail': 'Registration deleted.'})

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsLecturerOrGuaranteeOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'ADMIN':
                return Grade.objects.all()

            else:
                return Grade.objects.filter(
                    registration__term__course__guarantee=user
                ) | Grade.objects.filter(
                    registration__term__course__lecturers=user
                )
        return Grade.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        registration = serializer.validated_data['registration']
        course = registration.term.course
        if not (is_admin(user) or course.guarantee == user or user in course.lecturers.all()):
            raise ValidationError('You do not have permission to grade for this course.')
        serializer.save(graded_by=user)

    @action(detail=True, methods=['patch'], permission_classes=[IsLecturerOrGuaranteeOrAdmin])
    def patch_grade(self, request, pk=None):
        grade = self.get_object()
        serializer = self.get_serializer(grade, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(graded_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)














