from rest_framework import serializers

# from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

from vema.accounts.models import UserProfile
from vema.orders.models import Order

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["name", "address"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )
    profile = UserProfileSerializer(required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "profile"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        profile_data = validated_data.pop("profile")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = False  # Initially inactive until email verification
        user.save()

        profile = UserProfile.objects.create(
            user=user, **profile_data
        )  # Create profile
        # Send email verification here (using utils.py - see below)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims if needed (e.g., user role)
        # token['role'] = 'customer' # Example: Dynamically determine role
        return token


class UserProfileDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]  # Include profile
        read_only_fields = ["id", "username", "email"]  # Prevent updates to these


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ["profile"]  # Allow updating only profile fields


# ... (UserProfileSerializer, UserRegistrationSerializer, CustomTokenObtainPairSerializer from previous response) ...


class UserProfileEditSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ["profile"]


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user with this email address found.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
        validators=[password_validation.validate_password],
    )
    confirm_new_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )
    uidb64 = serializers.CharField()
    token = serializers.CharField()

    def validate(self, data):
        password = data.get("new_password")
        confirm_password = data.get("confirm_new_password")
        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_new_password": "Passwords must match."}
            )
        return data


class OrderSerializer(serializers.ModelSerializer):  # For order history
    class Meta:
        model = Order  # Define Order model below
        fields = [
            "id",
            "order_date",
            "total_amount",
            "status",
        ]  # Add relevant order fields
