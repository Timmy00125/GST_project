import {
  Component,
  OnInit,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DatePipe } from '@angular/common';

interface Order {
  id: number;
  order_date: string;
  total_amount: number;
  status_display: string;
  order_items: any[]; // Replace 'any[]' with your OrderItem interface if needed
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss',
})
export class OrderHistoryComponent implements OnInit {
  profileService = inject(ProfileService);
  orders: WritableSignal<Order[]> = signal([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    this.loading.set(true);
    this.profileService.getOrderHistory().subscribe({
      next: (orderHistory) => {
        this.orders.set(orderHistory);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching order history:', error);
        this.loading.set(false);
        // Handle error (e.g., show notification)
      },
    });
  }
}
