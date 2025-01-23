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
from ..core.utils import send_verification_email, generate_otp, send_otp_email
from django.utils import timezone
from datetime import timedelta
from ..core.utils import send_password_reset_email  # Implement in utils.py
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import password_validation
from .permissions import (
    IsAdminUserOrReadOnly,
)  # Example custom permission (reuse or adjust)
from ..orders.models import Order  # Import Order model (defined below)

# Create your views here.

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access

    def perform_create(self, serializer):
        user = serializer.save()
        # Generate verification token and send email
        send_verification_email(self.request, user)  # Implement in utils.py


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


class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            user = User.objects.get(verification_token=token)
            if not user.email_verified:
                user.email_verified = True
                user.verification_token = None
                user.is_active = True  # Activate user
                user.save()
                return Response(
                    {"message": "Email verified successfully!"},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"message": "Email already verified."}, status=status.HTTP_200_OK
                )
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid verification token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class RequestOTPView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(email=email)
            otp = generate_otp()  # Implement in utils.py
            user.otp = otp
            user.otp_expiry = timezone.now() + timedelta(
                minutes=10
            )  # OTP valid for 10 mins
            user.save()
            send_otp_email(email, otp)  # Implement in utils.py
            return Response(
                {"message": "OTP sent to email."}, status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class VerifyOTPView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        if not email or not otp:
            return Response(
                {"error": "Email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email=email)
            if user.otp == otp and user.otp_expiry > timezone.now():
                user.email_verified = True
                user.otp = None
                user.otp_expiry = None
                user.is_active = True  # Activate user
                user.save()
                return Response(
                    {"message": "Email verified successfully!"},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Invalid OTP or OTP expired."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


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
