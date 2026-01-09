import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Header Component
 * Main navigation bar for the application
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="app-header">
      <button mat-icon-button class="menu-icon">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="app-title">Invoice System</span>
      <span class="spacer"></span>
      <nav class="nav-links">
        <a mat-button routerLink="/invoices" routerLinkActive="active-link">
          <mat-icon>receipt</mat-icon>
          Invoices
        </a>
        <a mat-button routerLink="/quotations" routerLinkActive="active-link">
          <mat-icon>description</mat-icon>
          Quotations
        </a>
        <a mat-button routerLink="/clients" routerLinkActive="active-link">
          <mat-icon>people</mat-icon>
          Clients
        </a>
        <a mat-button routerLink="/products" routerLinkActive="active-link">
          <mat-icon>inventory</mat-icon>
          Products
        </a>
      </nav>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: 500;
      margin-left: 8px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .nav-links {
      display: flex;
      gap: 8px;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .active-link {
      background-color: rgba(255, 255, 255, 0.15);
    }

    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
    }
  `]
})
export class HeaderComponent { }
