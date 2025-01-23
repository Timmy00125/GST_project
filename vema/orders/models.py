from django.db import models
from django.conf import settings
from products.models import Product
from django.utils import timezone

# Create your models here.

# orders/models.py


class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    PROCESSING = "PROCESSING", "Processing"
    SHIPPED = "SHIPPED", "Shipped"
    DELIVERED = "DELIVERED", "Delivered"
    CANCELLED = "CANCELLED", "Cancelled"


class Order(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders"
    )
    order_date = models.DateTimeField(default=timezone.now)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING
    )
    shipping_address = models.TextField()  # Expand as needed (name, street, city, etc.)
    payment_method = models.CharField(max_length=100)  # e.g., 'Stripe', 'PayPal'
    transaction_id = models.CharField(
        max_length=255, blank=True, null=True
    )  # Stripe/PayPal transaction ID

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # Price at time of order

    def __str__(self):
        return f"{self.quantity} x {self.product.title} in Order #{self.order.id}"
