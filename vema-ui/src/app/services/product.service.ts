import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: { id: number; name: string };
  stock: number;
  images: { id: number; image: string; alt_text: string }[];
  created_at: string;
}

interface ProductPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // constructor() {}

  private apiUrl = '/api/products'; // Adjust base API URL

  constructor(private http: HttpClient) {}

  getProducts({
    page = 1,
    pageSize = 10,
    search,
    category,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder = 'asc',
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Observable<ProductPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (category) {
      params = params.set('category', category.toString());
    }
    if (minPrice !== undefined) {
      params = params.set('min_price', minPrice.toString());
    }
    if (maxPrice !== undefined) {
      params = params.set('max_price', maxPrice.toString());
    }
    if (sortBy) {
      params = params.set(
        'ordering',
        `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
      );
    }

    return this.http.get<ProductPage>(`${this.apiUrl}/`, { params });
  }

  getProductDetails(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}/`);
  }

  getCategories(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`/api/categories/`); // Adjust URL
  }
}
