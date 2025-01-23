from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, filters, pagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category, ProductImage
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
)
from .filters import ProductFilter  # Create filters.py (see below)
from vema.accounts.permissions import (
    IsAdminUserOrReadOnly,
)  # Reuse or create new permissions


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]  # Admin can CRUD, others read-only


class ProductPagination(pagination.PageNumberPagination):
    page_size = 10  # Adjust page size as needed
    page_size_query_param = "page_size"
    max_page_size = 100


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().prefetch_related(
        "images", "category"
    )  # Optimize with prefetch
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUserOrReadOnly]  # Admin can CRUD, others read-only
    pagination_class = ProductPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ProductFilter  # Custom filters
    search_fields = ["title", "description", "category__name"]  # Search fields
    ordering_fields = ["price", "created_at"]  # Ordering fields

    def get_serializer_class(
        self,
    ):  # Different serializers for create/update vs. list/retrieve
        if self.action in ["create", "update"]:
            return (
                ProductCreateSerializer
                if self.action == "create"
                else ProductUpdateSerializer
            )
        return ProductSerializer

    def perform_create(self, serializer):  # Admin only create
        serializer.save()

    def perform_update(self, serializer):  # Admin only update
        serializer.save()

    def perform_destroy(self, instance):  # Admin only delete
        instance.delete()

    def get_permissions(self):  # Apply permissions based on action
        if self.action in ["create", "update", "destroy"]:
            permission_classes = [
                permissions.IsAdminUser
            ]  # Only admin for these actions
        else:
            permission_classes = [permissions.AllowAny]  # Read-only for all
        return [permission() for permission in permission_classes]
