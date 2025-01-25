import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/product.models';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filters.component.html',
  styleUrl: './product-filters.component.scss',
})
export class ProductFilterComponent {
  @Input() categories: Category[] = [];
  @Output() categoryChange = new EventEmitter<number | null>();
  @Output() priceRangeChange = new EventEmitter<{
    minPrice: number | null;
    maxPrice: number | null;
  }>();
  @Output() sortOptionChange = new EventEmitter<string>();

  selectedCategoryId: WritableSignal<number | null> = signal(null);
  minPriceInput: WritableSignal<number | null> = signal(null);
  maxPriceInput: WritableSignal<number | null> = signal(null);
  sortOptionInput: WritableSignal<string> = signal('');

  onCategoryFilterChange(): void {
    this.categoryChange.emit(this.selectedCategoryId());
  }

  onPriceRangeFilterChange(): void {
    this.priceRangeChange.emit({
      minPrice: this.minPriceInput(),
      maxPrice: this.maxPriceInput(),
    });
  }

  onSortChange(): void {
    this.sortOptionChange.emit(this.sortOptionInput());
  }
}
