import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  template: ` <p>Logging out...</p> `,
})
export class LogoutComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.authService.logout();
    this.notificationService.success('Logged out successfully.');
    this.router.navigate(['/auth/login']); // Redirect to login page after logout
  }
}
