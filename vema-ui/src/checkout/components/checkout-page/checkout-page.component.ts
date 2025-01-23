import { Component, inject, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CartSignals } from '../../../cart/cart.signal';
import { Router, RouterModule } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AddressFormComponent } from '../address-form/address-form.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AddressFormComponent,
    PaymentFormComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss',
})
export class CheckoutPageComponent {
  fb = inject(FormBuilder);
  cartSignals = inject(CartSignals);
  router = inject(Router);
  checkoutService = inject(CheckoutService);
  notificationService = inject(NotificationService);

  cartTotal: Signal<number> = computed(() => this.cartSignals.getCartTotal());
  loading = false;
  checkoutStage: 'address' | 'payment' | 'confirmation' = 'address';
  shippingAddressForm!: FormGroup;
  paymentForm!: FormGroup;
  orderConfirmation: any; // Store order confirmation details

  ngOnInit(): void {
    if (this.cartSignals.getCartItemCount() === 0) {
      this.router.navigate(['/cart']); // Redirect to cart if empty
      return;
    }
    this.shippingAddressForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['stripe', Validators.required], // Default to Stripe
      stripeToken: ['', Validators.required], // Will be populated by Stripe component
    });
  }

  nextStage(): void {
    if (this.checkoutStage === 'address' && this.shippingAddressForm.valid) {
      this.checkoutStage = 'payment';
    } else if (this.checkoutStage === 'payment' && this.paymentForm.valid) {
      this.checkoutStage = 'confirmation';
      this.placeOrder();
    }
  }

  previousStage(): void {
    if (this.checkoutStage === 'payment') {
      this.checkoutStage = 'address';
    } else if (this.checkoutStage === 'confirmation') {
      this.checkoutStage = 'payment';
    }
  }

  onPaymentTokenReceived(token: string): void {
    this.paymentForm.patchValue({ stripeToken: token });
  }

  placeOrder(): void {
    if (this.shippingAddressForm.valid && this.paymentForm.valid) {
      this.loading = true;
      const orderData = {
        shippingAddress: this.shippingAddressForm.value,
        paymentMethod: this.paymentForm.get('paymentMethod')?.value,
        stripeToken: this.paymentForm.get('stripeToken')?.value,
        items: this.cartSignals.cartItems().map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      };

      this.checkoutService.placeOrder(orderData).subscribe({
        next: (response) => {
          this.loading = false;
          this.orderConfirmation = response;
          this.cartSignals.clearCart(); // Clear cart on successful order
          this.router.navigate(['/checkout/confirmation'], {
            state: { order: this.orderConfirmation },
          });
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error(
            error.error.message || 'Order placement failed.',
            'Checkout Error'
          );
        },
      });
    } else {
      this.notificationService.warning(
        'Please complete all steps in the checkout process.',
        'Incomplete Checkout'
      );
    }
  }
}
