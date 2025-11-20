from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from backend_iis.core.models import ( 
    Course, Room, Term, Registration, UserRole
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial data based on the assignment'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        try:
            with transaction.atomic():
                self.stdout.write('Cleaning old data...')
                Course.objects.all().delete()
                Room.objects.all().delete()
                Term.objects.all().delete()
                Registration.objects.all().delete()
                User.objects.exclude(is_superuser=True).delete()

                # Password for all users will be 'pass1234'
                common_password = 'pass1234'
                
                self.stdout.write('Creating Users...')

                # -- Admin --
                admin_user = User.objects.create_user(
                    username='admin_main',
                    email='admin@test.com',
                    password=common_password,
                    first_name='Super',
                    last_name='Admin',
                    role=UserRole.ADMIN
                )

                # -- 5 Normal Users --
                users = []
                for i in range(1, 6):
                    u = User.objects.create_user(
                        username=f'user{i}',
                        email=f'user{i}@test.com',
                        password=common_password,
                        first_name=f'User',
                        last_name=f'{i}',
                        role=UserRole.USER
                    )
                    users.append(u)
                
                # Let's identify specific users for specific roles for clarity
                guarantee_user = users[0]  # user1
                student_1 = users[1]       # user2
                student_2 = users[2]       # user3
                student_3 = users[3]       # user4
                student_4 = users[4]       # user5

                # 3. Create Room
                self.stdout.write('Creating Room...')
                room = Room.objects.create(
                    name='Lab 101',
                    capacity=50,
                    location='Building A, 1st Floor'
                )

                # 4. Create 2 Courses
                self.stdout.write('Creating Courses...')
                
                # Course 1
                course1 = Course.objects.create(
                    code='CS101',
                    title='Intro to Python',
                    description='Basic programming concepts',
                    price=100.00,
                    capacity=30,
                    guarantee=guarantee_user, # User1 is guarantee
                    approved=True,
                    auto_confirm=True
                )

                # Course 2
                course2 = Course.objects.create(
                    code='CS202',
                    title='Advanced Django',
                    description='Web development mastery',
                    price=200.00,
                    capacity=20,
                    guarantee=guarantee_user, # User1 is guarantee
                    approved=True,
                    auto_confirm=False
                )

                room1 = Room.objects.create(
                    name="A112",
                    capacity=64
                    location="B/A112"
                )

                room2 = Room.objects.create(
                    name="A113",
                    capacity=64
                    location="B/A113"
                )

                term1 = Term.objects.create(
                    course=course1,
                    room=room1,
                    start_time='08:00',
                    end_time='10:00'
                )

                term2 = Term.objects.create(
                    course=course2,
                    room=room2,
                    start_time='08:00',
                    end_time='10:00'
                )

                reg1 = Registration.objects.create(
                    term=term1,
                    user=student_1
                )

                reg2 = Registration.objects.create(
                    term=term1,
                    user=student_2
                )

                reg3 = Registration.objects.create(
                    term=term2,
                    user=student_3
                )

                reg4 = Registration.objects.create(
                    term=term2,
                    user=student_4
                )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error seeding data: {str(e)}'))
            return

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
        self.stdout.write(f'Admin: {admin_user.username} / {common_password}')
        self.stdout.write(f'Guarantee: {guarantee_user.username}')
        self.stdout.write(f'Lecturers: {lecturer_1.username}, {lecturer_2.username}')
        self.stdout.write(f'Students: {student_1.username}, {student_2.username}')