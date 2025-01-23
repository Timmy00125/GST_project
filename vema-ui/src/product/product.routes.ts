import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';

export const productRoutes: Routes = [
  { path: '', component: ProductListComponent, title: 'Products' },
  { path: ':id', component: ProductDetailsComponent, title: 'Product Details' },
];
