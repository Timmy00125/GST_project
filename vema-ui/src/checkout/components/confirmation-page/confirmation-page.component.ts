import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmation-page.component.html',
  styleUrl: './confirmation-page.component.scss',
})
export class ConfirmationPageComponent implements OnInit {
  order: any;
  router = inject(Router);

  ngOnInit(): void {
    this.order = history.state.order;
    if (!this.order) {
      // Redirect if order details are not available (e.g., direct navigation)
      this.router.navigate(['/products']);
    }
  }
}
