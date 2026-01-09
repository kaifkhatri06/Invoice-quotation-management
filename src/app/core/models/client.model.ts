/**
 * Client Model
 * Represents a client/customer in the invoice system
 */
export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: Address;
    taxId?: string;
    createdAt: Date;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
