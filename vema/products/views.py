# backend/products/views.py
from rest_framework import viewsets, permissions, filters, pagination, generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response  # Import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category, ProductImage
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
)
from .filters import ProductFilter
from accounts.permissions import IsAdminUserOrReadOnly  # Reuse existing permissions


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]


class ProductPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProductViewSet(
    viewsets.ModelViewSet
):  # Keep existing ProductViewSet for listing/retrieve/update/delete
    queryset = Product.objects.all().prefetch_related(
        "images", "category", "created_by__profile"
    )  # Prefetch 'created_by'
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUserOrReadOnly]  # Admin CRUD, Read-only for others
    pagination_class = ProductPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ProductFilter
    search_fields = ["title", "description", "category__name"]
    ordering_fields = ["price", "created_at"]

    def get_serializer_class(self):
        if self.action in ["create", "update"]:
            return (
                ProductCreateSerializer
                if self.action == "create"
                else ProductUpdateSerializer
            )
        return ProductSerializer

    def perform_create(self, serializer):
        serializer.save()  # Admin only create

    def perform_update(self, serializer):
        serializer.save()  # Admin only update

    def perform_destroy(self, instance):
        instance.delete()  # Admin only delete

    def get_permissions(self):
        if self.action in ["create", "update", "destroy"]:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]


# **New Product Creation API View (for authenticated users):**
class ProductCreateAPIView(
    generics.CreateAPIView
):  # Use CreateAPIView for POST-only, simpler than APIView
    serializer_class = ProductCreateSerializer
    permission_classes = [permissions.IsAuthenticated]  # **Authenticated users only**
    parser_classes = [MultiPartParser, FormParser]  # To handle file uploads

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )  # **Auto-set created_by to logged-in user**
