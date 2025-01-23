import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/accounts'; // Adjust base API URL

  constructor(private http: HttpClient) {}

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  loginUser(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
        })
      );
  }

  logoutUser(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Optionally call backend logout endpoint if you implement token blacklisting
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token'); // Check if access token exists
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // ... (Methods for token refresh, profile fetching, etc.) ...
}
