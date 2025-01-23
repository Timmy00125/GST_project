# from django.core.mail import send_mail
# from django.conf import settings
# from django.urls import reverse
# import secrets
# import string


from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
import secrets
import string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator


def send_verification_email(request, user):
    verification_token = secrets.token_urlsafe(50)
    user.verification_token = verification_token
    user.save()

    verification_link = request.build_absolute_uri(
        reverse("verify-email", kwargs={"token": verification_token})
    )
    subject = "Verify your email address"
    message = (
        f"Please click the following link to verify your email: {verification_link}"
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


def generate_otp(length=6):
    alphabet = string.ascii_letters + string.digits
    otp = "".join(secrets.choice(alphabet) for i in range(length))
    return otp.upper()  # Or just digits if you prefer numeric OTPs


def send_otp_email(email, otp):
    subject = "Your OTP for Email Verification"
    message = f"Your OTP is: {otp}. It is valid for 10 minutes."
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])


# core/utils.py


def send_password_reset_email(request, user):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = request.build_absolute_uri(
        reverse("password-reset-confirm", kwargs={"uidb64": uidb64, "token": token})
    )
    subject = "Password Reset Request"
    message = f"Please click the following link to reset your password: {reset_link}"
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
