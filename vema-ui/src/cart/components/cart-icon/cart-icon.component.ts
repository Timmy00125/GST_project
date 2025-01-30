import { Component, Signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartSignals } from '../../cart.signal';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-icon.component.html',
})
export class CartIconComponent {
  cartSignals = inject(CartSignals);
  cartItemCount: Signal<number> = computed(() =>
    this.cartSignals.getCartItemCount()
  );
}
