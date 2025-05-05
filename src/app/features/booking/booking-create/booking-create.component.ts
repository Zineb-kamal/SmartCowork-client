// src/app/features/booking/booking-create/booking-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SpacesService } from '../../../core/services/space.service';
import { BookingCreateDto } from '../../../core/models/booking.model';
import { TranslateModule } from '@ngx-translate/core';
import { SpaceStatus } from '../../../core/models/space.model';
import { BillingService } from '../../billing/services/billing.service';


@Component({
  selector: 'app-booking-create',
  templateUrl: './booking-create.component.html',
  styleUrls: ['./booking-create.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule]
})
export class BookingCreateComponent implements OnInit {
  bookingForm!: FormGroup;
  spaces: any[] = [];
  loading = false;
  isAvailable = false;
  availabilityChecked = false;
  error: string | null = null;
  success: string | null = null;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private billingService: BillingService,
    private spaceService: SpacesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.initForm();
    this.loadSpaces();
    this.route.queryParams.subscribe(params => {
      if (params['startDate'] && params['startTime'] && params['endDate'] && params['endTime']) {
        this.bookingForm.patchValue({
          startDate: params['startDate'],
          startTime: params['startTime'],
          endDate: params['endDate'],
          endTime: params['endTime']
        });
      }
    });
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      spaceId: ['', Validators.required],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  loadSpaces(): void {
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces) => {
        this.spaces = spaces.filter(space => space.status === SpaceStatus.Available);
      },
      error: (err) => {
        console.error('Error loading spaces', err);
        this.error = 'Erreur lors du chargement des espaces';
      }
    });
  }

  checkAvailability(): void {
    this.clearMessages();
    
    if (this.validateDateTimes()) {
      const spaceId = this.bookingForm.get('spaceId')!.value;
      const startTime = this.getStartDateTime();
      const endTime = this.getEndDateTime();
      
      this.loading = true;
      this.bookingService.checkAvailability(spaceId, startTime, endTime).subscribe({
        next: (available) => {
          this.loading = false;
          this.isAvailable = available;
          this.availabilityChecked = true;
          
          if (available) {
            this.success = 'L\'espace est disponible pour cette période!';
          } else {
            this.error = 'L\'espace n\'est pas disponible pour cette période';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Erreur lors de la vérification de disponibilité';
          console.error('Error checking availability', err);
        }
      });
    }
  }

  onSubmit(): void {
    this.clearMessages();
    
    if (this.bookingForm.invalid) {
      this.markFormGroupTouched(this.bookingForm);
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    
    if (!this.availabilityChecked) {
      this.error = 'Veuillez vérifier la disponibilité avant de réserver';
      return;
    }
    
    if (!this.isAvailable) {
      this.error = 'L\'espace n\'est pas disponible pour cette période';
      return;
    }
    
    const booking: BookingCreateDto = {
      userId: this.currentUser.user.id,
      spaceId: this.bookingForm.get('spaceId')!.value,
      startTime: this.getStartDateTime().toISOString(),
      endTime: this.getEndDateTime().toISOString()
    };
    
    this.loading = true;
    this.bookingService.createBooking(booking).subscribe({
      next: (createdBooking) => {
        this.success = 'Réservation créée avec succès!';
        
        // Attendre un moment pour laisser le temps au service de facturation de créer la facture
        setTimeout(() => {
          // Essayer de récupérer la facture associée à cette réservation
          this.billingService.getInvoiceByBookingId(createdBooking.id).subscribe({
            next: (invoice) => {
              this.loading = false;
              // Rediriger vers la page de détails de la facture
             // Dans la méthode onSubmit de booking-create.component.ts
this.router.navigate(['/billing/invoice', invoice.id], { queryParams: { fromBooking: 'true' } });
            },
            error: (err: any) => {
              console.error('Error finding invoice', err);
              this.loading = false;
              // En cas d'erreur, rediriger vers la liste des factures
              this.router.navigate(['/billing']);
            }
          });
        }, 2000); // Attendre 2 secondes pour donner le temps au traitement asynchrone
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors de la création de la réservation';
        console.error('Error creating booking', err);
      }
    });
  }

  // Méthodes utilitaires
  private getStartDateTime(): Date {
    return this.combineDateTime(
      this.bookingForm.get('startDate')!.value,
      this.bookingForm.get('startTime')!.value
    );
  }

  private getEndDateTime(): Date {
    return this.combineDateTime(
      this.bookingForm.get('endDate')!.value,
      this.bookingForm.get('endTime')!.value
    );
  }

  private combineDateTime(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  private validateDateTimes(): boolean {
    if (!this.bookingForm.get('spaceId')!.value ||
        !this.bookingForm.get('startDate')!.value ||
        !this.bookingForm.get('startTime')!.value ||
        !this.bookingForm.get('endDate')!.value ||
        !this.bookingForm.get('endTime')!.value) {
      this.error = 'Veuillez remplir tous les champs de date et heure';
      return false;
    }
    
    const startDateTime = this.getStartDateTime();
    const endDateTime = this.getEndDateTime();
    
    if (startDateTime >= endDateTime) {
      this.error = 'La date/heure de fin doit être postérieure à la date/heure de début';
      return false;
    }
    
    return true;
  }

  private clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}