import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartSignals } from '../../../cart/cart.signal';
import { Product } from '../../models/product.models';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  private Cartsignal = inject(CartSignals);
  private notificationService = inject(NotificationService);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((response) => {
      this.products = response.results;
    });
  }

  addToCart(product: Product): void {
    this.Cartsignal.addToCart({
      productId: product.id,
      quantity: 1,
      price: product.price,
      productName: product.title,
      productImage: product.images[0]?.image,
    });
    this.notificationService.success(`${product.title} added to cart!`);
  }
}
