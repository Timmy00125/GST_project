from django.shortcuts import render

# Create your views here.
# reviews/views.py
from rest_framework import viewsets, permissions, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import ReviewSerializer
from ..accounts.permissions import (
    IsAdminUserOrReadOnly,
)  # Reuse or create new permissions
from ..products.models import Product  # Import Product model
from .filters import ReviewFilter  # Create filters.py (see below)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related(
        "user__profile", "product"
    )  # Optimize queries
    serializer_class = ReviewSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly
    ]  # Allow read for all, create/update/delete for authenticated

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ReviewFilter  # Custom filters
    ordering_fields = ["created_at", "rating"]  # Ordering fields

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user, product_id=self.request.data.get("product_id")
        )  # Get product_id from request

    def perform_update(self, serializer):  # Allow users to update their own reviews
        if serializer.instance.user == self.request.user or self.request.user.is_staff:
            serializer.save()

    def perform_destroy(
        self, instance
    ):  # Allow users to delete their own reviews or admin delete
        if instance.user == self.request.user or self.request.user.is_staff:
            instance.delete()

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]:  # Auth required for create/update/delete
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]  # Read for all
        return [permission() for permission in permission_classes]

    @action(
        detail=False, methods=["GET"], url_path="product/(?P<product_id>\d+)"
    )  # /api/reviews/product/{product_id}/
    def product_reviews(self, request, product_id=None):
        queryset = self.filter_queryset(
            self.get_queryset().filter(product_id=product_id)
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=["GET"], url_path="average-rating/(?P<product_id>\d+)"
    )  # /api/reviews/average-rating/{product_id}/
    def average_rating(self, request, product_id=None):
        reviews = Review.objects.filter(product_id=product_id)
        if reviews.exists():
            average_rating = reviews.aggregate(avg_rating=models.Avg("rating"))[
                "avg_rating"
            ]
            return Response({"average_rating": average_rating})
        else:
            return Response({"average_rating": None})
