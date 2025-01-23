# orders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderStatusUpdateView

router = DefaultRouter()
router.register(
    r"orders", OrderViewSet, basename="order"
)  # /api/orders/ and /api/orders/{id}/

urlpatterns = [
    path("", include(router.urls)),
    path(
        "orders/<int:pk>/status/",
        OrderStatusUpdateView.as_view(),
        name="order-status-update",
    ),  # /api/orders/{id}/status/ (Admin only)
]
