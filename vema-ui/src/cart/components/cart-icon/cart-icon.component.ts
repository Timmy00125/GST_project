import { Component, Signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartSignals } from '../../cart.signal';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-icon.component.html',
  styleUrl: './cart-icon.component.scss',
})
export class CartIconComponent {
  cartSignals = inject(CartSignals);
  cartItemCount: Signal<number> = computed(() =>
    this.cartSignals.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );
}
