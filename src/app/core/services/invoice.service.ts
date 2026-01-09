import { Injectable, signal, computed } from '@angular/core';
import { Invoice, Quotation, InvoiceStatus, DocumentType, InvoiceSummary } from '../models/invoice.model';
import { LineItem, LineItemCalculation } from '../models/line-item.model';

/**
 * Invoice Service
 * Manages invoices and quotations with complex business logic for calculations
 * Uses Angular Signals for reactive state management
 */
@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    // Signals for invoices and quotations
    private invoicesSignal = signal<Invoice[]>(this.getMockInvoices());
    private quotationsSignal = signal<Quotation[]>(this.getMockQuotations());

    // Public computed signals (read-only)
    public invoices = this.invoicesSignal.asReadonly();
    public quotations = this.quotationsSignal.asReadonly();

    // Computed: All documents (invoices + quotations)
    public allDocuments = computed(() => [
        ...this.invoicesSignal(),
        ...this.quotationsSignal()
    ]);

    /**
     * Calculate line item totals
     * This is the core business logic for invoice calculations
     */
    calculateLineItem(item: LineItem): LineItemCalculation {
        // Step 1: Calculate subtotal (quantity × unit price)
        const subtotal = item.quantity * item.unitPrice;

        // Step 2: Calculate discount amount
        let discountAmount = item.discount; // Fixed discount
        if (item.discountPercentage > 0) {
            // Percentage discount takes precedence
            discountAmount = subtotal * (item.discountPercentage / 100);
        }

        // Step 3: Calculate taxable amount (subtotal - discount)
        const taxableAmount = subtotal - discountAmount;

        // Step 4: Calculate tax amount
        const taxAmount = taxableAmount * item.taxRate;

        // Step 5: Calculate total (taxable amount + tax)
        const total = taxableAmount + taxAmount;

        return {
            subtotal,
            discountAmount,
            taxableAmount,
            taxAmount,
            total
        };
    }

    /**
     * Calculate invoice totals from line items
     */
    calculateInvoiceTotals(invoice: Partial<Invoice>): {
        subtotal: number;
        totalDiscount: number;
        totalTax: number;
        grandTotal: number;
    } {
        const lineItems = invoice.lineItems || [];

        // Calculate totals from all line items
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        lineItems.forEach(item => {
            const calc = this.calculateLineItem(item);
            subtotal += calc.subtotal;
            totalDiscount += calc.discountAmount;
            totalTax += calc.taxAmount;
        });

        // Apply invoice-level discount if present
        let invoiceLevelDiscount = 0;
        if (invoice.discountValue && invoice.discountValue > 0) {
            if (invoice.discountType === 'percentage') {
                invoiceLevelDiscount = subtotal * (invoice.discountValue / 100);
            } else {
                invoiceLevelDiscount = invoice.discountValue;
            }
        }

        totalDiscount += invoiceLevelDiscount;

        // Recalculate tax if invoice-level discount is applied
        if (invoiceLevelDiscount > 0) {
            const adjustedSubtotal = subtotal - invoiceLevelDiscount;
            // Note: This is a simplified approach. In real scenarios, tax calculation
            // with invoice-level discounts can be more complex
        }

        const grandTotal = subtotal - totalDiscount + totalTax;

        return {
            subtotal,
            totalDiscount,
            totalTax,
            grandTotal: Math.max(0, grandTotal) // Ensure non-negative
        };
    }

    /**
     * Generate next invoice number
     */
    generateInvoiceNumber(type: DocumentType): string {
        const prefix = type === DocumentType.INVOICE ? 'INV' : 'QUO';
        const allDocs = this.allDocuments();
        const typeDocuments = allDocs.filter(doc => doc.type === type);
        const nextNumber = String(typeDocuments.length + 1).padStart(4, '0');
        return `${prefix}-${new Date().getFullYear()}-${nextNumber}`;
    }

    /**
     * Create a new invoice
     */
    createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>): Invoice {
        const totals = this.calculateInvoiceTotals(invoice);

        const newInvoice: Invoice = {
            ...invoice,
            id: this.generateId(),
            invoiceNumber: this.generateInvoiceNumber(DocumentType.INVOICE),
            ...totals,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.invoicesSignal.update(invoices => [...invoices, newInvoice]);
        return newInvoice;
    }

    /**
     * Create a new quotation
     */
    createQuotation(quotation: Omit<Quotation, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>): Quotation {
        const totals = this.calculateInvoiceTotals(quotation);

        const newQuotation: Quotation = {
            ...quotation,
            id: this.generateId(),
            invoiceNumber: this.generateInvoiceNumber(DocumentType.QUOTATION),
            ...totals,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.quotationsSignal.update(quotations => [...quotations, newQuotation]);
        return newQuotation;
    }

    /**
     * Update an existing invoice
     */
    updateInvoice(id: string, updates: Partial<Invoice>): void {
        this.invoicesSignal.update(invoices =>
            invoices.map(invoice => {
                if (invoice.id === id) {
                    const updated = { ...invoice, ...updates, updatedAt: new Date() };
                    const totals = this.calculateInvoiceTotals(updated);
                    return { ...updated, ...totals };
                }
                return invoice;
            })
        );
    }

    /**
     * Update invoice status
     */
    updateInvoiceStatus(id: string, status: InvoiceStatus): void {
        this.updateInvoice(id, { status });
    }

    /**
     * Convert quotation to invoice
     */
    convertQuotationToInvoice(quotationId: string): Invoice | null {
        const quotation = this.quotationsSignal().find(q => q.id === quotationId);
        if (!quotation) return null;

        const invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'> = {
            type: DocumentType.INVOICE,
            clientId: quotation.clientId,
            clientName: quotation.clientName,
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: InvoiceStatus.DRAFT,
            lineItems: [...quotation.lineItems],
            notes: quotation.notes,
            terms: quotation.terms,
            discountType: quotation.discountType,
            discountValue: quotation.discountValue,
            subtotal: quotation.subtotal,
            totalDiscount: quotation.totalDiscount,
            totalTax: quotation.totalTax,
            grandTotal: quotation.grandTotal
        };

        const newInvoice = this.createInvoice(invoice);

        // Update quotation to mark it as converted
        this.quotationsSignal.update(quotations =>
            quotations.map(q =>
                q.id === quotationId
                    ? { ...q, convertedToInvoiceId: newInvoice.id, updatedAt: new Date() }
                    : q
            )
        );

        return newInvoice;
    }

    /**
     * Delete an invoice
     */
    deleteInvoice(id: string): void {
        this.invoicesSignal.update(invoices => invoices.filter(inv => inv.id !== id));
    }

    /**
     * Delete a quotation
     */
    deleteQuotation(id: string): void {
        this.quotationsSignal.update(quotations => quotations.filter(q => q.id !== id));
    }

    /**
     * Get invoice by ID
     */
    getInvoiceById(id: string): Invoice | undefined {
        return this.invoicesSignal().find(inv => inv.id === id);
    }

    /**
     * Get quotation by ID
     */
    getQuotationById(id: string): Quotation | undefined {
        return this.quotationsSignal().find(q => q.id === id);
    }

    /**
     * Filter invoices by status
     */
    getInvoicesByStatus(status: InvoiceStatus): Invoice[] {
        return this.invoicesSignal().filter(inv => inv.status === status);
    }

    /**
     * Generate unique ID (simple implementation)
     */
    private generateId(): string {
        return `ID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Mock invoice data
     */
    private getMockInvoices(): Invoice[] {
        return [
            {
                id: 'INV-001',
                invoiceNumber: 'INV-2026-0001',
                type: DocumentType.INVOICE,
                clientId: 'CLT001',
                clientName: 'Acme Corporation',
                issueDate: new Date('2026-01-02'),
                dueDate: new Date('2026-02-01'),
                status: InvoiceStatus.SENT,
                lineItems: [
                    {
                        id: 'LI-001',
                        productId: 'PRD002',
                        productName: 'Web Development - Premium',
                        description: 'Custom e-commerce platform development',
                        quantity: 40,
                        unitPrice: 175.00,
                        taxRate: 0.10,
                        discount: 0,
                        discountPercentage: 0
                    },
                    {
                        id: 'LI-002',
                        productId: 'PRD012',
                        productName: 'UI/UX Design',
                        description: 'User interface design for e-commerce platform',
                        quantity: 20,
                        unitPrice: 140.00,
                        taxRate: 0.10,
                        discount: 0,
                        discountPercentage: 5
                    }
                ],
                notes: 'Thank you for your business!',
                terms: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
                discountType: 'percentage',
                discountValue: 0,
                subtotal: 9800.00,
                totalDiscount: 140.00,
                totalTax: 966.00,
                grandTotal: 10626.00,
                createdAt: new Date('2026-01-02'),
                updatedAt: new Date('2026-01-02')
            },
            {
                id: 'INV-002',
                invoiceNumber: 'INV-2026-0002',
                type: DocumentType.INVOICE,
                clientId: 'CLT002',
                clientName: 'TechStart Inc.',
                issueDate: new Date('2026-01-05'),
                dueDate: new Date('2026-02-04'),
                status: InvoiceStatus.PAID,
                lineItems: [
                    {
                        id: 'LI-003',
                        productId: 'PRD009',
                        productName: 'CMS License - Enterprise',
                        description: 'Annual enterprise CMS license',
                        quantity: 1,
                        unitPrice: 1999.00,
                        taxRate: 0.08,
                        discount: 0,
                        discountPercentage: 0
                    }
                ],
                notes: 'Paid via bank transfer on 2026-01-15',
                terms: 'Payment due within 30 days.',
                discountType: 'fixed',
                discountValue: 0,
                subtotal: 1999.00,
                totalDiscount: 0,
                totalTax: 159.92,
                grandTotal: 2158.92,
                createdAt: new Date('2026-01-05'),
                updatedAt: new Date('2026-01-15')
            },
            {
                id: 'INV-003',
                invoiceNumber: 'INV-2026-0003',
                type: DocumentType.INVOICE,
                clientId: 'CLT005',
                clientName: 'Digital Dynamics',
                issueDate: new Date('2026-01-08'),
                dueDate: new Date('2026-01-22'),
                status: InvoiceStatus.DRAFT,
                lineItems: [
                    {
                        id: 'LI-004',
                        productId: 'PRD022',
                        productName: 'Maintenance Package',
                        description: 'Monthly maintenance - January 2026',
                        quantity: 1,
                        unitPrice: 750.00,
                        taxRate: 0.10,
                        discount: 0,
                        discountPercentage: 0
                    }
                ],
                notes: '',
                terms: 'Payment due within 14 days.',
                discountType: 'percentage',
                discountValue: 0,
                subtotal: 750.00,
                totalDiscount: 0,
                totalTax: 75.00,
                grandTotal: 825.00,
                createdAt: new Date('2026-01-08'),
                updatedAt: new Date('2026-01-08')
            }
        ];
    }

    /**
     * Mock quotation data
     */
    private getMockQuotations(): Quotation[] {
        return [
            {
                id: 'QUO-001',
                invoiceNumber: 'QUO-2026-0001',
                type: DocumentType.QUOTATION,
                clientId: 'CLT003',
                clientName: 'Global Solutions Ltd',
                issueDate: new Date('2026-01-03'),
                dueDate: new Date('2026-02-02'),
                validUntil: new Date('2026-01-31'),
                status: InvoiceStatus.SENT,
                lineItems: [
                    {
                        id: 'LI-005',
                        productId: 'PRD005',
                        productName: 'Technical Consulting',
                        description: 'Cloud migration strategy and planning',
                        quantity: 24,
                        unitPrice: 200.00,
                        taxRate: 0.10,
                        discount: 0,
                        discountPercentage: 0
                    },
                    {
                        id: 'LI-006',
                        productId: 'PRD007',
                        productName: 'DevOps Consulting',
                        description: 'CI/CD pipeline implementation',
                        quantity: 16,
                        unitPrice: 180.00,
                        taxRate: 0.10,
                        discount: 0,
                        discountPercentage: 0
                    }
                ],
                notes: 'Quote valid for 28 days from issue date.',
                terms: 'Payment terms to be negotiated upon acceptance.',
                discountType: 'percentage',
                discountValue: 10,
                subtotal: 7680.00,
                totalDiscount: 768.00,
                totalTax: 691.20,
                grandTotal: 7603.20,
                createdAt: new Date('2026-01-03'),
                updatedAt: new Date('2026-01-03')
            },
            {
                id: 'QUO-002',
                invoiceNumber: 'QUO-2026-0002',
                type: DocumentType.QUOTATION,
                clientId: 'CLT009',
                clientName: 'Alpha Consulting Group',
                issueDate: new Date('2026-01-06'),
                dueDate: new Date('2026-02-05'),
                validUntil: new Date('2026-02-05'),
                status: InvoiceStatus.DRAFT,
                lineItems: [
                    {
                        id: 'LI-007',
                        productId: 'PRD013',
                        productName: 'Brand Identity Package',
                        description: 'Complete brand redesign and guidelines',
                        quantity: 1,
                        unitPrice: 3500.00,
                        taxRate: 0.10,
                        discount: 0,
                        discountPercentage: 0
                    }
                ],
                notes: 'Includes logo design, color palette, typography, and brand guidelines.',
                terms: '50% deposit required upon acceptance, balance due upon completion.',
                discountType: 'fixed',
                discountValue: 0,
                subtotal: 3500.00,
                totalDiscount: 0,
                totalTax: 350.00,
                grandTotal: 3850.00,
                createdAt: new Date('2026-01-06'),
                updatedAt: new Date('2026-01-06')
            }
        ];
    }
}
