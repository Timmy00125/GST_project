import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  loading = false;

  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]], // Password length validation
    name: ['', Validators.required],
    address: ['', Validators.required],
  });

  register(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success(
            'Registration successful! Please check your email for verification.',
            'Success'
          );
          this.router.navigate(['/auth/login']); // Redirect to login after successful registration
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error(
            error.error.message || 'Registration failed. Please try again.',
            'Registration Error'
          );
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
