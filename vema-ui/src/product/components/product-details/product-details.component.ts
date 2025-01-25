import {
  Component,
  OnInit,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartSignals, CartItem } from '../../../cart/cart.signal';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { Product, Category, ProductImage } from '../../models/product.models';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  productService = inject(ProductService);
  cartSignals = inject(CartSignals);
  notificationService = inject(NotificationService);

  productId: number = 0;
  product: WritableSignal<Product | null> = signal(null);
  loading = signal(false);
  quantity: number = 1;

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.loadProductDetails();
    }
  }

  loadProductDetails(): void {
    this.loading.set(true);
    this.productService.getProductDetails(this.productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
        this.loading.set(false);
        // Handle error (e.g., redirect to product list, show notification)
      },
    });
  }

  addToCart(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      const cartItem: CartItem = {
        productId: currentProduct.id,
        quantity: this.quantity,
        price: currentProduct.price,
        productName: currentProduct.title,
        productImage: currentProduct.images[0]?.image, // Use first image as thumbnail
      };
      this.cartSignals.addToCart(cartItem);
      this.notificationService.success(
        `${currentProduct.title} added to cart!`
      );
    }
  }

  updateQuantity(change: number): void {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1) {
      this.quantity = newQuantity;
    }
  }
}
