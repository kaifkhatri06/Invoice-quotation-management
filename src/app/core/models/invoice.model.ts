import { LineItem } from './line-item.model';

/**
 * Invoice Status Enum
 */
export enum InvoiceStatus {
    DRAFT = 'Draft',
    SENT = 'Sent',
    PAID = 'Paid',
    OVERDUE = 'Overdue',
    CANCELLED = 'Cancelled'
}

/**
 * Document Type
 */
export enum DocumentType {
    INVOICE = 'Invoice',
    QUOTATION = 'Quotation'
}

/**
 * Base Invoice/Quotation Model
 */
export interface Invoice {
    id: string;
    invoiceNumber: string;
    type: DocumentType;
    clientId: string;
    clientName: string;
    issueDate: Date;
    dueDate: Date;
    status: InvoiceStatus;
    lineItems: LineItem[];
    notes?: string;
    terms?: string;

    // Discount can be applied at invoice level
    discountType: 'percentage' | 'fixed';
    discountValue: number;

    // Calculated fields
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    grandTotal: number;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Quotation specific properties
 */
export interface Quotation extends Invoice {
    type: DocumentType.QUOTATION;
    validUntil: Date;
    convertedToInvoiceId?: string;
}

/**
 * Invoice Summary for list views
 */
export interface InvoiceSummary {
    id: string;
    invoiceNumber: string;
    type: DocumentType;
    clientName: string;
    issueDate: Date;
    dueDate: Date;
    status: InvoiceStatus;
    grandTotal: number;
}
