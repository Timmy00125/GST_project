import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedModule } from '../../../shared/shared.module';
// import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Product, Category, ProductImage } from '../../models/product.models';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    // LoadingSpinnerComponent,
  ],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
})
export class CreateProductComponent implements OnInit {
  fb = inject(FormBuilder);
  productService = inject(ProductService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  // categoryService = inject(CategoryService); // Inject CategoryService - **Already Correct**
  loading = false;
  categories: Category[] = []; // Array to hold categories for dropdown - **Already Correct**

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required], // Category is required - **Already Correct**
    image: [null], // File FormControl - **Already Correct**
  });

  ngOnInit(): void {
    this.loadCategories(); // Load categories on component initialization - **Already Correct**
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      // **Already Correct**
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.notificationService.error(
          'Error loading categories.',
          'Category Error'
        );
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      const formData = new FormData();
      formData.append('title', this.productForm.get('title')?.value || '');
      formData.append(
        'description',
        this.productForm.get('description')?.value || ''
      );
      formData.append(
        'price',
        this.productForm.get('price')?.value?.toString() || '0'
      );
      formData.append(
        'category',
        this.productForm.get('category')?.value || ''
      ); // Append category ID - **Already Correct**
      const imageControl = this.productForm.get('image');
      if (imageControl && imageControl.value) {
        formData.append('image_files', imageControl.value); // Append image file - **Already Correct**
      }

      this.productService.createProduct(formData).subscribe({
        // **Already Correct**
        next: (response) => {
          this.loading = false;
          this.notificationService.success(
            'Product created successfully!',
            'Success'
          );
          this.router.navigate(['/products']); // Redirect to product list - **Already Correct**
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error(
            error.error.detail ||
              'Error creating product. Please check the form.',
            'Creation Error'
          );
          console.error('Product creation error:', error); // **Already Correct**
        },
      });
    } else {
      this.notificationService.warning(
        'Please fill in all required fields correctly.',
        'Invalid Form'
      );
    }
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.productForm.patchValue({
        image: file, // Store the file object in the form control - **Already Correct**
      });
    }
  }
}
