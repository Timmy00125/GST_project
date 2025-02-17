# products/filters.py
import django_filters

# from orders import models

# from vema.accounts import models
from .models import Product, Category
from reviews.models import Review  # Import Review model


class ProductFilter(django_filters.FilterSet):
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all())
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_rating = django_filters.NumberFilter(
        method="filter_by_rating", label="Minimum Rating"
    )  # Custom filter for rating

    def filter_by_rating(self, queryset, name, value):
        if value:
            return queryset.annotate(
                avg_rating=Review.Avg("reviews__rating")
            ).filter(  # changed model here to review
                avg_rating__gte=value
            )
        return queryset

    class Meta:
        model = Product
        fields = ["category", "min_price", "max_price", "min_rating"]
