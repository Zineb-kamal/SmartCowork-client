// features/billing/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaymentMethod, Transaction } from '../../../core/models/billing.model';


export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    nameOnCard: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) { }

  processPayment(payment: CreatePaymentRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, payment);
  }

  getUserTransactions(userId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}`);
  }

  getTransactionsByInvoice(invoiceId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/invoice/${invoiceId}`);
  }
}