import { Component, OnInit } from '@angular/core';
import { EcommerceService } from '../../services/ecommerce.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];

  constructor(private ecommerceService: EcommerceService) {}

  ngOnInit(): void {
    this.fetchCart();
  }

  fetchCart(): void {
    this.ecommerceService.getCart().subscribe((data) => {
      this.cartItems = data.items;
    });
  }

  checkout(): void {
    this.ecommerceService.checkout(this.cartItems).subscribe(() => {
      alert('Checkout successful');
    });
  }
}
