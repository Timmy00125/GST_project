from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser, Group, PermissionsMixin
from django.db import models
from django.utils import timezone


class User(AbstractUser, PermissionsMixin):
    email_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=255, blank=True, null=True)
    otp = models.CharField(max_length=6, blank=True, null=True)  # For OTP verification
    otp_expiry = models.DateTimeField(blank=True, null=True)
    profile = models.OneToOneField(
        "UserProfile",
        on_delete=models.CASCADE,
        related_name="user",
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()

    # Add more profile fields as needed
    def __str__(self):
        return self.name


# Define groups for roles (Admin, Customer) in Django Admin interface.
# You can create 'admin' and 'customer' groups.
