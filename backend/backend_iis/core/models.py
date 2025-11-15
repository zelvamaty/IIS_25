from django.db import models
from django.contrib.auth.models import AbstractUser

# defining user roles
class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    USER = 'USER', 'Registered user'
    VIEWER = 'VIEWER', 'Viewer'

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

class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    capacity = models.PositiveIntegerField(default=30)
    guarantee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='guaranteed_courses')
    approved = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Room(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=200)


    def __str__(self):
        return self.name

class Term(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='terms')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='terms')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f"{self.course.title} in {self.room.name} from {self.start_time} to {self.end_time}"

class Registration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='registrations')
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} registered {self.term.course.title} on {self.registered_at}"
