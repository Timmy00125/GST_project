import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environments';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NOT_RETRY_AUTH_REQUEST } from '../auth.interceptor';

interface AuthResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl + '/accounts';
  private cookieService = inject(CookieService);
  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticatedSig = signal<boolean>(this.isAuthenticated());

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  // login(credentials: any): Observable<AuthResponse> {
  //   return this.http
  //     .post<AuthResponse>(`${this.apiUrl}/login/`, credentials, {
  //       observe: 'response',
  //     }) // Observe full response
  //     .pipe(
  //       tap((response) => {
  //         const authTokens = response.body as AuthResponse;
  //         if (authTokens) {
  //           this.setAuthCookies(authTokens);
  //           this.isAuthenticatedSig.set(true);
  //         }
  //       })
  //     );
  // }
  login(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login/`, credentials) // Removed observe: 'response'
      .pipe(
        tap((authTokens) => {
          this.setAuthCookies(authTokens);
          this.isAuthenticatedSig.set(true);
        })
      );
  }

  logout(): void {
    this.clearAuthCookies();
    this.isAuthenticatedSig.set(false);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return this.cookieService.get('access_token') || null;
  }

  getRefreshToken(): string | null {
    return this.cookieService.get('refresh_token') || null;
  }

  refreshAccessToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return new Observable<AuthResponse>(); // Or throw error
    }
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/token/refresh/`,
        { refresh: refreshToken },
        { context: new HttpContext().set(NOT_RETRY_AUTH_REQUEST, true) }
      )
      .pipe(
        tap(
          (tokens) => {
            this.setAuthCookies(tokens);
            this.isAuthenticatedSig.set(true);
          },
          (error) => {
            // Handle refresh token failure (e.g., redirect to login)
            console.error('Token refresh failed:', error);
            this.logout();
            this.router.navigate(['/auth/login']);
          }
        )
      );
  }

  private setAuthCookies(tokens: AuthResponse): void {
    // Set HTTP-only cookies (ensure backend is configured to send Set-Cookie header)
    this.cookieService.set('access_token', tokens.access, {
      path: '/',
      secure: environment.production,
      sameSite: 'Strict',
    });
    this.cookieService.set('refresh_token', tokens.refresh, {
      path: '/',
      secure: environment.production,
      sameSite: 'Strict',
    });
  }

  private clearAuthCookies(): void {
    this.cookieService.delete('access_token', '/');
    this.cookieService.delete('refresh_token', '/');
  }
}
