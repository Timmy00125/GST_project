# orders/serializers.py
from rest_framework import serializers

from vema.products.models import Product
from .models import Order, OrderItem, OrderStatus
from ..products.serializers import ProductSerializer  # Reuse ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Display product details
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True
    )  # For creating order items by ID

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_id", "quantity", "price"]

    def validate_product_id(self, value):  # Check stock before ordering
        if value.stock < self.initial_data.get(
            "quantity", 1
        ):  # initial_data for create
            raise serializers.ValidationError("Not enough stock for this product.")
        return value


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True, write_only=True
    )  # For creating order with items
    order_items = OrderItemSerializer(
        many=True, read_only=True, source="items"
    )  # To retrieve ordered items
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )  # For display friendly status

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "order_date",
            "total_amount",
            "status",
            "status_display",
            "shipping_address",
            "payment_method",
            "transaction_id",
            "items",
            "order_items",
        ]
        read_only_fields = [
            "id",
            "order_date",
            "total_amount",
            "status",
            "transaction_id",
            "user",
            "order_items",
            "status_display",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user  # Get user from request context
        order = Order.objects.create(user=user, **validated_data)
        total_amount = 0
        order_items_list = []
        for item_data in items_data:
            product = item_data["product_id"]
            quantity = item_data["quantity"]
            if product.stock < quantity:  # Double check stock
                raise serializers.ValidationError(
                    f"Not enough stock for product '{product.title}'."
                )
            item_price = product.price  # Price at order time
            order_item = OrderItem.objects.create(
                order=order, product=product, quantity=quantity, price=item_price
            )
            order_items_list.append(order_item)
            total_amount += item_price * quantity
            product.stock -= quantity  # Decrease product stock
            product.save()

        order.total_amount = total_amount
        order.save()
        return order


class OrderStatusUpdateSerializer(
    serializers.ModelSerializer
):  # Admin update order status
    class Meta:
        model = Order
        fields = ["status"]
