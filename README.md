# Angular 19+ Invoice & Quotation Management System

**Enterprise-grade invoice and quotation management application** built with Angular 19+ standalone components, Signals, and Angular Material.

## 🎯 Project Highlights

- ✅ **Angular 19+** with standalone components (NO NgModules)
- ✅ **Angular Signals** for reactive state management
- ✅ **Angular Material** for professional UI
- ✅ **Reactive Forms** with complex validation
- ✅ **Lazy-loaded routes** for optimal performance
- ✅ **TypeScript** with strong typing
- ✅ **SOLID principles** and clean architecture
- ✅ **Enterprise-grade** code quality

## 📋 Features

### Core Functionality
1. ✅ **Client Selection** - Manage clients with search
2. ✅ **Product/Service Catalog** - 22 products across 7 categories
3. ✅ **Line Item Management** - Add/edit/remove with real-time calculations
4. ✅ **Tax Calculation** - Per line item and invoice totals
5. ✅ **Discount Handling** - Percentage and fixed discounts
6. ✅ **Invoice Preview** - Professional formatted display
7. ✅ **Printable Invoices** - Print-optimized layout
8. ✅ **Quote to Invoice** - One-click conversion
9. ✅ **Status Tracking** - Draft, Sent, Paid, Overdue, Cancelled
10. ✅ **Currency Formatting** - Custom pipe with thousand separators

### Technical Features
- **Real-time calculations** using computed signals
- **Dynamic form arrays** for line items
- **Product auto-fill** when selected
- **Responsive design** for all screen sizes
- **Status filtering** on invoice list
- **Category filtering** on product catalog
- **Print CSS** for professional invoice printing

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+ or 20+
npm 9+ or 10+
Angular CLI 19+
```

### Installation

```bash
# Navigate to project directory
cd angular-invoice-system

# Install dependencies
npm install

# Run development server
ng serve --port 4201

# Open browser to
http://localhost:4201
```

### Build for Production

```bash
ng build --configuration production
```

## 📁 Project Structure

```
src/app/
├── core/                    # Core business logic
│   ├── models/             # TypeScript interfaces
│   ├── services/           # Business services with Signals
│   └── pipes/              # Custom pipes
├── features/               # Feature modules (lazy-loaded)
│   ├── clients/           # Client management
│   ├── products/          # Product catalog
│   ├── invoices/          # Invoice CRUD
│   └── quotations/        # Quotation CRUD
├── shared/                # Shared components
│   ├── components/        # Reusable UI components
│   └── material.imports.ts # Material module exports
└── app.routes.ts          # Routing configuration
```

## 💼 Business Logic

### Invoice Calculation Engine

The application implements sophisticated calculation logic:

**Line Item Calculation:**
```
1. Subtotal = quantity × unitPrice
2. Discount = subtotal × (discountPercentage / 100)
3. Taxable Amount = subtotal - discount
4. Tax = taxableAmount × taxRate
5. Line Total = taxableAmount + tax
```

**Invoice Totals:**
- Aggregates all line item calculations
- Supports percentage and fixed discounts
- Real-time updates using Angular Signals

## 🎨 Components Overview

| Component | Description | Key Features |
|-----------|-------------|--------------|
| **Invoice List** | Display all invoices | Filtering, status chips, actions menu |
| **Invoice Form** | Create/edit invoices | Reactive forms, dynamic line items, validation |
| **Invoice Preview** | Formatted invoice view | Professional layout, totals breakdown |
| **Invoice Print** | Print layout | Print CSS, optimized formatting |
| **Quotation List** | Display quotations | Convert to invoice action |
| **Quotation Form** | Create/edit quotes | Similar to invoice with validity period |
| **Client List** | Client management | Search, Material table |
| **Product Catalog** | Product browsing | Category filter, grid layout |

## 📦 Mock Data

The application includes realistic mock data:

- **10 Clients** - Global companies with full address details
- **22 Products** - Across 7 categories (Services, Consulting, Software, Hardware, Design, Marketing, Other)
- **3 Sample Invoices** - With various statuses
- **2 Sample Quotations** - Including one ready for conversion

## 🧪 Testing Checklist

- ✅ Navigation between all routes
- ✅ Client search and filtering
- ✅ Product category filtering
- ✅ Invoice creation with line items
- ✅ Real-time calculation updates
- ✅ Tax and discount application
- ✅ Invoice status management
- ✅ Quote to invoice conversion
- ✅ Print layout functionality
- ✅ Responsive design on mobile

## 🏆 Code Quality

### Best Practices Implemented
- **Standalone Components**: Modern Angular architecture
- **Dependency Injection**: Using `inject()` function
- **Strong Typing**: Comprehensive TypeScript interfaces
- **Separation of Concerns**: Models, Services, Components, Pipes
- **Reactive State**: Angular Signals throughout
- **Form Validation**: Reactive forms with validators
- **Lazy Loading**: All feature routes
- **Comments**: Meaningful comments on complex logic

### SOLID Principles
- **Single Responsibility**: Each service/component has one purpose
- **Open/Closed**: Extensible without modification
- **Liskov Substitution**: Interface implementations
- **Interface Segregation**: Focused interfaces
- **Dependency Inversion**: Depend on abstractions

## 👨‍💻 Technical Stack

```json
{
  "framework": "Angular 19.x",
  "ui": "Angular Material 21.x",
  "state": "Angular Signals",
  "forms": "Reactive Forms",
  "routing": "Lazy Loading",
  "styling": "SCSS + Material Theme",
  "language": "TypeScript 5.x",
  "architecture": "Standalone Components"
}
```

---

**Built with ❤️ using Angular 19+**
