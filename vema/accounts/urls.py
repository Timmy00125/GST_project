from django.urls import path
from .views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    UserProfileView,
    UserProfileUpdateView,
    LogoutView,
    UserProfileEditView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserOrderHistoryView,
)


# backend/accounts/urls.py
from django.urls import path
from .views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    UserProfileView,
    UserProfileUpdateView,
    LogoutView,
)  # Removed VerifyEmailView

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "token/refresh/", CustomTokenObtainPairView.as_view(), name="token_refresh"
    ),  # Default JWT refresh path
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path(
        "profile/update/", UserProfileUpdateView.as_view(), name="user-profile-update"
    ),
    # Removed email verification URL:
    # path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),  # Email verification link
]
