import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { ProductCategory } from '../../../core/models/product.model';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

/**
 * Product Catalog Component
 * Displays products grouped by category with filtering
 */
@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyFormatPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="product-catalog-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <h1>Product & Service Catalog</h1>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filter-bar">
            <mat-form-field appearance="outline">
              <mat-label>Filter by Category</mat-label>
              <mat-select [(value)]="selectedCategory" (valueChange)="onCategoryChange()">
                <mat-option [value]="null">All Categories</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category">
                  {{ category }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <div class="stats">
              <mat-chip>{{ filteredProducts().length }} Products</mat-chip>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="products-grid">
        <mat-card *ngFor="let product of filteredProducts()" class="product-card">
          <mat-card-header>
            <mat-card-title>{{ product.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip class="category-chip">{{ product.category }}</mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="description">{{ product.description }}</p>
            <div class="product-details">
              <div class="price">
                <strong>{{ product.price | currencyFormat }}</strong>
                <span class="unit">/ {{ product.unit }}</span>
              </div>
              <div class="tax-rate">
                Tax Rate: {{ product.taxRate * 100 }}%
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .product-catalog-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
    }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .stats {
      display: flex;
      gap: 8px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .product-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .category-chip {
      font-size: 0.75rem;
    }

    .description {
      color: rgba(0, 0, 0, 0.7);
      margin: 16px 0;
      min-height: 48px;
    }

    .product-details {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      padding-top: 12px;
    }

    .price {
      font-size: 1.5rem;
      color: #1976d2;
      margin-bottom: 8px;
    }

    .unit {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      font-weight: normal;
    }

    .tax-rate {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: 1fr;
      }

      .filter-bar {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class ProductCatalogComponent {
  private productService = inject(ProductService);

  // All products from service
  products = this.productService.products;

  // Selected category filter
  selectedCategory: ProductCategory | null = null;

  // All available categories
  categories = Object.values(ProductCategory);

  // Filtered products based on selected category
  filteredProducts = computed(() => {
    if (this.selectedCategory === null) {
      return this.products();
    }
    return this.productService.getProductsByCategory(this.selectedCategory);
  });

  /**
   * Handle category filter change
   */
  onCategoryChange(): void {
    // The computed signal will automatically update
  }
}
