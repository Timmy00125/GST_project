# Generated by Django 5.0.1 on 2025-01-30 15:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_product_created_by"),
    ]

    operations = [
        migrations.AlterField(
            model_name="productimage",
            name="image",
            field=models.URLField(max_length=500),
        ),
    ]
