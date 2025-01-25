import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // **Import HttpHeaders**
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from '../../auth/services/auth.service'; // **Import AuthService**

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = environment.apiBaseUrl + '/accounts';
  http = inject(HttpClient);
  authService = inject(AuthService); // **Inject AuthService**

  getUserProfile(): Observable<any> {
    const accessToken = this.authService.getAccessToken(); // **Get access token**
    if (!accessToken) {
      console.warn('No access token available. User might not be logged in.');
      return new Observable<any>(); // Or handle no token case appropriately
    }

    const headers = new HttpHeaders({
      // **Create HttpHeaders**
      Authorization: `Bearer ${accessToken}`, // **Set Authorization header**
    });

    return this.http.get<any>(`${this.apiUrl}/profile/`, { headers }); // **Pass headers in request**
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profile/update/`, profileData);
  }

  getOrderHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/orders/orders/`); // Adjust endpoint if needed
  }
}
