from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Product,
    ProductImage,
    Category,
    Tag,
    Order,
    OrderItem,
    Address,
    Payment,
    Coupon,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "is_seller", "phone")
        read_only_fields = ("id",)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "is_primary")


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    seller = UserSerializer(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "seller",
            "title",
            "description",
            "price",
            "discount_price",
            "category",
            "tags",
            "inventory",
            "images",
            "created_at",
            "updated_at",
            "active",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ProductCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    category_id = serializers.IntegerField(write_only=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = (
            "title",
            "description",
            "price",
            "discount_price",
            "category_id",
            "tag_ids",
            "inventory",
            "images",
        )

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        tag_ids = validated_data.pop("tag_ids", [])
        category_id = validated_data.pop("category_id")

        validated_data["category_id"] = category_id
        validated_data["seller"] = self.context["request"].user

        product = Product.objects.create(**validated_data)

        # Add tags
        product.tags.set(tag_ids)

        # Create product images
        for i, image in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image=image,
                is_primary=(i == 0),  # First image is primary
            )

        return product


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id",
            "user",
            "address_type",
            "street_address",
            "apartment",
            "city",
            "country",
            "postal_code",
            "default",
        )
        read_only_fields = ("id", "user")


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "quantity", "price")
        read_only_fields = ("id",)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    billing_address = AddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "items",
            "status",
            "shipping_address",
            "billing_address",
            "payment",
            "coupon",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "id",
            "user",
            "payment_method",
            "amount",
            "transaction_id",
            "status",
            "created_at",
        )
        read_only_fields = ("id", "user", "created_at")


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ("id", "code", "amount", "valid_from", "valid_to", "active")
        read_only_fields = ("id",)
