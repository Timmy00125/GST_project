import { Component, Signal, computed, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CartSignals } from '../../../cart/cart.signal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  cartSignals = inject(CartSignals);

  cartItemCount: Signal<number> = computed(() =>
    this.cartSignals.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
