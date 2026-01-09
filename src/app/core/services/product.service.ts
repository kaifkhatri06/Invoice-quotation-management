import { Injectable, signal, computed } from '@angular/core';
import { Product, ProductCategory } from '../models/product.model';

/**
 * Product Service
 * Manages product/service catalog using Angular Signals
 */
@Injectable({
    providedIn: 'root'
})
export class ProductService {
    // Signal for products list
    private productsSignal = signal<Product[]>(this.getMockProducts());

    // Public computed signal (read-only)
    public products = this.productsSignal.asReadonly();

    // Computed signal for products grouped by category
    public productsByCategory = computed(() => {
        const products = this.productsSignal();
        const grouped = new Map<ProductCategory, Product[]>();

        products.forEach(product => {
            const category = product.category;
            if (!grouped.has(category)) {
                grouped.set(category, []);
            }
            grouped.get(category)!.push(product);
        });

        return grouped;
    });

    /**
     * Get a product by ID
     */
    getProductById(id: string): Product | undefined {
        return this.productsSignal().find(product => product.id === id);
    }

    /**
     * Filter products by category
     */
    getProductsByCategory(category: ProductCategory): Product[] {
        return this.productsSignal().filter(product => product.category === category);
    }

    /**
     * Search products by name or description
     */
    searchProducts(query: string): Product[] {
        const lowerQuery = query.toLowerCase();
        return this.productsSignal().filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.description.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Add a new product
     */
    addProduct(product: Product): void {
        this.productsSignal.update(products => [...products, product]);
    }

    /**
     * Update an existing product
     */
    updateProduct(id: string, updates: Partial<Product>): void {
        this.productsSignal.update(products =>
            products.map(product =>
                product.id === id ? { ...product, ...updates } : product
            )
        );
    }

    /**
     * Delete a product
     */
    deleteProduct(id: string): void {
        this.productsSignal.update(products =>
            products.filter(product => product.id !== id)
        );
    }

    /**
     * Mock product data for demonstration
     */
    private getMockProducts(): Product[] {
        return [
            // Services
            {
                id: 'PRD001',
                name: 'Web Development - Standard',
                description: 'Professional web development services for standard projects',
                price: 125.00,
                category: ProductCategory.SERVICE,
                taxRate: 0.10,
                unit: 'hour'
            },
            {
                id: 'PRD002',
                name: 'Web Development - Premium',
                description: 'Premium web development for complex applications',
                price: 175.00,
                category: ProductCategory.SERVICE,
                taxRate: 0.10,
                unit: 'hour'
            },
            {
                id: 'PRD003',
                name: 'Mobile App Development',
                description: 'Native iOS and Android application development',
                price: 150.00,
                category: ProductCategory.SERVICE,
                taxRate: 0.10,
                unit: 'hour'
            },
            {
                id: 'PRD004',
                name: 'API Integration',
                description: 'Third-party API integration and custom API development',
                price: 135.00,
                category: ProductCategory.SERVICE,
                taxRate: 0.10,
                unit: 'hour'
            },

            // Consulting
            {
                id: 'PRD005',
                name: 'Technical Consulting',
                description: 'Expert technical consulting and architecture planning',
                price: 200.00,
                category: ProductCategory.CONSULTING,
                taxRate: 0.10,
                unit: 'hour'
            },
            {
                id: 'PRD006',
                name: 'Business Analysis',
                description: 'Business requirements analysis and process optimization',
                price: 165.00,
                category: ProductCategory.CONSULTING,
                taxRate: 0.10,
                unit: 'hour'
            },
            {
                id: 'PRD007',
                name: 'DevOps Consulting',
                description: 'CI/CD setup, cloud infrastructure, and deployment strategies',
                price: 180.00,
                category: ProductCategory.CONSULTING,
                taxRate: 0.10,
                unit: 'hour'
            },

            // Software
            {
                id: 'PRD008',
                name: 'CMS License - Basic',
                description: 'Basic content management system license (annual)',
                price: 499.00,
                category: ProductCategory.SOFTWARE,
                taxRate: 0.08,
                unit: 'license'
            },
            {
                id: 'PRD009',
                name: 'CMS License - Enterprise',
                description: 'Enterprise content management system with advanced features',
                price: 1999.00,
                category: ProductCategory.SOFTWARE,
                taxRate: 0.08,
                unit: 'license'
            },
            {
                id: 'PRD010',
                name: 'Analytics Platform',
                description: 'Business intelligence and analytics platform subscription',
                price: 299.00,
                category: ProductCategory.SOFTWARE,
                taxRate: 0.08,
                unit: 'month'
            },
            {
                id: 'PRD011',
                name: 'Project Management Tool',
                description: 'Collaborative project management software suite',
                price: 49.00,
                category: ProductCategory.SOFTWARE,
                taxRate: 0.08,
                unit: 'user/month'
            },

            // Design
            {
                id: 'PRD012',
                name: 'UI/UX Design',
                description: 'User interface and experience design services',
                price: 140.00,
                category: ProductCategory.DESIGN,
                taxRate: 0.10,
                unit: 'hour'
            },
            {
                id: 'PRD013',
                name: 'Brand Identity Package',
                description: 'Complete brand identity including logo, colors, and guidelines',
                price: 3500.00,
                category: ProductCategory.DESIGN,
                taxRate: 0.10,
                unit: 'project'
            },
            {
                id: 'PRD014',
                name: 'Graphic Design',
                description: 'Custom graphics, illustrations, and visual content',
                price: 95.00,
                category: ProductCategory.DESIGN,
                taxRate: 0.10,
                unit: 'hour'
            },

            // Marketing
            {
                id: 'PRD015',
                name: 'SEO Optimization',
                description: 'Search engine optimization and content strategy',
                price: 120.00,
                category: ProductCategory.MARKETING,
                taxRate: 0.10,
                unit: 'hour'
            },
            {
                id: 'PRD016',
                name: 'Social Media Management',
                description: 'Social media strategy and content management',
                price: 850.00,
                category: ProductCategory.MARKETING,
                taxRate: 0.10,
                unit: 'month'
            },
            {
                id: 'PRD017',
                name: 'Email Campaign',
                description: 'Email marketing campaign design and execution',
                price: 450.00,
                category: ProductCategory.MARKETING,
                taxRate: 0.10,
                unit: 'campaign'
            },

            // Hardware
            {
                id: 'PRD018',
                name: 'Enterprise Server',
                description: 'High-performance rack-mounted server',
                price: 4500.00,
                category: ProductCategory.HARDWARE,
                taxRate: 0.08,
                unit: 'unit'
            },
            {
                id: 'PRD019',
                name: 'Development Workstation',
                description: 'Professional developer workstation with high-end specs',
                price: 2800.00,
                category: ProductCategory.HARDWARE,
                taxRate: 0.08,
                unit: 'unit'
            },
            {
                id: 'PRD020',
                name: 'Network Equipment',
                description: 'Enterprise-grade networking hardware and switches',
                price: 1200.00,
                category: ProductCategory.HARDWARE,
                taxRate: 0.08,
                unit: 'unit'
            },

            // Other
            {
                id: 'PRD021',
                name: 'Training Session',
                description: 'Technical training and knowledge transfer session',
                price: 350.00,
                category: ProductCategory.OTHER,
                taxRate: 0.10,
                unit: 'session'
            },
            {
                id: 'PRD022',
                name: 'Maintenance Package',
                description: 'Monthly website/application maintenance and support',
                price: 750.00,
                category: ProductCategory.OTHER,
                taxRate: 0.10,
                unit: 'month'
            }
        ];
    }
}
