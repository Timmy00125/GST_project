# ecommerce_api/views.py (or admin_dashboard/views.py)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from ..orders.models import Order
from ..accounts.models import User
from ..products.models import Product
from django.db.models import Count, Sum
from django.utils import timezone


class AdminDashboardDataView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        monthly_sales_data = Order.objects.filter(
            order_date__year=today.year, order_date__month=today.month
        ).aggregate(total_revenue=Sum("total_amount"), order_count=Count("id"))
        total_users = User.objects.count()
        total_products = Product.objects.count()
        pending_orders = Order.objects.filter(status="PENDING").count()
        processing_orders = Order.objects.filter(status="PROCESSING").count()

        dashboard_data = {
            "monthly_revenue": monthly_sales_data.get("total_revenue") or 0,
            "monthly_order_count": monthly_sales_data.get("order_count") or 0,
            "total_users": total_users,
            "total_products": total_products,
            "pending_orders": pending_orders,
            "processing_orders": processing_orders,
        }
        return Response(dashboard_data)
