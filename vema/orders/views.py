from django.shortcuts import render

from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderStatusUpdateSerializer
from ..accounts.permissions import (
    IsAdminUserOrReadOnly,
)  # Reuse or create new permissions

# Create your views here.
# orders/views.py


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related(
        "items__product", "user"
    )  # Optimize queries
    serializer_class = OrderSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]  # Customers can view/create, Admin can CRUD

    def get_queryset(self):
        if self.request.user.is_staff:  # Admin sees all orders
            return Order.objects.all().prefetch_related("items__product", "user")
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "items__product"
        )  # Customer sees own orders

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # Set user automatically

    def perform_update(
        self, serializer
    ):  # Admin can update order details, maybe limit fields
        if self.request.user.is_staff:
            serializer.save()

    def perform_destroy(self, instance):  # Admin can delete orders
        if self.request.user.is_staff:
            instance.delete()

    def get_permissions(self):
        if self.action in [
            "list",
            "retrieve",
            "create",
        ]:  # Customer and admin can list, retrieve, create
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in [
            "update",
            "partial_update",
            "destroy",
        ]:  # Admin only for update/delete
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [
                permissions.IsAuthenticated
            ]  # Default for other actions (if any)
        return [permission() for permission in permission_classes]


class OrderStatusUpdateView(generics.UpdateAPIView):  # Admin updates order status
    queryset = Order.objects.all()
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
