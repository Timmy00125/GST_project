# ecommerce_api/urls.py
from django.urls import path
from .views import AdminDashboardDataView

urlpatterns = [
    # ... (Existing URLs) ...
    path(
        "admin/dashboard-data/",
        AdminDashboardDataView.as_view(),
        name="admin-dashboard-data",
    ),
]
