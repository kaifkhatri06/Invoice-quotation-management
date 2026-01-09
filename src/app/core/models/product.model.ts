/**
 * Product Model
 * Represents a product or service that can be added to invoices
 */
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    taxRate: number; // Tax rate as decimal (e.g., 0.10 for 10%)
    unit: string; // e.g., 'hour', 'item', 'day'
}

export enum ProductCategory {
    SERVICE = 'Service',
    CONSULTING = 'Consulting',
    SOFTWARE = 'Software',
    HARDWARE = 'Hardware',
    MARKETING = 'Marketing',
    DESIGN = 'Design',
    OTHER = 'Other'
}
