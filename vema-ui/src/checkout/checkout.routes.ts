import { Routes } from '@angular/router';
import { CheckoutPageComponent } from './components/checkout-page/checkout-page.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ConfirmationPageComponent } from './components/confirmation-page/confirmation-page.component';

export const checkoutRoutes: Routes = [
  {
    path: '',
    component: CheckoutPageComponent,
    title: 'Checkout',
    canActivate: [AuthGuard],
  },
  {
    path: 'confirmation',
    component: ConfirmationPageComponent,
    title: 'Order Confirmation',
    canActivate: [AuthGuard],
  },
];
