// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-payment-form',
//   imports: [],
//   templateUrl: './payment-form.component.html',
//   styleUrl: './payment-form.component.css'
// })
// export class PaymentFormComponent {

// }

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environments.developments';
import { loadStripe } from '@stripe/stripe-js';
import { afterNextRender } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements AfterViewInit {
  @Output() paymentToken = new EventEmitter<string>();
  @ViewChild('cardElement') cardElement!: ElementRef;
  notificationService = inject(NotificationService);

  private stripe: any;
  private card: any;
  stripeLoading = true;

  constructor() {
    afterNextRender(async () => {
      try {
        this.stripe = await loadStripe(environment.stripePublicKey);
        if (this.stripe) {
          this.stripeLoading = false;
          this.setupStripeElements();
        } else {
          this.notificationService.error('Failed to load Stripe.');
          this.stripeLoading = false;
        }
      } catch (error) {
        console.error('Error loading Stripe:', error);
        this.notificationService.error('Error initializing payment gateway.');
        this.stripeLoading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Stripe initialization is handled in constructor using afterNextRender
    // to ensure component is fully rendered before Stripe tries to attach elements.
  }

  private setupStripeElements(): void {
    if (!this.stripe) return;

    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount(this.cardElement.nativeElement);

    this.card.on('change', (event: any) => {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      }
    });
  }

  async processPayment(): Promise<void> {
    if (!this.stripe || !this.card) return;

    try {
      const result = await this.stripe.createToken(this.card);

      if (result.error) {
        // Inform the user if there was an error.
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
          errorElement.textContent = result.error.message;
        }
      } else {
        // Send the token to your server.
        this.paymentToken.emit(result.token.id);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      this.notificationService.error('Payment processing error.');
    }
  }

  onPaymentSubmit(): void {
    this.processPayment();
  }
}
