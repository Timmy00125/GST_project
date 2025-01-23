import { Component, inject, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartSignals, CartItem } from '../../cart.signal';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss',
})
export class CartPageComponent {
  cartSignals = inject(CartSignals);
  notificationService = inject(NotificationService);

  cartItems: Signal<CartItem[]> = this.cartSignals.cartItems;
  cartTotal: Signal<number> = computed(() => this.cartSignals.getCartTotal());

  updateQuantity(productId: number, quantityStr: string): void {
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity < 1) {
      this.notificationService.warning('Please enter a valid quantity.');
      return;
    }
    this.cartSignals.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.cartSignals.removeItem(productId);
    this.notificationService.info('Item removed from cart.');
  }

  clearCart(): void {
    this.cartSignals.clearCart();
    this.notificationService.info('Cart cleared.');
  }
}
