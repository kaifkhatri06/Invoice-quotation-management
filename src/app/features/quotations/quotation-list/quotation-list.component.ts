import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { InvoiceStatus } from '../../../core/models/invoice.model';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

/**
 * Quotation List Component
 * Displays all quotations with filtering and conversion to invoice
 */
@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyFormatPipe,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="quotation-list-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <h1>Quotations</h1>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="actions-bar">
            <button mat-raised-button color="primary" (click)="createQuotation()">
              <mat-icon>add</mat-icon>
              New Quotation
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="quotations()" class="quotation-table">
              <!-- Quote Number Column -->
              <ng-container matColumnDef="invoiceNumber">
                <th mat-header-cell *matHeaderCellDef>Quote #</th>
                <td mat-cell *matCellDef="let quote">
                  <strong>{{ quote.invoiceNumber }}</strong>
                </td>
              </ng-container>

              <!-- Client Column -->
              <ng-container matColumnDef="client">
                <th mat-header-cell *matHeaderCellDef>Client</th>
                <td mat-cell *matCellDef="let quote">{{ quote.clientName }}</td>
              </ng-container>

              <!-- Issue Date Column -->
              <ng-container matColumnDef="issueDate">
                <th mat-header-cell *matHeaderCellDef>Issue Date</th>
                <td mat-cell *matCellDef="let quote">
                  {{ quote.issueDate | date:'mediumDate' }}
                </td>
              </ng-container>

              <!-- Valid Until Column -->
              <ng-container matColumnDef="validUntil">
                <th mat-header-cell *matHeaderCellDef>Valid Until</th>
                <td mat-cell *matCellDef="let quote">
                  {{ quote.validUntil | date:'mediumDate' }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let quote">
                  <mat-chip [ngClass]="getStatusClass(quote.status)">
                    {{ quote.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Total Column -->
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let quote">
                  <strong>{{ quote.grandTotal | currencyFormat }}</strong>
                </td>
              </ng-container>

              <!-- Converted Column -->
              <ng-container matColumnDef="converted">
                <th mat-header-cell *matHeaderCellDef>Converted</th>
                <td mat-cell *matCellDef="let quote">
                  <mat-icon *ngIf="quote.convertedToInvoiceId" color="primary">check_circle</mat-icon>
                  <span *ngIf="!quote.convertedToInvoiceId">-</span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let quote">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewQuotation(quote.id)">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button mat-menu-item (click)="editQuotation(quote.id)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item 
                            (click)="convertToInvoice(quote.id)" 
                            [disabled]="quote.convertedToInvoiceId">
                      <mat-icon>transform</mat-icon>
                      Convert to Invoice
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns" class="quotation-row"></tr>
            </table>
          </div>

          <div class="summary">
            <p>Showing {{ quotations().length }} quotations</p>
            <p class="total-amount">
              Total Value: <strong>{{ calculateTotalValue() | currencyFormat }}</strong>
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .quotation-list-container {
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

    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .quotation-table {
      width: 100%;
      background: white;
    }

    .quotation-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .quotation-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    th.mat-header-cell {
      font-weight: 600;
    }

    .status-draft { background-color: #9e9e9e !important; color: white !important; }
    .status-sent { background-color: #2196f3 !important; color: white !important; }
    .status-paid { background-color: #4caf50 !important; color: white !important; }

    .summary {
      margin-top: 16px;
      padding: 16px 0;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total-amount {
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .table-container {
        overflow-x: scroll;
      }
    }
  `]
})
export class QuotationListComponent {
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);

  // Get quotations from service
  quotations = this.invoiceService.quotations;

  displayedColumns: string[] = [
    'invoiceNumber',
    'client',
    'issueDate',
    'validUntil',
    'status',
    'total',
    'converted',
    'actions'
  ];

  getStatusClass(status: InvoiceStatus): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  calculateTotalValue(): number {
    return this.quotations().reduce((sum, q) => sum + q.grandTotal, 0);
  }

  createQuotation(): void {
    this.router.navigate(['/quotations/new']);
  }

  viewQuotation(id: string): void {
    this.router.navigate(['/quotations', id]);
  }

  editQuotation(id: string): void {
    this.router.navigate(['/quotations', id]);
  }

  convertToInvoice(id: string): void {
    const invoice = this.invoiceService.convertQuotationToInvoice(id);
    if (invoice) {
      this.router.navigate(['/invoices', invoice.id]);
    }
  }
}
