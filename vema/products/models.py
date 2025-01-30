# backend/products/models.py
from django.db import models
from django.utils import timezone
from django.conf import settings  # Import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

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
    # **Add created_by field (ForeignKey to User):**
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_products",
    )

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    # Change from ImageField to URLField
    image = models.URLField(max_length=500)  # increased max_length for long URLs
    alt_text = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Image for Product ID: {self.id}"
