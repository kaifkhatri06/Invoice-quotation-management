import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../core/models/invoice.model';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

/**
 * Invoice Preview Component
 * Displays invoice details in a formatted view
 */
@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="invoice-preview-container" *ngIf="invoice()">
      <mat-card>
        <mat-card-content>
          <div class="actions-bar">
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back to List
            </button>
            <div class="action-buttons">
              <button mat-raised-button (click)="editInvoice()">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-raised-button color="primary" (click)="printInvoice()">
                <mat-icon>print</mat-icon>
                Print
              </button>
            </div>
          </div>

          <div class="invoice-header">
            <div class="company-info">
              <h1>INVOICE</h1>
              <p class="invoice-number">{{ invoice()!.invoiceNumber }}</p>
            </div>
            <mat-chip [ngClass]="getStatusClass(invoice()!.status)">
              {{ invoice()!.status }}
            </mat-chip>
          </div>

          <div class="invoice-parties">
            <div class="client-info">
              <h3>Bill To:</h3>
              <p><strong>{{ invoice()!.clientName }}</strong></p>
            </div>
            <div class="invoice-dates">
              <p><strong>Issue Date:</strong> {{ invoice()!.issueDate | date:'mediumDate' }}</p>
              <p><strong>Due Date:</strong> {{ invoice()!.dueDate | date:'mediumDate' }}</p>
            </div>
          </div>

          <div class="line-items">
            <h3>Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Tax Rate</th>
                  <th>Discount</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of invoice()!.lineItems">
                  <td>
                    <strong>{{ item.productName }}</strong>
                    <br><small>{{ item.description }}</small>
                  </td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.unitPrice | currencyFormat }}</td>
                  <td>{{ item.taxRate * 100 }}%</td>
                  <td>{{ item.discountPercentage }}%</td>
                  <td class="text-right">{{ calculateLineTotal(item) | currencyFormat }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="invoice-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <strong>{{ invoice()!.subtotal | currencyFormat }}</strong>
            </div>
            <div class="total-row">
              <span>Total Discount:</span>
              <strong>{{ invoice()!.totalDiscount | currencyFormat }}</strong>
            </div>
            <div class="total-row">
              <span>Total Tax:</span>
              <strong>{{ invoice()!.totalTax | currencyFormat }}</strong>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total:</span>
              <strong>{{ invoice()!.grandTotal | currencyFormat }}</strong>
            </div>
          </div>

          <div class="invoice-notes" *ngIf="invoice()!.notes">
            <h3>Notes:</h3>
            <p>{{ invoice()!.notes }}</p>
          </div>

          <div class="invoice-terms" *ngIf="invoice()!.terms">
            <h3>Terms & Conditions:</h3>
            <p>{{ invoice()!.terms }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-preview-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .actions-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .company-info h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 300;
      color: #1976d2;
    }

    .invoice-number {
      font-size: 1.2rem;
      color: rgba(0, 0, 0, 0.6);
      margin: 8px 0 0 0;
    }

    .invoice-parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .invoice-parties h3 {
      margin: 0 0 8px 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      color: rgba(0, 0, 0, 0.6);
    }

    .invoice-parties p {
      margin: 4px 0;
    }

    .line-items {
      margin-bottom: 32px;
    }

    .line-items h3 {
      margin: 0 0 16px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    th {
      background-color: #f5f5f5;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .text-right {
      text-align: right;
    }

    .invoice-totals {
      max-width: 400px;
      margin-left: auto;
      margin-bottom: 32px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 1rem;
    }

    .grand-total {
      border-top: 2px solid rgba(0, 0, 0, 0.12);
      margin-top: 8px;
      padding-top: 16px;
      font-size: 1.3rem;
      color: #1976d2;
    }

    .invoice-notes, .invoice-terms {
      margin-top: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .invoice-notes h3, .invoice-terms h3 {
      margin: 0 0 8px 0;
      font-size: 1rem;
    }

    .status-draft { background-color: #9e9e9e !important; color: white !important; }
    .status-sent { background-color: #2196f3 !important; color: white !important; }
    .status-paid { background-color: #4caf50 !important; color: white !important; }
    .status-overdue { background-color: #f44336 !important; color: white !important; }
    .status-cancelled { background-color: #ff9800 !important; color: white !important; }
  `]
})
export class InvoicePreviewComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);

  invoice = signal<Invoice | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        const inv = this.invoiceService.getInvoiceById(params['id']);
        this.invoice.set(inv || null);
      }
    });
  }

  calculateLineTotal(item: any): number {
    const calc = this.invoiceService.calculateLineItem(item);
    return calc.total;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }

  editInvoice(): void {
    const inv = this.invoice();
    if (inv) {
      this.router.navigate(['/invoices', inv.id, 'edit']);
    }
  }

  printInvoice(): void {
    const inv = this.invoice();
    if (inv) {
      this.router.navigate(['/invoices', inv.id, 'print']);
    }
  }
}
