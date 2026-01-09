import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ClientService } from '../../../core/services/client.service';
import { ProductService } from '../../../core/services/product.service';
import { DocumentType, InvoiceStatus } from '../../../core/models/invoice.model';
import { LineItem } from '../../../core/models/line-item.model';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';

/**
 * Quotation Form Component
 * Form for creating and editing quotations (similar to invoice form with validity period)
 */
@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyFormatPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule
  ],
  template: `
    <div class="quotation-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h1>{{ isEditMode ? 'Edit Quotation' : 'Create New Quotation' }}</h1>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="quotationForm" (ngSubmit)="onSubmit()">
            <!-- Client & Dates Section -->
            <div class="form-section">
              <h2>Quotation Details</h2>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Client</mat-label>
                  <mat-select formControlName="clientId" required>
                    <mat-option *ngFor="let client of clients()" [value]="client.id">
                      {{ client.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Issue Date</mat-label>
                  <input matInput [matDatepicker]="issuePicker" formControlName="issueDate" required>
                  <mat-datepicker-toggle matSuffix [for]="issuePicker"></mat-datepicker-toggle>
                  <mat-datepicker #issuePicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Valid Until</mat-label>
                  <input matInput [matDatepicker]="validPicker" formControlName="validUntil" required>
                  <mat-datepicker-toggle matSuffix [for]="validPicker"></mat-datepicker-toggle>
                  <mat-datepicker #validPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status" required>
                    <mat-option *ngFor="let status of statuses" [value]="status">
                      {{ status }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Line Items Section (Same as Invoice) -->
            <div class="form-section">
              <div class="section-header">
                <h2>Line Items</h2>
                <button mat-raised-button color="accent" type="button" (click)="addLineItem()">
                  <mat-icon>add</mat-icon>
                  Add Item
                </button>
              </div>

              <div class="table-container">
                <table mat-table [dataSource]="lineItemsArray.controls" class="line-items-table">
                  <ng-container matColumnDef="product">
                    <th mat-header-cell *matHeaderCellDef>Product/Service *</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" [formGroup]="getLineItemGroup(i)">
                        <mat-select formControlName="productId" (selectionChange)="onProductSelect(i, $event.value)">
                          <mat-option *ngFor="let product of products()" [value]="product.id">
                            {{ product.name }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="quantity">
                    <th mat-header-cell *matHeaderCellDef>Qty *</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" [formGroup]="getLineItemGroup(i)">
                        <input matInput type="number" formControlName="quantity" min="1" required>
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="unitPrice">
                    <th mat-header-cell *matHeaderCellDef>Unit Price *</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" [formGroup]="getLineItemGroup(i)">
                        <input matInput type="number" formControlName="unitPrice" min="0" step="0.01" required>
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="taxRate">
                    <th mat-header-cell *matHeaderCellDef>Tax %</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" [formGroup]="getLineItemGroup(i)">
                        <input matInput type="number" formControlName="taxRate" min="0" max="100" step="1">
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="discount">
                    <th mat-header-cell *matHeaderCellDef>Discount %</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <mat-form-field appearance="outline" [formGroup]="getLineItemGroup(i)">
                        <input matInput type="number" formControlName="discountPercentage" min="0" max="100" step="1">
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="total">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <strong>{{ calculateLineTotal(i) | currencyFormat }}</strong>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let item; let i = index">
                      <button mat-icon-button color="warn" type="button" (click)="removeLineItem(i)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="lineItemColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: lineItemColumns"></tr>
                </table>
              </div>
            </div>

            <!-- Totals Section -->
            <div class="form-section totals-section">
              <h2>Summary</h2>
              <div class="totals-grid">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <strong>{{ totals().subtotal | currencyFormat }}</strong>
                </div>
                <div class="total-row">
                  <span>Total Discount:</span>
                  <strong>{{ totals().totalDiscount | currencyFormat }}</strong>
                </div>
                <div class="total-row">
                  <span>Total Tax:</span>
                  <strong>{{ totals().totalTax | currencyFormat }}</strong>
                </div>
                <div class="total-row grand-total">
                  <span>Grand Total:</span>
                  <strong>{{ totals().grandTotal | currencyFormat }}</strong>
                </div>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="form-section">
              <h2>Additional Information</h2>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Terms & Conditions</mat-label>
                <textarea matInput formControlName="terms" rows="3"></textarea>
              </mat-form-field>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button mat-button type="button" (click)="cancel()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="quotationForm.invalid">
                <mat-icon>save</mat-icon>
                {{ isEditMode ? 'Update Quotation' : 'Create Quotation' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .quotation-form-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1, h2 {
      margin: 0 0 16px 0;
    }

    h1 { font-size: 2rem; font-weight: 400; }
    h2 { font-size: 1.3rem; font-weight: 500; color: rgba(0, 0, 0, 0.87); }

    .form-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width { width: 100%; }

    .table-container {
      overflow-x: auto;
      margin: 16px 0;
    }

    .line-items-table {
      width: 100%;
      background: white;
    }

    .line-items-table mat-form-field { width: 100%; }
    .line-items-table td { padding: 8px 4px; }

    .totals-section {
      background-color: #f5f5f5;
      padding: 24px;
      border-radius: 4px;
    }

    .totals-grid {
      max-width: 400px;
      margin-left: auto;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .table-container { overflow-x: scroll; }
    }
  `]
})
export class QuotationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);
  private productService = inject(ProductService);

  clients = this.clientService.clients;
  products = this.productService.products;

  quotationForm!: FormGroup;
  isEditMode = false;
  quotationId: string | null = null;

  statuses = [InvoiceStatus.DRAFT, InvoiceStatus.SENT];
  lineItemColumns = ['product', 'quantity', 'unitPrice', 'taxRate', 'discount', 'total', 'actions'];

  totals = computed(() => {
    const lineItems = this.getLineItemsForCalculation();
    return this.invoiceService.calculateInvoiceTotals({
      lineItems,
      discountType: 'fixed',
      discountValue: 0
    });
  });

  ngOnInit(): void {
    this.initializeForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.quotationId = params['id'];
        this.loadQuotation(params['id']);
      }
    });
  }

  initializeForm(): void {
    this.quotationForm = this.fb.group({
      clientId: ['', Validators.required],
      issueDate: [new Date(), Validators.required],
      validUntil: [this.getDefaultValidDate(), Validators.required],
      status: [InvoiceStatus.DRAFT, Validators.required],
      notes: ['Quote valid for 30 days from issue date.'],
      terms: ['Payment terms to be negotiated upon acceptance.'],
      lineItems: this.fb.array([])
    });

    this.addLineItem();
  }

  getDefaultValidDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  get lineItemsArray(): FormArray {
    return this.quotationForm.get('lineItems') as FormArray;
  }

  getLineItemGroup(index: number): FormGroup {
    return this.lineItemsArray.at(index) as FormGroup;
  }

  addLineItem(): void {
    const lineItem = this.fb.group({
      id: [this.generateTempId()],
      productId: ['', Validators.required],
      productName: [''],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0.10, [Validators.min(0), Validators.max(1)]],
      discount: [0, Validators.min(0)],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]]
    });

    this.lineItemsArray.push(lineItem);
  }

  removeLineItem(index: number): void {
    if (this.lineItemsArray.length > 1) {
      this.lineItemsArray.removeAt(index);
    }
  }

  onProductSelect(index: number, productId: string): void {
    const product = this.productService.getProductById(productId);
    if (product) {
      const lineItemGroup = this.getLineItemGroup(index);
      lineItemGroup.patchValue({
        productName: product.name,
        description: product.description,
        unitPrice: product.price,
        taxRate: product.taxRate
      });
    }
  }

  calculateLineTotal(index: number): number {
    const lineItem = this.lineItemsArray.at(index).value;
    const calculation = this.invoiceService.calculateLineItem(lineItem as LineItem);
    return calculation.total;
  }

  getLineItemsForCalculation(): LineItem[] {
    return this.lineItemsArray.value;
  }

  loadQuotation(id: string): void {
    const quotation = this.invoiceService.getQuotationById(id);
    if (quotation) {
      this.lineItemsArray.clear();

      this.quotationForm.patchValue({
        clientId: quotation.clientId,
        issueDate: quotation.issueDate,
        validUntil: quotation.validUntil,
        status: quotation.status,
        notes: quotation.notes,
        terms: quotation.terms
      });

      quotation.lineItems.forEach(item => {
        const lineItemGroup = this.fb.group({
          id: [item.id],
          productId: [item.productId, Validators.required],
          productName: [item.productName],
          description: [item.description],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
          taxRate: [item.taxRate, [Validators.min(0), Validators.max(1)]],
          discount: [item.discount, Validators.min(0)],
          discountPercentage: [item.discountPercentage, [Validators.min(0), Validators.max(100)]]
        });
        this.lineItemsArray.push(lineItemGroup);
      });
    }
  }

  onSubmit(): void {
    if (this.quotationForm.valid) {
      const formValue = this.quotationForm.value;
      const client = this.clientService.getClientById(formValue.clientId);

      if (!client) return;

      const quotationData = {
        type: DocumentType.QUOTATION as const,
        clientId: formValue.clientId,
        clientName: client.name,
        issueDate: formValue.issueDate,
        dueDate: formValue.validUntil,
        validUntil: formValue.validUntil,
        status: formValue.status,
        lineItems: formValue.lineItems,
        notes: formValue.notes,
        terms: formValue.terms,
        discountType: 'fixed' as const,
        discountValue: 0,
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: 0
      };

      this.invoiceService.createQuotation(quotationData);
      this.router.navigate(['/quotations']);
    }
  }

  cancel(): void {
    this.router.navigate(['/quotations']);
  }

  private generateTempId(): string {
    return `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
