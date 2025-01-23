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


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()  # Nested serializer for category
    images = ProductImageSerializer(many=True, read_only=True)  # Read-only for listing

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
        ]
        read_only_fields = [
            "id",
            "created_at",
            "images",
        ]  # Images handled separately for CRUD


class ProductCreateSerializer(serializers.ModelSerializer):  # For product creation
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all()
    )  # Allow category selection by ID
    image_files = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )  # For image uploads

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
        ]

    def create(self, validated_data):
        image_files = validated_data.pop("image_files", [])  # Extract image files
        product = Product.objects.create(**validated_data)
        for image_file in image_files:
            ProductImage.objects.create(
                product=product, image=image_file
            )  # Associate images
        return product


class ProductUpdateSerializer(serializers.ModelSerializer):  # For product updates
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False
    )  # Optional category update
    image_files = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )  # For new image uploads
    remove_image_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )  # For removing existing images

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

        instance = super().update(instance, validated_data)  # Update other fields

        # Add new images
        for image_file in image_files:
            ProductImage.objects.create(product=instance, image=image_file)

        # Remove images by ID
        for image_id in remove_image_ids:
            try:
                image_to_remove = ProductImage.objects.get(
                    id=image_id, products=instance
                )
                image_to_remove.delete()
            except ProductImage.DoesNotExist:
                pass  # Handle case where image doesn't exist or not associated

        return instance
