// src/app/features/booking/booking-edit/booking-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { SpacesService } from '../../../core/services/space.service';
import { BookingUpdateDto, BookingStatus } from '../../../core/models/booking.model'; // Ajout de BookingStatus
import { SpaceStatus } from '../../../core/models/space.model';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-booking-edit',
  templateUrl: './booking-edit.component.html',
  styleUrls: ['./booking-edit.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule]
})
export class BookingEditComponent implements OnInit {
  bookingForm!: FormGroup;
  spaces: any[] = [];
  loading = false;
  isAvailable = true;
  availabilityChecked = false;
  error: string | null = null;
  success: string | null = null;
  currentUser: any;
  bookingId: string = '';
  originalBooking: any = null;
  spaceName: string = '';
  
  // Ajout des statuts pour le sélecteur
  bookingStatuses = [
    { value: BookingStatus.Pending, label: 'booking.status.pending' },
    { value: BookingStatus.Confirmed, label: 'booking.status.confirmed' },
    { value: BookingStatus.Cancelled, label: 'booking.status.cancelled' },
    { value: BookingStatus.Completed, label: 'booking.status.completed' }
  ];
  
  // Déterminer si l'utilisateur peut modifier le statut
  get canChangeStatus(): boolean {
    return this.isAdmin() || this.isStaff();
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private spaceService: SpacesService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Initialiser le formulaire vide
    this.initForm();
    
    // Charger la liste des espaces disponibles
    this.loadSpaces();
    
    // Récupérer l'ID de la réservation depuis l'URL
    this.route.params.subscribe(params => {
      this.bookingId = params['id'];
      if (this.bookingId) {
        this.loadBookingDetails(this.bookingId);
      } else {
        this.error = this.translate.instant('booking.edit.errorNoId');
      }
    });
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      spaceId: [{value: '', disabled: true}, Validators.required], // Désactivé car on ne peut pas changer l'espace
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      status: [null] // Ajout du champ statut
    });
  }

  loadSpaces(): void {
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces) => {
        this.spaces = spaces.filter(space => space.status === SpaceStatus.Available);
      },
      error: (err) => {
        console.error('Error loading spaces', err);
        this.error = this.translate.instant('booking.edit.errorLoadingSpaces');
      }
    });
  }

  loadBookingDetails(id: string): void {
    this.loading = true;
    
    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.originalBooking = booking;
        
        if(this.isAdmin() || this.isStaff() || booking.userId == this.currentUser.user.id)
          this.loadSpaceDetails(booking.spaceId);
        else
          this.router.navigate(['/booking']);
          
        // Remplir le formulaire avec les données existantes
        this.populateForm(booking);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading booking details', err);
        this.error = this.translate.instant('booking.edit.errorLoadingBooking');
        this.loading = false;
      }
    });
  }

  loadSpaceDetails(spaceId: string): void {
    this.spaceService.getSpaceById(spaceId).subscribe({
      next: (space) => {
        this.spaceName = space?.name || 'Espace inconnu';
      },
      error: () => {
        this.spaceName = 'Espace inconnu';
      }
    });
  }

  populateForm(booking: any): void {
    // Convertir les dates ISO en objets Date
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    // Formater les dates pour les champs de formulaire
    const startDateStr = this.formatDateForInput(startDate);
    const startTimeStr = this.formatTimeForInput(startDate);
    const endDateStr = this.formatDateForInput(endDate);
    const endTimeStr = this.formatTimeForInput(endDate);
    
    // Mettre à jour le formulaire
    this.bookingForm.patchValue({
      spaceId: booking.spaceId,
      startDate: startDateStr,
      startTime: startTimeStr,
      endDate: endDateStr,
      endTime: endTimeStr,
      status: booking.status // Ajout du statut
    });
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  formatTimeForInput(date: Date): string {
    return date.getHours().toString().padStart(2, '0') + ':' + 
           date.getMinutes().toString().padStart(2, '0'); // Format HH:MM
  }

  checkAvailability(): void {
    this.clearMessages();
    
    if (this.validateDateTimes()) {
      const spaceId = this.originalBooking.spaceId;
      const startTime = this.getStartDateTime();
      const endTime = this.getEndDateTime();
      
      this.loading = true;
      
      // Pour la vérification de disponibilité lors de la mise à jour, nous devons exclure la réservation actuelle
      this.bookingService.checkAvailabilityExcluding(spaceId, startTime, endTime, this.bookingId).subscribe({
        next: (available) => {
          this.loading = false;
          this.isAvailable = available;
          this.availabilityChecked = true;
          
          if (available) {
            this.success = this.translate.instant('booking.edit.availableSuccess');
          } else {
            this.error = this.translate.instant('booking.edit.notAvailable');
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = this.translate.instant('booking.edit.errorCheckingAvailability');
          console.error('Error checking availability', err);
        }
      });
    }
  }

  onSubmit(): void {
    this.clearMessages();
    
    if (this.bookingForm.invalid) {
      this.markFormGroupTouched(this.bookingForm);
      this.error = this.translate.instant('booking.edit.fillAllFields');
      return;
    }
    
    // Vérifier la disponibilité seulement si les dates ont été modifiées
    const datesChanged = this.areDatesChanged();
    
    if (datesChanged && !this.availabilityChecked) {
      this.error = this.translate.instant('booking.edit.checkAvailabilityFirst');
      return;
    }
    
    if (datesChanged && !this.isAvailable) {
      this.error = this.translate.instant('booking.edit.notAvailable');
      return;
    }
    
    // L'ID DOIT être inclus dans l'objet DTO et correspondre à l'ID dans l'URL
    const booking: BookingUpdateDto = {
      id: this.bookingId,  // IMPORTANT: cette propriété doit être présente et correspondre à l'ID dans l'URL
      startTime: this.getStartDateTime().toISOString(),
      endTime: this.getEndDateTime().toISOString(),
      spaceId: this.originalBooking.spaceId
    };
    
    // Ajouter le statut seulement si l'utilisateur a le droit de le modifier
    if (this.canChangeStatus && this.bookingForm.get('status')?.value !== null) {
      const statusValue = this.bookingForm.get('status')?.value;
    
      if (typeof statusValue === 'string') {
        switch (statusValue) {
          case 'Pending':
          case '0': 
            booking.status = BookingStatus.Pending; 
            break;
          case 'Confirmed': 
          case '1': 
            booking.status = BookingStatus.Confirmed; 
            break;
          case 'Cancelled': 
          case '2': 
            booking.status = BookingStatus.Cancelled; 
            break;
          case 'Completed': 
          case '3': 
            booking.status = BookingStatus.Completed; 
            break;
        }
      } else if (typeof statusValue === 'number') {
        booking.status = statusValue as BookingStatus;
      }
    }
    console.log('Données envoyées pour mise à jour:', booking); // Log pour déboguer
    
    this.loading = true;
    this.bookingService.updateBooking(this.bookingId, booking).subscribe({
      next: () => {
        this.loading = false;
        this.success = this.translate.instant('booking.edit.updateSuccess');
        
        // Redirection après un court délai
        setTimeout(() => {
          this.router.navigate(['/booking']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = this.translate.instant('booking.edit.errorUpdating');
        console.error('Error updating booking', err);
        
        // Ajouter plus de détails sur l'erreur
        if (err.error && typeof err.error === 'string') {
          this.error += ': ' + err.error;
        }
      }
    });
  }
  // Nouvelle méthode pour vérifier si les dates ont été modifiées
  areDatesChanged(): boolean {
    if (!this.originalBooking) return false;
    
    const originalStart = new Date(this.originalBooking.startTime);
    const originalEnd = new Date(this.originalBooking.endTime);
    
    const newStart = this.getStartDateTime();
    const newEnd = this.getEndDateTime();
    
    return originalStart.getTime() !== newStart.getTime() || 
           originalEnd.getTime() !== newEnd.getTime();
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
    if (!this.bookingForm.get('startDate')!.value ||
        !this.bookingForm.get('startTime')!.value ||
        !this.bookingForm.get('endDate')!.value ||
        !this.bookingForm.get('endTime')!.value) {
      this.error = this.translate.instant('booking.edit.fillAllDateFields');
      return false;
    }
    
    const startDateTime = this.getStartDateTime();
    const endDateTime = this.getEndDateTime();
    
    if (startDateTime >= endDateTime) {
      this.error = this.translate.instant('booking.edit.endAfterStart');
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

  goBack(): void {
    this.router.navigate(['/booking']);
  }
  
  isAdmin(): boolean {
    const currentUserResponse = this.authService.currentUserValue;
    return !!currentUserResponse && currentUserResponse.user.role === UserRole.Admin;
  }
  
  isStaff(): boolean {
    const currentUserResponse = this.authService.currentUserValue;
    return !!currentUserResponse && currentUserResponse.user.role === UserRole.Staff;
  }
  
  // Obtenir la classe CSS pour un statut spécifique
  getStatusClass(status: any): string {
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'status-pending';
        case 1: return 'status-confirmed';
        case 2: return 'status-cancelled';
        case 3: return 'status-completed';
        default: return '';
      }
    } else if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return 'status-pending';
        case 'Confirmed': return 'status-confirmed';
        case 'Cancelled': return 'status-cancelled';
        case 'Completed': return 'status-completed';
        default: return '';
      }
    }
    return '';
  }
}