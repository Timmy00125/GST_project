# reviews/serializers.py
from rest_framework import serializers

from vema.orders.models import Order
from .models import Review
from ..accounts.serializers import UserProfileSerializer  # To show reviewer details
from ..products.serializers import ProductSerializer  # To show product details


class ReviewSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(
        source="user.profile", read_only=True
    )  # Show reviewer's profile

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "user_profile",
            "product",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "product",
            "created_at",
            "user_profile",
        ]  # user and product set in view

    def validate(
        self, data
    ):  # Check if user has purchased the product before reviewing
        user = self.context["request"].user
        product = data.get("product")
        if product and user.is_authenticated:
            # Check if user has an order containing this product
            has_purchased = Order.objects.filter(
                user=user, items__product=product
            ).exists()  # Assuming Order model exists
            if not has_purchased:
                raise serializers.ValidationError(
                    "You must purchase this product before you can review it."
                )
        return data
