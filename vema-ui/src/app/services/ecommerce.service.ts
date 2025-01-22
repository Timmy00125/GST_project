import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EcommerceService {
  private apiUrl = 'https://your-ecommerce-backend.com/api'; // Replace with your backend API

  constructor(private http: HttpClient) {}

  // Get list of products
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`);
  }

  // Get product by ID
  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`);
  }

  // Add product to cart
  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart`, { productId, quantity });
  }

  // Get cart details
  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`);
  }

  // Checkout
  checkout(cartData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, cartData);
  }
  // constructor() { }
}
