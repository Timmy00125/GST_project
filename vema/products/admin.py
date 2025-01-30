from django.contrib import admin
from .models import Product, Category, ProductImage  # Import Category model

# Register your models here.
# backend/products/admin.py


# Register your models here.
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["title", "price", "category", "stock", "created_at", "created_by"]
    list_filter = ["category", "created_at"]
    search_fields = ["title", "description"]
    # ... (rest of your ProductAdmin configuration if any)


@admin.register(Category)  # **Register Category model with admin**
class CategoryAdmin(
    admin.ModelAdmin
):  # Create a CategoryAdmin class (optional, but good practice)
    list_display = ["name"]  # Customize display in admin list view if needed
    search_fields = ["name"]  # Add search if needed


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    pass  # Or customize ProductImageAdmin if needed
