import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

/**
 * Client List Component
 * Displays all clients in a Material table with search functionality
 */
@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="client-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h1>Clients</h1>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="search-bar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search clients</mat-label>
              <input
                matInput
                type="text"
                placeholder="Search by name or email..."
                (input)="onSearch($event)"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="filteredClients()" class="clients-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let client">{{ client.id }}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let client">{{ client.name }}</td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let client">{{ client.email }}</td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let client">{{ client.phone }}</td>
              </ng-container>

              <!-- City Column -->
              <ng-container matColumnDef="city">
                <th mat-header-cell *matHeaderCellDef>City</th>
                <td mat-cell *matCellDef="let client">{{ client.address.city }}</td>
              </ng-container>

              <!-- Country Column -->
              <ng-container matColumnDef="country">
                <th mat-header-cell *matHeaderCellDef>Country</th>
                <td mat-cell *matCellDef="let client">{{ client.address.country }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <div class="total-count">
            Total Clients: {{ filteredClients().length }}
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .client-list-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
    }

    .search-bar {
      margin-bottom: 24px;
    }

    .search-field {
      width: 100%;
      max-width: 500px;
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .clients-table {
      width: 100%;
      background: white;
    }

    .total-count {
      padding: 8px 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9rem;
    }

    th.mat-header-cell {
      font-weight: 600;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .table-container {
        overflow-x: scroll;
      }
    }
  `]
})
export class ClientListComponent {
  private clientService = inject(ClientService);

  // Access clients from service (read-only signal)
  clients = this.clientService.clients;

  // Local signal for filtered results
  filteredClients = signal<Client[]>(this.clients());

  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'city', 'country'];

  /**
   * Handle search input
   */
  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.trim()) {
      this.filteredClients.set(this.clientService.searchClients(query));
    } else {
      this.filteredClients.set(this.clients());
    }
  }
}
