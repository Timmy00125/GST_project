from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    OrderSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserProfileEditSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileDetailSerializer,
    UserProfileUpdateSerializer,
)
from .permissions import IsAdminUserOrReadOnly  # Example custom permission
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import password_validation
from .permissions import (
    IsAdminUserOrReadOnly,
)  # Example custom permission (reuse or adjust)
from orders.models import Order  # Import Order model (defined below)

# Create your views here.

User = get_user_model()

# backend/accounts/views.py


# backend/accounts/views.py
# from rest_framework import generics, permissions, status
# from rest_framework.response import Response
# from rest_framework_simplejwt.views import TokenObtainPairView
# from django.contrib.auth import get_user_model
# from .serializers import (
#     UserRegistrationSerializer,
#     CustomTokenObtainPairSerializer,
#     UserProfileDetailSerializer,
#     UserProfileUpdateSerializer,
# )
# from .permissions import IsAdminUserOrReadOnly  # Example custom permission

# # Removed email utils import:
# # from ..core.utils import send_verification_email

# User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access

    def perform_create(self, serializer):
        serializer.save()  # No email sending now, user is activated directly in serializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Removed VerifyEmailView entirely:
# class VerifyEmailView(generics.GenericAPIView):
#     permission_classes = [permissions.AllowAny]
#
#     def get(self, request, token):
#         # ... (Email verification logic removed) ...


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Invalidate JWT tokens (client-side mostly handles this by deleting tokens)
        # You might add refresh token blacklisting on the backend for extra security in a real-world app.
        return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)


class UserProfileEditView(generics.UpdateAPIView):
    serializer_class = UserProfileEditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.get(email=email)
        send_password_reset_email(self.request, user)  # Implement in utils.py
        return Response(
            {"message": "Password reset email sent."}, status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        serializer = self.serializer_class(
            data=request.data, context={"uidb64": uidb64, "token": token}
        )
        serializer.is_valid(raise_exception=True)
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            new_password = serializer.validated_data["new_password"]
            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "Password reset successful."}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST
            )


class UserOrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by(
            "-order_date"
        )  # Assuming 'user' FK in Order model
