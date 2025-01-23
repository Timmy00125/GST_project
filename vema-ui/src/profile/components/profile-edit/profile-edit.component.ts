import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router, RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile: {
    name: string;
    address: string;
    // ... other profile fields
  };
}

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  fb = inject(FormBuilder);
  profileService = inject(ProfileService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  profileForm!: FormGroup;
  userProfile: UserProfile | null = null;
  loading = false;

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
    });
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          name: profile.profile.name,
          address: profile.profile.address,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        this.loading = false;
        // Handle error (e.g., redirect to profile dashboard, show notification)
      },
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.profileService.updateUserProfile(this.profileForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success(
            'Profile updated successfully!',
            'Success'
          );
          this.router.navigate(['/profile']); // Redirect to profile dashboard
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error(
            error.error.message || 'Profile update failed.',
            'Update Error'
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
