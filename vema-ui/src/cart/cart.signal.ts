import { effect, Injectable, signal } from '@angular/core';

export interface CartItem {
  productId: number;
  quantity: number;
  price: number; // Price at time of adding to cart
  productName: string; // Product name for display
  productImage?: string; // Product image URL
}
@Injectable({ providedIn: 'root' })
export class CartSignals {
  cartItems = signal<CartItem[]>(this.loadCartItems()); // Initialize from localStorage or cookies

  constructor() {
    // this.cartItems.subscribe((items) => {
    //   this.saveCartItems(items); // Save to localStorage or cookies on changes
    // });
    effect(() => {
      this.saveCartItems(this.cartItems()); // using effect instead of subscribe
    });
  }

  addToCart(item: CartItem): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      (i) => i.productId === item.productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      const updatedItems = currentItems.map((currentItem, index) =>
        index === existingItemIndex
          ? { ...currentItem, quantity: currentItem.quantity + item.quantity }
          : currentItem
      );
      this.cartItems.set(updatedItems);
    } else {
      // Add new item
      this.cartItems.update((items) => [...items, item]);
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const updatedItems = this.cartItems().map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    this.cartItems.set(updatedItems);
  }

  removeItem(productId: number): void {
    const filteredItems = this.cartItems().filter(
      (item) => item.productId !== productId
    );
    this.cartItems.set(filteredItems);
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  getCartTotal(): number {
    return this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  getCartItemCount(): number {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  private saveCartItems(items: CartItem[]): void {
    localStorage.setItem('cartItems', JSON.stringify(items)); // Or use cookies
  }

  private loadCartItems(): CartItem[] {
    const storedCart = localStorage.getItem('cartItems'); // Or load from cookies
    return storedCart ? JSON.parse(storedCart) : [];
  }
}
