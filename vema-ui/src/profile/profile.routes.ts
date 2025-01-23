import { Routes } from '@angular/router';
import { ProfileDashboardComponent } from './components/profile-dashboard/profile-dashboard.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';

export const profileRoutes: Routes = [
  {
    path: '',
    component: ProfileDashboardComponent,
    title: 'Profile Dashboard',
    canActivate: [AuthGuard],
  },
  {
    path: 'orders',
    component: OrderHistoryComponent,
    title: 'Order History',
    canActivate: [AuthGuard],
  },
  {
    path: 'edit',
    component: ProfileEditComponent,
    title: 'Edit Profile',
    canActivate: [AuthGuard],
  },
];
