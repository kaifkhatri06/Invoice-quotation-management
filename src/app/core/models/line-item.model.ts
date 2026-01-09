/**
 * Line Item Model
 * Represents a single line item in an invoice or quotation
 */
export interface LineItem {
    id: string;
    productId: string;
    productName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number; // Tax rate as decimal
    discount: number; // Discount amount (fixed value)
    discountPercentage: number; // Discount as percentage
}

/**
 * Calculated values for a line item
 */
export interface LineItemCalculation {
    subtotal: number; // quantity * unitPrice
    discountAmount: number; // Total discount applied
    taxableAmount: number; // subtotal - discount
    taxAmount: number; // taxableAmount * taxRate
    total: number; // taxableAmount + taxAmount
}
