from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save)
def create_admin_user(sender, instance, created, **kwargs):
    if created and instance.role == 'ADMIN':
        # Perform actions needed when an admin user is created
        print(f"Admin user created: {instance.username}")