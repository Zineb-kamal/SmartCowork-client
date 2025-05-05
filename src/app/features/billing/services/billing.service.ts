// features/billing/services/billing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Invoice } from '../../../core/models/billing.model';


@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}/invoice`;

  constructor(private http: HttpClient) { }

  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getUserInvoices(userId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/user/${userId}`);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  cancelInvoice(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { 
      id: id,
      status: 'Cancelled'
    });
  }

  getInvoicesByStatus(status: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/status/${status}`);
  }

  getOverdueInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/overdue`);
  }

  generateInvoicePdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

getInvoiceByBookingId(bookingId: string): Observable<Invoice> {
  return this.http.get<Invoice>(`${this.apiUrl}/booking/${bookingId}`);
}
}