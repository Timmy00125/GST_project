# backend/products/serializers.py
from rest_framework import serializers
from .models import Product, Category, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text"]


class ProductSerializer(serializers.ModelSerializer):  # For listing/details
    category = CategorySerializer()
    images = ProductImageSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )  # Display creator's username

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "description",
            "price",
            "category",
            "stock",
            "images",
            "created_at",
            "created_by_username",
        ]
        read_only_fields = ["id", "created_at", "images", "created_by_username"]


class ProductCreateSerializer(serializers.ModelSerializer):  # For product creation
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    image_files = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "description",
            "price",
            "category",
            "stock",
            "image_files",
        ]  # Exclude created_by - auto-set in view

    def validate_price(self, value):  # Example validation - price not negative
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def create(self, validated_data):
        image_files = validated_data.pop("image_files", [])
        product = Product.objects.create(**validated_data)
        for image_file in image_files:
            ProductImage.objects.create(product=product, image=image_file)
        return product


class ProductUpdateSerializer(serializers.ModelSerializer):  # For product updates
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False
    )
    image_files = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    remove_image_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "description",
            "price",
            "category",
            "stock",
            "image_files",
            "remove_image_ids",
        ]
        read_only_fields = ["id", "created_at"]

    def update(self, instance, validated_data):
        image_files = validated_data.pop("image_files", [])
        remove_image_ids = validated_data.pop("remove_image_ids", [])

        instance = super().update(instance, validated_data)

        for image_file in image_files:
            ProductImage.objects.create(product=instance, image=image_file)

        for image_id in remove_image_ids:
            try:
                image_to_remove = ProductImage.objects.get(
                    id=image_id, products=instance
                )
                image_to_remove.delete()
            except ProductImage.DoesNotExist:
                pass

        return instance
