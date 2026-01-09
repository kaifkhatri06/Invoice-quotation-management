import { Routes } from '@angular/router';

/**
 * Application routing configuration
 * All routes use lazy loading for optimal performance
 */
export const routes: Routes = [
    {
        path: '',
        redirectTo: '/invoices',
        pathMatch: 'full'
    },
    {
        path: 'invoices',
        loadComponent: () =>
            import('./features/invoices/invoice-list/invoice-list.component').then(
                (m) => m.InvoiceListComponent
            )
    },
    {
        path: 'invoices/new',
        loadComponent: () =>
            import('./features/invoices/invoice-form/invoice-form.component').then(
                (m) => m.InvoiceFormComponent
            )
    },
    {
        path: 'invoices/:id',
        loadComponent: () =>
            import('./features/invoices/invoice-preview/invoice-preview.component').then(
                (m) => m.InvoicePreviewComponent
            )
    },
    {
        path: 'invoices/:id/edit',
        loadComponent: () =>
            import('./features/invoices/invoice-form/invoice-form.component').then(
                (m) => m.InvoiceFormComponent
            )
    },
    {
        path: 'invoices/:id/print',
        loadComponent: () =>
            import('./features/invoices/invoice-print/invoice-print.component').then(
                (m) => m.InvoicePrintComponent
            )
    },
    {
        path: 'quotations',
        loadComponent: () =>
            import('./features/quotations/quotation-list/quotation-list.component').then(
                (m) => m.QuotationListComponent
            )
    },
    {
        path: 'quotations/new',
        loadComponent: () =>
            import('./features/quotations/quotation-form/quotation-form.component').then(
                (m) => m.QuotationFormComponent
            )
    },
    {
        path: 'quotations/:id',
        loadComponent: () =>
            import('./features/quotations/quotation-form/quotation-form.component').then(
                (m) => m.QuotationFormComponent
            )
    },
    {
        path: 'clients',
        loadComponent: () =>
            import('./features/clients/client-list/client-list.component').then(
                (m) => m.ClientListComponent
            )
    },
    {
        path: 'products',
        loadComponent: () =>
            import('./features/products/product-catalog/product-catalog.component').then(
                (m) => m.ProductCatalogComponent
            )
    },
    {
        path: '**',
        redirectTo: '/invoices'
    }
];
