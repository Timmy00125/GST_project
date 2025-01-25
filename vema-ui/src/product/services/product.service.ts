import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments.developments';
import { Product, Category, ProductPage } from '../models/product.models';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiBaseUrl + '/products';
  private categoriesApiUrl = environment.apiBaseUrl + '/categories';
  http = inject(HttpClient);
  authService = inject(AuthService);

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

  getCategories(): Observable<Category[]> {
    // Replace 'any[]' with your Category interface array
    return this.http.get<Category[]>(`${environment.apiBaseUrl}/`); // Adjust URL if needed
  }

  createProduct(productData: FormData): Observable<Product> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      console.warn('No access token available. User not logged in.');
      return new Observable<Product>();
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.post<Product>(`${this.apiUrl}/create/`, productData, {
      headers,
    });
  }
}
