from django.urls import path
from .views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    UserProfileView,
    UserProfileUpdateView,
    VerifyEmailView,
    RequestOTPView,
    VerifyOTPView,
    LogoutView,
    UserProfileEditView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserOrderHistoryView,
)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "token/refresh/", TokenObtainPairView.as_view(), name="token_refresh"
    ),  # Default JWT refresh path
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path(
        "profile/update/", UserProfileUpdateView.as_view(), name="user-profile-update"
    ),
    path(
        "verify-email/<str:token>/", VerifyEmailView.as_view(), name="verify-email"
    ),  # Email verification link
    path("request-otp/", RequestOTPView.as_view(), name="request-otp"),  # Request OTP
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),  # Verify OTP
    path("profile/edit/", UserProfileEditView.as_view(), name="user-profile-edit"),
    path(
        "password/reset/request/",
        PasswordResetRequestView.as_view(),
        name="password-reset-request",
    ),
    path(
        "password/reset/confirm/<str:uidb64>/<str:token>/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path("orders/", UserOrderHistoryView.as_view(), name="user-order-history"),
]
