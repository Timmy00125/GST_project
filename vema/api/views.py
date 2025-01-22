from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Product, Category, Tag, Order, OrderItem, Address, Payment, Coupon
from .serializers import (
    ProductSerializer,
    ProductCreateSerializer,
    CategorySerializer,
    TagSerializer,
    OrderSerializer,
    AddressSerializer,
    PaymentSerializer,
    CouponSerializer,
)


class IsSeller(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_seller


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProductCreateSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsSeller()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Product.objects.filter(active=True)
        category = self.request.query_params.get("category", None)
        search = self.request.query_params.get("search", None)

        if category:
            queryset = queryset.filter(category__name=category)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        return queryset

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def list_products(self, request):
        """Custom action to list all products with filtering."""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def activate_product(self, request, pk=None):
        """Activate a product."""
        product = get_object_or_404(Product, pk=pk)
        if request.user != product.seller:
            return Response(
                {"detail": "You do not have permission to activate this product."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product.active = True
        product.save()
        return Response(
            {"detail": "Product activated successfully."}, status=status.HTTP_200_OK
        )

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def deactivate_product(self, request, pk=None):
        """Deactivate a product."""
        product = get_object_or_404(Product, pk=pk)
        if request.user != product.seller:
            return Response(
                {"detail": "You do not have permission to deactivate this product."},
                status=status.HTTP_403_FORBIDDEN,
            )

        product.active = False
        product.save()
        return Response(
            {"detail": "Product deactivated successfully."}, status=status.HTTP_200_OK
        )
