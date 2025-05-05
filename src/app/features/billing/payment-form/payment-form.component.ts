// features/billing/payment-form/payment-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BillingService } from '../services/billing.service';
import { PaymentService, CreatePaymentRequest } from '../services/payment.service';
import { Invoice, PaymentMethod } from '../../../core/models/billing.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
   standalone: true,
     imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule]
})
export class PaymentFormComponent implements OnInit {
  invoice: Invoice | any;
  paymentForm: FormGroup;
  loading = true;
  processing = false;
  error: string | null = null;
  success = false;

// Dans payment-form.component.ts, modifiez le tableau paymentMethods:
paymentMethods = [
  { 
    value: PaymentMethod.CreditCard, 
    label: 'Carte de crédit', 
    logos: [
      { src: 'assets/images/visa.png', alt: 'Visa' },
      { src: 'assets/images/mastercard.png', alt: 'Mastercard' }
    ]
  },
  { 
    value: PaymentMethod.BankTransfer, 
    label: 'Virement bancaire', 
    logos: [
      { src: 'assets/images/virement-bancaire.png', alt: 'Virement bancaire' }
    ]
  },
  { 
    value: PaymentMethod.PayPal, 
    label: 'PayPal', 
    logos: [
      { src: 'assets/images/paypal.png', alt: 'PayPal' }
    ]
  }
];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private billingService: BillingService,
    private paymentService: PaymentService
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: [PaymentMethod.CreditCard, Validators.required],
      amount: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0.01)]],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/[0-9]{2}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      nameOnCard: ['', Validators.required],
      saveCard: [false]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(id);
    } else {
      this.error = 'ID de facture non spécifié';
      this.loading = false;
    }
  }

  loadInvoice(id: string): void {
    this.billingService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        
        if (invoice.status !== 'Pending') {
          this.error = 'Cette facture n\'est pas en attente de paiement';
          this.loading = false;
          return;
        }
        
        // Pré-remplir le montant
        this.paymentForm.patchValue({
          amount: invoice.totalAmount
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading invoice', err);
        this.error = 'Impossible de charger la facture. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || !this.invoice) {
      return;
    }
    
    this.processing = true;
    const paymentMethod = this.paymentForm.get('paymentMethod')?.value;
    
    const paymentRequest: CreatePaymentRequest = {
      invoiceId: this.invoice.id,
      amount: this.invoice.totalAmount,
      paymentMethod: paymentMethod,
      referenceNumber: this.generateReferenceNumber()
    };
    
    // Ajouter les détails de la carte si paiement par carte
    if (paymentMethod === PaymentMethod.CreditCard) {
      paymentRequest.cardDetails = {
        cardNumber: this.paymentForm.get('cardNumber')?.value,
        expiryDate: this.paymentForm.get('expiryDate')?.value,
        cvv: this.paymentForm.get('cvv')?.value,
        nameOnCard: this.paymentForm.get('nameOnCard')?.value
      };
    }
    
    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (transaction) => {
        this.processing = false;
        this.success = true;
        
        // Rediriger vers la page de détails de la facture après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/billing/invoice', this.invoice?.id]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error processing payment', err);
        this.error = 'Erreur lors du traitement du paiement. Veuillez réessayer.';
        this.processing = false;
      }
    });
  }

  generateReferenceNumber(): string {
    return 'REF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  onPaymentMethodChange(): void {
    const paymentMethod = this.paymentForm.get('paymentMethod')?.value;
    
    if (paymentMethod === PaymentMethod.CreditCard) {
      this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern('^[0-9]{16}$')]);
      this.paymentForm.get('expiryDate')?.setValidators([Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/[0-9]{2}$')]);
      this.paymentForm.get('cvv')?.setValidators([Validators.required, Validators.pattern('^[0-9]{3,4}$')]);
      this.paymentForm.get('nameOnCard')?.setValidators([Validators.required]);
    } else {
      this.paymentForm.get('cardNumber')?.clearValidators();
      this.paymentForm.get('expiryDate')?.clearValidators();
      this.paymentForm.get('cvv')?.clearValidators();
      this.paymentForm.get('nameOnCard')?.clearValidators();
    }
    
    this.paymentForm.get('cardNumber')?.updateValueAndValidity();
    this.paymentForm.get('expiryDate')?.updateValueAndValidity();
    this.paymentForm.get('cvv')?.updateValueAndValidity();
    this.paymentForm.get('nameOnCard')?.updateValueAndValidity();
  }

  goBack(): void {
    this.router.navigate(['/billing/invoice', this.invoice?.id]);
  }
}