// features/billing/invoice-list/invoice-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BillingService } from '../services/billing.service';
import { Invoice } from '../../../core/models/billing.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
    standalone: true,
     imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule ,TranslateModule]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  loading = true;
  currentUserId: any;
  selectedStatus: string = 'all';
  searchText: string = '';

  statusOptions = [
    { value: 'all', label: 'Toutes les factures' },
    { value: 'Pending', label: 'En attente' },
    { value: 'Paid', label: 'Payée' },
    { value: 'Cancelled', label: 'Annulée' },
    { value: 'Overdue', label: 'En retard' }
  ];

  constructor(
    private billingService: BillingService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUserValue;

    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    if (this.isAdmin()) {
      this.billingService.getAllInvoices().subscribe({
        next: (data) => {
          this.invoices = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading invoices', error);
          this.loading = false;
        }
      });
    } else {
      this.billingService.getUserInvoices(this.currentUserId.user.id).subscribe({
        next: (data) => {
          this.invoices = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading user invoices', error);
          this.loading = false;
        }
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.invoices];
    
    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === this.selectedStatus);
    }
    
    // Filter by search text
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.id.toLowerCase().includes(searchLower) ||
        invoice.userName?.toLowerCase().includes(searchLower) ||
        invoice.items.some(item => item.description.toLowerCase().includes(searchLower))
      );
    }
    
    this.filteredInvoices = filtered;
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  viewInvoice(id: string): void {
    this.router.navigate(['/billing/invoice', id]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Paid': return 'status-badge status-paid';
      case 'Pending': return 'status-badge status-pending';
      case 'Cancelled': return 'status-badge status-cancelled';
      case 'Overdue': return 'status-badge status-overdue';
      default: return 'status-badge';
    }
  }

  downloadPdf(id: string, event: Event): void {
    event.stopPropagation();
    this.billingService.generateInvoicePdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error downloading PDF', error);
      }
    });
  }
    isAdmin(): boolean {
      const currentUserResponse = this.authService.currentUserValue;
      return !!currentUserResponse && currentUserResponse.user.role === UserRole.Admin;
    }
    
    isStaff(): boolean {
      const currentUserResponse = this.authService.currentUserValue;
      return !!currentUserResponse && currentUserResponse.user.role === UserRole.Staff;
    }
}