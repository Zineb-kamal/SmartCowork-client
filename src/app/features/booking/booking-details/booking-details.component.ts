// src/app/features/booking/booking-details/booking-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { SpacesService } from '../../../core/services/space.service';
import { AuthService } from '../../../core/services/auth.service';
import { Booking } from '../../../core/models/booking.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule]
})
export class BookingDetailsComponent implements OnInit {
  booking: Booking | null = null;
  space: any = null;
  loading = true;
  error: string | null = null;
  currentUser: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private spaceService: SpacesService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.route.params.subscribe(params => {
      const bookingId = params['id'];
      if (bookingId) {
        this.loadBookingDetails(bookingId);
      } else {
        this.error = this.translate.instant('booking.details.errorNoId');
        this.loading = false;
      }
    });
  }

  loadBookingDetails(id: string): void {
    this.loading = true;
    
    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.booking = booking;
        
        // // Vérifier l'autorisation
        // if (this.currentUser.user.role !== this.isAdmin() && 
        //     this.currentUser.user.role !== this.isStaff() && 
        //     booking.userId !== this.currentUser.user.id) {
        //   this.router.navigate(['/booking']);
        //   return;
        // }
        
        // Charger les détails de l'espace
        if(this.isAdmin() || this.isStaff() ||  booking.userId == this.currentUser.user.id)
        this.loadSpaceDetails(booking.spaceId);
      else
      this.router.navigate(['/booking']);
      },
      error: (err) => {
        console.error('Error loading booking details', err);
        this.error = this.translate.instant('booking.details.errorLoading');
        this.loading = false;
      }
    });
  }

  loadSpaceDetails(spaceId: string): void {
    this.spaceService.getSpaceById(spaceId).subscribe({
      next: (space) => {
        this.space = space;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading space details', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/booking']);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR') + ' ' + 
           d.getHours().toString().padStart(2, '0') + ':' + 
           d.getMinutes().toString().padStart(2, '0');
  }

  formatPrice(price: number): string {
    return price.toFixed(2) + ' €';
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