import { Injectable, signal, computed } from '@angular/core';
import { Client } from '../models/client.model';

/**
 * Client Service
 * Manages client data using Angular Signals for reactive state management
 */
@Injectable({
    providedIn: 'root'
})
export class ClientService {
    // Signal for clients list
    private clientsSignal = signal<Client[]>(this.getMockClients());

    // Public computed signal (read-only)
    public clients = this.clientsSignal.asReadonly();

    /**
     * Get a client by ID
     */
    getClientById(id: string): Client | undefined {
        return this.clientsSignal().find(client => client.id === id);
    }

    /**
     * Add a new client
     */
    addClient(client: Client): void {
        this.clientsSignal.update(clients => [...clients, client]);
    }

    /**
     * Update an existing client
     */
    updateClient(id: string, updates: Partial<Client>): void {
        this.clientsSignal.update(clients =>
            clients.map(client =>
                client.id === id ? { ...client, ...updates } : client
            )
        );
    }

    /**
     * Delete a client
     */
    deleteClient(id: string): void {
        this.clientsSignal.update(clients =>
            clients.filter(client => client.id !== id)
        );
    }

    /**
     * Search clients by name or email
     */
    searchClients(query: string): Client[] {
        const lowerQuery = query.toLowerCase();
        return this.clientsSignal().filter(client =>
            client.name.toLowerCase().includes(lowerQuery) ||
            client.email.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Mock client data for demonstration
     */
    private getMockClients(): Client[] {
        return [
            {
                id: 'CLT001',
                name: 'Acme Corporation',
                email: 'contact@acmecorp.com',
                phone: '+1 (555) 123-4567',
                address: {
                    street: '123 Business Park Drive',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA'
                },
                taxId: 'US-123456789',
                createdAt: new Date('2024-01-15')
            },
            {
                id: 'CLT002',
                name: 'TechStart Inc.',
                email: 'billing@techstart.io',
                phone: '+1 (555) 234-5678',
                address: {
                    street: '456 Innovation Boulevard',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94102',
                    country: 'USA'
                },
                taxId: 'US-987654321',
                createdAt: new Date('2024-02-20')
            },
            {
                id: 'CLT003',
                name: 'Global Solutions Ltd',
                email: 'accounts@globalsolutions.com',
                phone: '+44 20 7946 0958',
                address: {
                    street: '789 Commerce Street',
                    city: 'London',
                    state: 'England',
                    zipCode: 'EC1A 1BB',
                    country: 'UK'
                },
                taxId: 'GB-111222333',
                createdAt: new Date('2024-03-10')
            },
            {
                id: 'CLT004',
                name: 'Sunrise Enterprises',
                email: 'info@sunrise-ent.com',
                phone: '+1 (555) 345-6789',
                address: {
                    street: '321 Sunset Avenue',
                    city: 'Miami',
                    state: 'FL',
                    zipCode: '33101',
                    country: 'USA'
                },
                createdAt: new Date('2024-04-05')
            },
            {
                id: 'CLT005',
                name: 'Digital Dynamics',
                email: 'support@digitaldynamics.net',
                phone: '+1 (555) 456-7890',
                address: {
                    street: '654 Tech Plaza',
                    city: 'Austin',
                    state: 'TX',
                    zipCode: '73301',
                    country: 'USA'
                },
                taxId: 'US-555666777',
                createdAt: new Date('2024-05-12')
            },
            {
                id: 'CLT006',
                name: 'Pacific Trading Co.',
                email: 'orders@pacifictrading.com',
                phone: '+1 (555) 567-8901',
                address: {
                    street: '987 Harbor Road',
                    city: 'Seattle',
                    state: 'WA',
                    zipCode: '98101',
                    country: 'USA'
                },
                taxId: 'US-888999000',
                createdAt: new Date('2024-06-01')
            },
            {
                id: 'CLT007',
                name: 'Metro Manufacturing',
                email: 'finance@metromanuf.com',
                phone: '+1 (555) 678-9012',
                address: {
                    street: '147 Industrial Way',
                    city: 'Chicago',
                    state: 'IL',
                    zipCode: '60601',
                    country: 'USA'
                },
                createdAt: new Date('2024-07-15')
            },
            {
                id: 'CLT008',
                name: 'European Ventures GmbH',
                email: 'contact@euroventures.de',
                phone: '+49 30 12345678',
                address: {
                    street: 'Hauptstraße 42',
                    city: 'Berlin',
                    state: 'Berlin',
                    zipCode: '10115',
                    country: 'Germany'
                },
                taxId: 'DE-123456789',
                createdAt: new Date('2024-08-20')
            },
            {
                id: 'CLT009',
                name: 'Alpha Consulting Group',
                email: 'hello@alphaconsulting.com',
                phone: '+1 (555) 789-0123',
                address: {
                    street: '258 Executive Lane',
                    city: 'Boston',
                    state: 'MA',
                    zipCode: '02101',
                    country: 'USA'
                },
                taxId: 'US-222333444',
                createdAt: new Date('2024-09-10')
            },
            {
                id: 'CLT010',
                name: 'Oceanic Systems',
                email: 'admin@oceanicsystems.au',
                phone: '+61 2 9876 5432',
                address: {
                    street: '369 Harbor View',
                    city: 'Sydney',
                    state: 'NSW',
                    zipCode: '2000',
                    country: 'Australia'
                },
                taxId: 'AU-987654321',
                createdAt: new Date('2024-10-01')
            }
        ];
    }
}
