import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home/home.component';
import { authRoutes } from '../auth/auth.routes';
import { productRoutes } from '../product/product.routes';
import { checkoutRoutes } from '../checkout/checkout.routes';
import { profileRoutes } from '../profile/profile.routes';
import { CartPageComponent } from '../cart/components/cart-page/cart-page.component';
// import { CreateProductComponent } from '../product/components/create-product/create-product.component';
// import { AuthGuard } from '../auth/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, title: 'Home' },
  { path: 'products', children: productRoutes },
  { path: 'cart', component: CartPageComponent, title: 'Shopping Cart' },
  { path: 'checkout', children: checkoutRoutes },
  { path: 'auth', children: authRoutes },
  { path: 'profile', children: profileRoutes },
  { path: '**', redirectTo: '', pathMatch: 'full' },
  // { path: '**', redirectTo: '' },
];
