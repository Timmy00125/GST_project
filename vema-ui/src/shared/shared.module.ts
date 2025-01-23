import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ModalComponent } from './components/modal/modal.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule, // Import ReactiveFormsModule if needed in shared components
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ModalComponent,
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ModalComponent,
    CommonModule, // Re-export CommonModule for feature modules
    ReactiveFormsModule, // Re-export ReactiveFormsModule if needed in feature modules
    RouterModule, // Re-export RouterModule for feature modules
  ],
})
export class SharedModule {}
