from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from .models import User, Course, Room, Term, Registration, Grade


# serializer inheriting from RegisterSerializer to include name fields
class BetterRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def validate(self, data):
        if len(data.get('password1', '')) < 8:
            raise serializers.ValidationError("Password must contain at least 8 characters.")
        if data.get('password1') != data.get('password2'):
            raise serializers.ValidationError("Passwords don't match each other.")
        return super().validate(data)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        return data

# custom password change serializer
class MyPasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password1 = serializers.CharField(required=True, write_only=True)
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if old_password := data.get('old_password'):
            user = self.context['request'].user
            if not user.check_password(old_password):
                raise serializers.ValidationError("Old password is not correct.")
        if data['new_password1'] != data['new_password2']:
            raise serializers.ValidationError("The two new password fields didn't match.")
        return data

# serializer for User model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

    def to_representation(self, instance):
        user_data = super().to_representation(instance)

        request = self.context.get('request')

        if not request:
            return user_data

        user = request.user


        if not user.is_authenticated:
            user_data.pop('role', None)
            return user_data

        if user.role == 'ADMIN':
            return user_data

        if user != instance:
            user_data.pop('role', None)

        return user_data


class CourseSerializer(serializers.ModelSerializer):
    guarantee = UserSerializer(read_only=True)
    lecturers = UserSerializer(many=True, read_only=True)
    enrolled_count = serializers.IntegerField( read_only=True)

    show_type = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'code', 'title','type','show_type', 'description', 'capacity', 'guarantee', 'approved', 'price', 'lecturers', 'auto_confirm', 'enrolled_count']
        read_only_fields = ['guarantee', 'approved', 'enrolled_count']

    def validate(self, data):
        if 'capacity' in data and data['capacity'] <= 0:
            raise serializers.ValidationError("Capacity must be a positive integer.")

        if 'price' in data and data['price'] < 0:
            raise serializers.ValidationError("Price cannot be negative.")

        if self.instance and 'capacity' in data:
            new_capacity = data['capacity']
            current_enrolled = self.instance.enrolled_count()
            if new_capacity < current_enrolled:
                raise serializers.ValidationError("Course capacity cannot be less than the number of enrolled students.")
        return data

    def get_enrolled_count(self, obj):
        return obj.enrolled_count()

class DashboardSerializer(serializers.ModelSerializer):
    user_roles = serializers.SerializerMethodField()
    class Meta:
        model = Course
        fields = ['id','code','title', 'user_roles']

    def get_user_roles(self, obj):
        user = self.context['request'].user
        if user.role == 'ADMIN':
            return 'Admin'
        elif obj.lecturers.all() == 'LECTURER':
            return 'Lecturer'

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'capacity', 'location']

class TermSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True)

    registrations_count = serializers.IntegerField(source='registrations.count', read_only=True)
    class Meta:
        model = Term
        fields = ['id','name', 'description', 'course', 'course_id', 'type' ,'requires_registration' ,'capacity' , 'registrations_count', 'room', 'start_time', 'end_time']

    def validate(self, data):
        name = data.get('name', getattr(self.instance, 'name', None))
        description = data.get('description', getattr(self.instance, 'description', None))
        start_time = data.get('start_time', getattr(self.instance, 'start_time', None))
        end_time = data.get('end_time', getattr(self.instance, 'end_time', None))
        capacity = data.get('capacity', getattr(self.instance, 'capacity', None))
        room = data.get('room', getattr(self.instance, 'room', None))

        if not name:
            raise serializers.ValidationError("Term name cannot be empty.")
        if not description:
            raise serializers.ValidationError("Term description cannot be empty.")

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError("End time must be after start time.")

        if capacity is not None and capacity <= 0:
            raise serializers.ValidationError("Capacity must be a positive integer.")

        if room and capacity and capacity > room.capacity:
            raise serializers.ValidationError("Term capacity cannot exceed room capacity.")

        if self.instance and capacity is not None:
            current_registrations = self.instance.registrations.count()
            if capacity < current_registrations:
                raise serializers.ValidationError(
                    "Term capacity cannot be less than the number of existing registrations.")

        if data.get('requires_registration') is False:
            course = data.get('course', getattr(self.instance, 'course', None))
            if course and capacity is not None and capacity < course.capacity:
                raise serializers.ValidationError("Term capacity cannot be less than the capacity of the course.")

        if room and start_time and end_time:
            overlapping_terms = Term.objects.filter(
                room=room,
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            if self.instance:
                overlapping_terms = overlapping_terms.exclude(id=self.instance.id)
            if overlapping_terms.exists():
                raise serializers.ValidationError("The selected room is already booked for the specified time slot.")

        return data

class GradeSerializer(serializers.ModelSerializer):
    registration = serializers.PrimaryKeyRelatedField(queryset=Registration.objects.all())
    registration_id = serializers.IntegerField(source='registration.id', read_only=True)
    class Meta:
        model = Grade
        fields = ['id', 'registration', 'registration_id', 'value', 'graded_at', 'graded_by']

    def validate_value(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Grade value must be between 0 and 100.")
        return value

class RegistrationSerializer(serializers.ModelSerializer):
    term_id = serializers.PrimaryKeyRelatedField(queryset=Term.objects.all(), source='term', write_only=True)
    grade = GradeSerializer(read_only=True)
    graded_by = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = ['id', 'user', 'user_id', 'term', 'term_id', 'registered_at', 'grade', 'graded_by']
        read_only_fields = ['registered_at', 'id', 'user', 'term', 'grade']

    def get_graded_by(self, obj):
        try:
            if hasattr(obj, 'grade'):
                return GradeSerializer(obj.grade).data.get('graded_by')
            return None
        except Exception:
            return None
