import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../core/models/invoice.model';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';

/**
 * Invoice Print Component
 * Print-optimized invoice layout with professional styling
 */
@Component({
    selector: 'app-invoice-print',
    standalone: true,
    imports: [CommonModule, CurrencyFormatPipe],
    template: `
    <div class="print-container" *ngIf="invoice()">
      <div class="print-header">
        <div class="company-section">
          <h1>YOUR COMPANY NAME</h1>
          <p>123 Business Street</p>
          <p>City, State 12345</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@yourcompany.com</p>
        </div>
        <div class="invoice-title-section">
          <h2>INVOICE</h2>
          <p class="invoice-number">{{ invoice()!.invoiceNumber }}</p>
          <p class="status">Status: {{ invoice()!.status }}</p>
        </div>
      </div>

      <div class="invoice-info">
        <div class="bill-to">
          <h3>BILL TO:</h3>
          <p><strong>{{ invoice()!.clientName }}</strong></p>
        </div>
        <div class="invoice-dates">
          <table class="dates-table">
            <tr>
              <td><strong>Issue Date:</strong></td>
              <td>{{ invoice()!.issueDate | date:'mediumDate' }}</td>
            </tr>
            <tr>
              <td><strong>Due Date:</strong></td>
              <td>{{ invoice()!.dueDate | date:'mediumDate' }}</td>
            </tr>
          </table>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="center">Qty</th>
            <th class="right">Unit Price</th>
            <th class="center">Tax</th>
            <th class="center">Disc.</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of invoice()!.lineItems">
            <td>
              <strong>{{ item.productName }}</strong>
              <br><span class="description">{{ item.description }}</span>
            </td>
            <td class="center">{{ item.quantity }}</td>
            <td class="right">{{ item.unitPrice | currencyFormat }}</td>
            <td class="center">{{ item.taxRate * 100 }}%</td>
            <td class="center">{{ item.discountPercentage }}%</td>
            <td class="right"><strong>{{ calculateLineTotal(item) | currencyFormat }}</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td class="right">{{ invoice()!.subtotal | currencyFormat }}</td>
          </tr>
          <tr>
            <td>Total Discount:</td>
            <td class="right">{{ invoice()!.totalDiscount | currencyFormat }}</td>
          </tr>
          <tr>
            <td>Total Tax:</td>
            <td class="right">{{ invoice()!.totalTax | currencyFormat }}</td>
          </tr>
          <tr class="grand-total">
            <td><strong>TOTAL DUE:</strong></td>
            <td class="right"><strong>{{ invoice()!.grandTotal | currencyFormat }}</strong></td>
          </tr>
        </table>
      </div>

      <div class="footer-section">
        <div class="notes" *ngIf="invoice()!.notes">
          <h4>Notes:</h4>
          <p>{{ invoice()!.notes }}</p>
        </div>
        <div class="terms" *ngIf="invoice()!.terms">
          <h4>Terms & Conditions:</h4>
          <p>{{ invoice()!.terms }}</p>
        </div>
      </div>

      <div class="print-footer">
        <p>Thank you for your business!</p>
      </div>
    </div>

    <div class="no-print">
      <button onclick="window.print()" class="print-button">
        Print Invoice
      </button>
    </div>
  `,
    styles: [`
    /* Screen Styles */
    .print-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .no-print {
      text-align: center;
      padding: 20px;
    }

    .print-button {
      padding: 12px 32px;
      font-size: 16px;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .print-button:hover {
      background-color: #1565c0;
    }

    /* Common Styles */
    .print-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1976d2;
    }

    .company-section h1 {
      margin: 0 0 12px 0;
      font-size: 24px;
      color: #1976d2;
    }

    .company-section p {
      margin: 4px 0;
      font-size: 14px;
    }

    .invoice-title-section {
      text-align: right;
    }

    .invoice-title-section h2 {
      margin: 0;
      font-size: 36px;
      font-weight: 300;
      color: #333;
    }

    .invoice-number {
      font-size: 18px;
      font-weight: bold;
      margin: 8px 0;
    }

    .status {
      font-size: 14px;
      color: #666;
    }

    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .bill-to h3 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #666;
      letter-spacing: 1px;
    }

    .bill-to p {
      margin: 4px 0;
      font-size: 14px;
    }

    .dates-table {
      font-size: 14px;
    }

    .dates-table td {
      padding: 4px 8px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }

    .items-table th,
    .items-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .items-table thead {
      background-color: #f5f5f5;
    }

    .items-table th {
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }

    .items-table .description {
      font-size: 12px;
      color: #666;
    }

    .center {
      text-align: center;
    }

    .right {
      text-align: right;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }

    .totals-table {
      width: 300px;
      font-size: 14px;
    }

    .totals-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #eee;
    }

    .totals-table .grand-total {
      border-top: 2px solid #333;
      font-size: 18px;
      color: #1976d2;
    }

    .totals-table .grand-total td {
      padding-top: 16px;
    }

    .footer-section {
      margin-bottom: 40px;
    }

    .footer-section h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
    }

    .footer-section p {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #666;
    }

    .notes {
      margin-bottom: 20px;
    }

    .print-footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #999;
      font-size: 14px;
    }

    /* Print Styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .print-container {
        max-width: none;
        margin: 0;
        padding: 20px;
        box-shadow: none;
      }

      .no-print {
        display: none;
      }

      .print-header {
        border-bottom: 3px solid #000;
      }

      .company-section h1,
      .invoice-title-section h2 {
        color: #000;
      }

      .totals-table .grand-total {
        border-top: 2px solid #000;
      }
    }
  `]
})
export class InvoicePrintComponent implements OnInit {
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
}
