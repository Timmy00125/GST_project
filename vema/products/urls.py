# backend/products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    CategoryViewSet,
    ProductCreateAPIView,
)  # Import ProductCreateAPIView

router = DefaultRouter()
router.register(
    r"products", ProductViewSet, basename="product"
)  # Existing ProductViewSet
router.register(r"categories", CategoryViewSet, basename="category")

urlpatterns = [
    path("", include(router.urls)),
    # **New Product Creation URL:**
    path(
        "products/create/", ProductCreateAPIView.as_view(), name="product-create-api"
    ),  # POST /api/products/create/
]
