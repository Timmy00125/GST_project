import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CreateProductComponent } from './components/create-product/create-product.component';
import { AuthGuard } from '../auth/guards/auth.guard';

export const productRoutes: Routes = [
  { path: '', component: ProductListComponent, title: 'Products' },
  {
    path: 'create',
    component: CreateProductComponent,
    title: 'Create Product',
    canActivate: [AuthGuard],
  },
  { path: ':id', component: ProductDetailsComponent, title: 'Product Details' },
];
