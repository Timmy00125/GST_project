from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    # Add slug for better URLs if needed
    def __str__(self):
        return self.name


class Product(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="products"
    )
    stock = models.IntegerField(default=0)
    images = models.ManyToManyField(
        "ProductImage", related_name="products", blank=True
    )  # Multiple images
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    image = models.ImageField(
        upload_to="products/"
    )  # Configure MEDIA_ROOT and MEDIA_URL in settings
    alt_text = models.CharField(
        max_length=255, blank=True
    )  # Alt text for accessibility

    def __str__(self):
        return f"Image for Product ID: {self.id}"
