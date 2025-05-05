// features/billing/invoice-details/invoice-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BillingService } from '../services/billing.service';
import { Invoice, InvoiceStatus } from '../../../core/models/billing.model';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserRole } from '../../../core/models/user.model';


@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss'],
  standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule]
})
export class InvoiceDetailsComponent implements OnInit {
  invoice: Invoice | any;
  loading = true;
  error: string | null = null;
  currentUserId: any;
  showNotification = false;
  notificationMessage: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUserValue;
    
    const id = this.route.snapshot.paramMap.get('id');
    const fromBooking = this.route.snapshot.queryParams['fromBooking'] === 'true';
    if (id) {
      this.loadInvoice(id);
    } else {
      this.error = 'ID de facture non spécifié';
      this.loading = false;
    }
  }

  loadInvoice(id: string,fromBooking: boolean = false): void {
    this.billingService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        
        // Vérifier si l'utilisateur a accès à cette facture
        if (!this.isAdmin() && invoice.userId !== this.currentUserId.user.id) {
          this.router.navigate(['/billing']);
          return;
        }
        
        this.loading = false;
        if (fromBooking) {
          this.showNotification = true;
          this.notificationMessage = "Votre réservation a été confirmée. Voici la facture associée.";
        }
      },
      error: (err) => {
        console.error('Error loading invoice', err);
        this.error = 'Impossible de charger la facture. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
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

  downloadPdf(): void {
    if (!this.invoice) return;
    
    this.billingService.generateInvoicePdf(this.invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${this.invoice?.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error downloading PDF', error);
        this.error = "Erreur lors du téléchargement du PDF.";
      }
    });
  }

  proceedToPayment(): void {
    if (this.invoice) {
      this.router.navigate(['/billing/payment', this.invoice.id]);
    }
  }

  cancelInvoice(): void {
    if (!this.invoice || !this.isAdmin) return;
    
    if (confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) {
      this.billingService.cancelInvoice(this.invoice.id).subscribe({
        next: () => {
          if (this.invoice) {
            this.invoice.status = InvoiceStatus.Cancelled;
          }
        },
        error: (err) => {
          console.error('Error cancelling invoice', err);
          this.error = "Erreur lors de l'annulation de la facture.";
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/billing']);
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