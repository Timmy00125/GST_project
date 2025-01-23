import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { ProfileService } from '../../services/profile.service';
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
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './profile-dashboard.component.html',
  styleUrl: './profile-dashboard.component.scss',
})
export class ProfileDashboardComponent implements OnInit {
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  router = inject(Router);

  userProfile: UserProfile | null = null;
  loading = false;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        this.loading = false;
        // Handle error (e.g., redirect to login, show notification)
      },
    });
  }
}
