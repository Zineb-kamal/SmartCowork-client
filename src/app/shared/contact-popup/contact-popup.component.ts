// src/app/shared/contact-popup/contact-popup.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PopupService } from '../../core/services/popup.service';
import { Subscription } from 'rxjs';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="popup-overlay" *ngIf="isVisible">
      <div class="popup-container">
        <div class="popup-header">
          <h3>{{ 'CONTACT.TITLE' | translate }}</h3>
          <button type="button" class="close-button" (click)="closePopup()" aria-label="Close">
            ×
          </button>
        </div>
        
        <div class="popup-content" *ngIf="!formSubmitted">
          <p class="popup-subtitle">{{ 'CONTACT.SUBTITLE' | translate }}</p>
          
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="name">{{ 'CONTACT.NAME' | translate }}</label>
              <input 
                type="text" 
                id="name" 
                formControlName="name" 
              >
              <div class="error-message" *ngIf="contactForm.get('name')?.invalid && contactForm.get('name')?.touched">
                {{ 'CONTACT.NAME_REQUIRED' | translate }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">{{ 'CONTACT.EMAIL' | translate }}</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
              >
              <div class="error-message" *ngIf="contactForm.get('email')?.invalid && contactForm.get('email')?.touched">
                <span *ngIf="contactForm.get('email')?.errors?.['required']">{{ 'CONTACT.EMAIL_REQUIRED' | translate }}</span>
                <span *ngIf="contactForm.get('email')?.errors?.['email']">{{ 'CONTACT.EMAIL_INVALID' | translate }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="phone">{{ 'CONTACT.PHONE' | translate }}</label>
              <input 
                type="tel" 
                id="phone" 
                formControlName="phone" 
              >
            </div>
            
            <div class="form-group">
              <label for="message">{{ 'CONTACT.MESSAGE' | translate }}</label>
              <textarea 
                id="message" 
                formControlName="message" 
                rows="4" 
              ></textarea>
              <div class="error-message" *ngIf="contactForm.get('message')?.invalid && contactForm.get('message')?.touched">
                {{ 'CONTACT.MESSAGE_REQUIRED' | translate }}
              </div>
            </div>
            
            <div class="form-error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
            
            <button type="submit" class="submit-button" [disabled]="isSubmitting">
              <span *ngIf="!isSubmitting">{{ 'CONTACT.SUBMIT' | translate }}</span>
              <span *ngIf="isSubmitting">{{ 'CONTACT.SENDING' | translate }}</span>
              <div class="spinner" *ngIf="isSubmitting"></div>
            </button>
          </form>
        </div>
        
        <div class="popup-content success-message" *ngIf="formSubmitted">
          <div class="success-icon">✓</div>
          <h4>{{ 'CONTACT.SUCCESS_TITLE' | translate }}</h4>
          <p>{{ 'CONTACT.SUCCESS_MESSAGE' | translate }}</p>
          <button type="button" class="close-success-btn" (click)="closePopup()">
            {{ 'CONTACT.CLOSE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .popup-container {
      background-color: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
      background-color: #2e7d32;
      color: white;
    }
    
    .popup-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }
    
    .popup-subtitle {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #555;
      font-size: 0.95rem;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      color: white;
    }
    
    .popup-content {
      padding: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1.25rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: #2e7d32;
      box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
    }
    
    .error-message {
      color: #f44336;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .submit-button {
      background-color: #2e7d32;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-top: 1rem;
      transition: background-color 0.2s;
    }
    
    .submit-button:hover {
      background-color: #205723;
    }
    
    .submit-button:disabled {
      background-color: #9e9e9e;
      cursor: not-allowed;
    }
    
    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
      margin-left: 8px;
    }
    
    .form-error-message {
      color: #f44336;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background-color: rgba(244, 67, 54, 0.1);
      border-radius: 4px;
    }
    
    .success-message {
      text-align: center;
      padding: 1rem 0;
    }
    
    .success-icon {
      width: 60px;
      height: 60px;
      background-color: #2e7d32;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1.5rem;
    }
    
    .close-success-btn {
      background-color: #2e7d32;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 1rem;
      transition: background-color 0.2s;
    }
    
    .close-success-btn:hover {
      background-color: #205723;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ContactPopupComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  isVisible = false;
  isSubmitting = false;
  formSubmitted = false;
  errorMessage: string | null = null;
  subscription: Subscription | null = null;
  
  // Service IDs EmailJS
  private readonly emailjsServiceId = 'service_ca03r2w';
  private readonly emailjsTemplateId = 'template_k2xgt1l';
  private readonly emailjsUserId = 'Uff050kVy27BIRWrs';
  
  constructor(
    private fb: FormBuilder,
    private popupService: PopupService,
    private translateService: TranslateService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['', Validators.required]
    });
    
    // Initialize EmailJS
    emailjs.init(this.emailjsUserId);
  }
  
  ngOnInit() {
    // Subscribe to visibility changes
    this.subscription = this.popupService.contactPopupVisible$.subscribe(visible => {
      console.log('ContactPopupComponent: Visibility changed to', visible);
      this.isVisible = visible;
      
      if (visible) {
        this.resetForm();
      }
    });
  }
  
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSubmit(): void {
    console.log('Form submitted');
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = null;
    
    // Préparation des paramètres pour EmailJS
    const templateParams = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone || 'Non fourni',
      message: this.contactForm.value.message
    };
    
    emailjs.send(
      this.emailjsServiceId, 
      this.emailjsTemplateId, 
      templateParams,
      this.emailjsUserId
    )
    .then((response) => {
      console.log('Email sent successfully:', response);
      this.isSubmitting = false;
      this.formSubmitted = true;
      this.saveToLocalStorage();
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      this.isSubmitting = false;
      
    
    });
  }
  
  saveToLocalStorage(): void {
    try {
      const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      submissions.push({
        ...this.contactForm.value,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    } catch (e) {
      console.error('Error saving form data to localStorage', e);
    }
  }
  
  resetForm(): void {
    this.contactForm.reset();
    this.formSubmitted = false;
    this.isSubmitting = false;
    this.errorMessage = null;
  }
  
  closePopup(): void {
    console.log('Close button clicked');
    this.popupService.hideContactPopup();
  }
}