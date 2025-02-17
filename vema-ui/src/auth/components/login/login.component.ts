import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  loading = false;

  loginForm = this.fb.group({
    // **Use "username" instead of "email" in login form:**
    username: ['', Validators.required], // Form control for username
    password: ['', Validators.required],
  });

  login(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      // **Send "username" and "password" directly from loginForm.value:**
      this.authService.login(this.loginForm.value).subscribe({
        // Directly send loginForm.value (now contains username and password)
        next: () => {
          this.loading = false;
          this.notificationService.success('Login successful!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error(
            error.error.detail ||
              'Login failed. Please check your credentials.',
            'Login Error'
          );
          console.error('Login error:', error); // Log error for debugging
        },
      });
    } else {
      this.notificationService.warning(
        'Please fill in all required fields correctly.',
        'Invalid Form'
      );
    }
  }
}
