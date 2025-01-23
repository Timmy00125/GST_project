import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments.developments';

interface ProductPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[]; // Replace 'any' with your Product interface
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiBaseUrl + '/products';
  http = inject(HttpClient);

  getProducts(
    page: number = 1,
    pageSize: number = 12,
    search?: string,
    category?: number | null,
    minPrice?: number | null,
    maxPrice?: number | null,
    sortBy?: string
  ): Observable<ProductPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (category !== null && category !== undefined) {
      params = params.set('category', category.toString());
    }
    if (minPrice !== null && minPrice !== undefined) {
      params = params.set('min_price', minPrice.toString());
    }
    if (maxPrice !== null && maxPrice !== undefined) {
      params = params.set('max_price', maxPrice.toString());
    }
    if (sortBy) {
      params = params.set('ordering', sortBy);
    }

    return this.http.get<ProductPage>(`${this.apiUrl}/products/`, { params });
  }

  getProductDetails(productId: number): Observable<any> {
    // Replace 'any' with your Product interface
    return this.http.get<any>(`${this.apiUrl}/products/${productId}/`);
  }

  getCategories(): Observable<any[]> {
    // Replace 'any[]' with your Category interface array
    return this.http.get<any[]>(`${environment.apiBaseUrl}/categories/`); // Adjust URL if needed
  }
}
