# backend/accounts/models.py
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.db import models
from django.utils import timezone


class User(AbstractUser, PermissionsMixin):
    # Removed email verification related fields:
    # email_verified = models.BooleanField(default=False)
    # verification_token = models.CharField(max_length=255, blank=True, null=True)
    otp = models.CharField(
        max_length=6, blank=True, null=True
    )  # For OTP verification - Keeping for now, remove if OTP also not needed
    otp_expiry = models.DateTimeField(
        blank=True, null=True
    )  # Keeping for now, remove if OTP also not needed
    profile = models.OneToOneField(
        "UserProfile",
        on_delete=models.CASCADE,
        related_name="user_profile",
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile_detail", null=True
    )
    name = models.CharField(max_length=100)
    address = models.TextField()
    # Add more profile fields as needed

    def __str__(self):
        return self.name
