import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments.developments';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private apiUrl = environment.apiBaseUrl + '/orders'; // Adjust endpoint

  http = inject(HttpClient);

  placeOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/`, orderData); // Adjust endpoint if needed
  }
}
