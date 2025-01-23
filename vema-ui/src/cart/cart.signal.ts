import { effect, Injectable, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
}

@Injectable({ providedIn: 'root' })
export class CartSignals {
  private platformId = inject(PLATFORM_ID);
  cartItems = signal<CartItem[]>(this.loadCartItems());

  constructor() {
    effect(() => {
      this.saveCartItems(this.cartItems());
    });
  }

  addToCart(item: CartItem): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(
      (i) => i.productId === item.productId
    );

    if (existingItemIndex > -1) {
      const updatedItems = currentItems.map((currentItem, index) =>
        index === existingItemIndex
          ? { ...currentItem, quantity: currentItem.quantity + item.quantity }
          : currentItem
      );
      this.cartItems.set(updatedItems);
    } else {
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cartItems', JSON.stringify(items));
    }
  }

  private loadCartItems(): CartItem[] {
    if (isPlatformBrowser(this.platformId)) {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  }
}
