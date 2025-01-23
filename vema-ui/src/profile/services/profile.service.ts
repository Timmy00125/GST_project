// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProfileService {

//   constructor() { }
// }

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = environment.apiBaseUrl + '/accounts';
  http = inject(HttpClient);

  getUserProfile(): Observable<any> {
    // Replace 'any' with your UserProfile interface
    return this.http.get<any>(`${this.apiUrl}/profile/`);
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profile/update/`, profileData);
  }

  getOrderHistory(): Observable<any[]> {
    // Replace 'any[]' with your Order interface array
    return this.http.get<any[]>(`${environment.apiBaseUrl}/orders/orders/`); // Adjust endpoint if needed
  }
}
