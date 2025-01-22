import { Component, OnInit } from '@angular/core';
import { EcommerceService } from '../../services/ecommerce.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  products: any[] = [];

  constructor(private ecommerceService: EcommerceService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.ecommerceService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }

  addToCart(productId: number, quantity: number): void {
    this.ecommerceService.addToCart(productId, quantity).subscribe(() => {
      alert('Product added to cart');
    });
  }
}
