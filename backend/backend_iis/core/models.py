from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.models import AbstractUser

# defining user roles
class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    USER = 'USER', 'Registered user'
    VIEWER = 'VIEWER', 'Viewer'

class UserCourseRole(models.TextChoices):
    APPROVED = 'APPROVED', 'Approved'
    PENDING = 'PENDING', 'Pending'
    REJECTED = 'REJECTED', 'Rejected'
    DEFAULT = 'DEFAULT', 'Default'

class TermType(models.TextChoices):
    LECTURE = 'LECTURE', 'Lecture'
    EXERCISE = 'EXERCISE', 'Exercise'
    LAB = 'LAB', 'Lab'
    ASSIGNMENT = 'ASSIGNMENT', 'Assignment'
    EXAM = 'EXAM', 'Exam'

class CourseType(models.TextChoices):
    HARDWARE = 'HARDWARE', 'Hardware'
    OS = 'OS', 'Operating Systems'
    AI = 'AI', 'Artificial Intelligence'
    WEB = 'WEB', 'Web Development'
    SECURITY = 'SECURITY', 'Security'
    NETWORKS = 'NETWORKS', 'Networks'
    OTHER = 'OTHER', 'Other'




# model for users
class User(AbstractUser):
    role = models.CharField(
        max_length=25,
        choices=UserRole.choices,
        default=UserRole.USER,
    )

    # def create_admin_user(self, username, email, password):
    #     self.role = UserRole.ADMIN
    #     return self
    def __str__(self):
        return f"{self.username} ({self.role})"

class CourseEnrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='course_enrollments')
    role = models.CharField(
        max_length=25,
        choices=UserCourseRole.choices,
        default=UserCourseRole.PENDING,
    )

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.role})"

class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(
        max_length=25,
        choices=CourseType.choices,
        default=CourseType.OTHER,
        blank=False,
        null=False
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    capacity = models.PositiveIntegerField(default=30)
    guarantee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='guaranteed_courses')
    lecturers = models.ManyToManyField(User, related_name='lectured_courses', blank=True)
    auto_confirm = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    def enrolled_count(self):
        return self.course_enrollments.count()

class Room(models.Model):
    name = models.CharField(max_length=100, unique=True)
    capacity = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=200)


    def __str__(self):
        return self.name

class Term(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='terms')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='terms', null=True, blank=True)
    requires_registration = models.BooleanField(default=True)
    capacity = models.PositiveIntegerField(default=30)
    type = models.CharField(
        max_length=25,
        choices=TermType.choices,
        default=TermType.LECTURE,
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f"{self.course.title} in {self.room.name} from {self.start_time} to {self.end_time}"

class Registration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='registrations')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'term')

    def __str__(self):
        return f"{self.user.username} registered {self.term.course.title} on {self.registered_at}"

class Grade(models.Model):
    registration = models.OneToOneField(Registration, on_delete=models.CASCADE, related_name='grade')
    value = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])

    graded_at = models.DateTimeField(auto_now_add=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='graded')

    def __str__(self):
        return f"{self.registration.user.username} - {self.value}"
