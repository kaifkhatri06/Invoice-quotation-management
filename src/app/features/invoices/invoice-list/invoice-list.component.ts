import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { InvoiceStatus, DocumentType } from '../../../core/models/invoice.model';
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
 * Invoice List Component
 * Displays all invoices with filtering, sorting, and actions
 */
@Component({
  selector: 'app-invoice-list',
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
    <div class="invoice-list-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <h1>Invoices</h1>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="actions-bar">
            <button mat-raised-button color="primary" (click)="createInvoice()">
              <mat-icon>add</mat-icon>
              New Invoice
            </button>
            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Filter by Status</mat-label>
              <mat-select [(value)]="statusFilter" (valueChange)="onFilterChange()">
                <mat-option [value]="null">All Statuses</mat-option>
                <mat-option *ngFor="let status of statuses" [value]="status">
                  {{ status }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="filteredInvoices()" class="invoice-table">
              <!-- Invoice Number Column -->
              <ng-container matColumnDef="invoiceNumber">
                <th mat-header-cell *matHeaderCellDef>Invoice #</th>
                <td mat-cell *matCellDef="let invoice">
                  <strong>{{ invoice.invoiceNumber }}</strong>
                </td>
              </ng-container>

              <!-- Client Column -->
              <ng-container matColumnDef="client">
                <th mat-header-cell *matHeaderCellDef>Client</th>
                <td mat-cell *matCellDef="let invoice">{{ invoice.clientName }}</td>
              </ng-container>

              <!-- Issue Date Column -->
              <ng-container matColumnDef="issueDate">
                <th mat-header-cell *matHeaderCellDef>Issue Date</th>
                <td mat-cell *matCellDef="let invoice">
                  {{ invoice.issueDate | date:'mediumDate' }}
                </td>
              </ng-container>

              <!-- Due Date Column -->
              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>Due Date</th>
                <td mat-cell *matCellDef="let invoice">
                  {{ invoice.dueDate | date:'mediumDate' }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let invoice">
                  <mat-chip [ngClass]="getStatusClass(invoice.status)">
                    {{ invoice.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Total Column -->
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let invoice">
                  <strong>{{ invoice.grandTotal | currencyFormat }}</strong>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let invoice">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewInvoice(invoice.id)">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button mat-menu-item (click)="editInvoice(invoice.id)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="printInvoice(invoice.id)">
                      <mat-icon>print</mat-icon>
                      Print
                    </button>
                    <button mat-menu-item (click)="changeStatus(invoice.id, 'Paid')" 
                            *ngIf="invoice.status !== 'Paid'">
                      <mat-icon>check_circle</mat-icon>
                      Mark as Paid
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns" class="invoice-row"></tr>
            </table>
          </div>

          <div class="summary">
            <p>Showing {{ filteredInvoices().length }} of {{ invoices().length }} invoices</p>
            <p class="total-amount">
              Total Value: <strong>{{ calculateTotalValue() | currencyFormat }}</strong>
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-list-container {
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
      flex-wrap: wrap;
    }

    .status-filter {
      min-width: 200px;
    }

    .table-container {
      overflow-x: auto;
    }

    .invoice-table {
      width: 100%;
      background: white;
    }

    .invoice-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .invoice-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    th.mat-header-cell {
      font-weight: 600;
    }

    /* Status chip colors */
    .status-draft {
      background-color: #9e9e9e !important;
      color: white !important;
    }

    .status-sent {
      background-color: #2196f3 !important;
      color: white !important;
    }

    .status-paid {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .status-overdue {
      background-color: #f44336 !important;
      color: white !important;
    }

    .status-cancelled {
      background-color: #ff9800 !important;
      color: white !important;
    }

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
      .actions-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .table-container {
        overflow-x: scroll;
      }
    }
  `]
})
export class InvoiceListComponent {
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);

  // Get invoices from service
  invoices = this.invoiceService.invoices;

  // Filter state
  statusFilter: InvoiceStatus | null = null;

  // All available statuses
  statuses = Object.values(InvoiceStatus);

  // Filtered invoices based on status
  filteredInvoices = computed(() => {
    if (this.statusFilter === null) {
      return this.invoices();
    }
    return this.invoiceService.getInvoicesByStatus(this.statusFilter);
  });

  displayedColumns: string[] = [
    'invoiceNumber',
    'client',
    'issueDate',
    'dueDate',
    'status',
    'total',
    'actions'
  ];

  /**
   * Get CSS class for status chip
   */
  getStatusClass(status: InvoiceStatus): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  /**
   * Calculate total value of filtered invoices
   */
  calculateTotalValue(): number {
    return this.filteredInvoices().reduce((sum, inv) => sum + inv.grandTotal, 0);
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    // Computed signal will automatically update
  }

  /**
   * Navigate to create new invoice
   */
  createInvoice(): void {
    this.router.navigate(['/invoices/new']);
  }

  /**
   * Navigate to view invoice
   */
  viewInvoice(id: string): void {
    this.router.navigate(['/invoices', id]);
  }

  /**
   * Navigate to edit invoice
   */
  editInvoice(id: string): void {
    this.router.navigate(['/invoices', id, 'edit']);
  }

  /**
   * Navigate to print invoice
   */
  printInvoice(id: string): void {
    this.router.navigate(['/invoices', id, 'print']);
  }

  /**
   * Change invoice status
   */
  changeStatus(id: string, status: string): void {
    this.invoiceService.updateInvoiceStatus(id, status as InvoiceStatus);
  }
}
