import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartSignals, CartItem } from '../../../cart/cart.signal';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../models/product.models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() product!: Product;
  cartSignals = inject(CartSignals);
  notificationService = inject(NotificationService);

  addToCart(product: Product): void {
    const cartItem: CartItem = {
      productId: product.id,
      quantity: 1,
      price: product.price,
      productName: product.title,
      productImage: product.images[0]?.image,
    };
    this.cartSignals.addToCart(cartItem);
    this.notificationService.success(`${product.title} added to cart!`);
  }
}
