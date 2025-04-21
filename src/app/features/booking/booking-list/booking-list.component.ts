// src/app/features/booking/booking-list/booking-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { BookingService } from '../../../core/services/booking.service';
import { SpacesService } from '../../../core/services/space.service';
import { TranslateModule } from '@ngx-translate/core';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule]
})
export class BookingListComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  // Définir les valeurs de l'énumération explicitement pour les utiliser dans le template
  bookingStatuses = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed'
  };
  currentUser: any;
  isAdminOrStaff = false;
  spaceNames: { [key: string]: string } = {};

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private spaceService: SpacesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    
    if (!this.currentUser) {
      this.error = "Vous devez être connecté pour voir vos réservations";
      this.loading = false;
      return;
    }
    
    if (!this.currentUser.user || !this.currentUser.user.id) {
      this.error = "Impossible d'identifier l'utilisateur";
      this.loading = false;
      return;
    }
    
    this.isAdminOrStaff = this.currentUser.user.role === 'Admin' || 
                        this.currentUser.user.role === 'Staff';
    
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    
    const loadFn = this.isAdmin() || this.isStaff()
      ? this.bookingService.getAllBookings()
      : this.bookingService.getBookingsByUser(this.currentUser.user.id);
    
    loadFn.subscribe({
      next: (data) => {
        // Stocker les réservations brutes
        const rawBookings = data;
        
        // Extraire tous les IDs d'espaces uniques
        const spaceIds = [...new Set(rawBookings.map(booking => booking.spaceId))];
        
        // Charger les informations d'espace pour tous les IDs
        this.loadSpaceNames(spaceIds, rawBookings);
      },
      error: (err) => {
        console.error('Error loading bookings', err);
        this.error = 'Erreur lors du chargement des réservations';
        this.loading = false;
      }
    });
  }

  loadSpaceNames(spaceIds: string[], rawBookings: Booking[]): void {
    // Créer un tableau de promesses
    const promises = spaceIds.map(id => 
      new Promise<void>((resolve) => {
        this.spaceService.getSpaceById(id).subscribe({
          next: (space) => {
            this.spaceNames[id] = space?.name || 'Espace inconnu';
            resolve();
          },
          error: () => {
            this.spaceNames[id] = 'Espace inconnu';
            resolve();
          }
        });
      })
    );
    
    // Attendre que toutes les promesses soient résolues
    Promise.all(promises)
      .then(() => {
        // Enrichir les réservations avec les noms d'espaces
        this.bookings = rawBookings.map(booking => ({
          ...booking,
          spaceName: this.spaceNames[booking.spaceId]
        }));
        
        this.filteredBookings = [...this.bookings];
        this.loading = false;
      });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = value;
    
    this.filteredBookings = this.bookings.filter(booking => 
      (booking.id?.toLowerCase().includes(value) || 
      booking.spaceName?.toLowerCase().includes(value))
    );
  }

  cancelBooking(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.bookingService.deleteBooking(id).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (err) => {
          console.error('Error cancelling booking', err);
          this.error = 'Erreur lors de l\'annulation de la réservation';
        }
      });
    }
  }

  // Cette méthode détermine si un statut est Pending ou Confirmed
  isActiveBooking(status: any): boolean {
    // Vérifier toutes les possibilités de valeur de statut
    return status === 'Pending' || 
           status === 'Confirmed' || 
           status === 0 || // Si Pending est 0
           status === 1;   // Si Confirmed est 1
  }

  // Méthode pour afficher le texte du statut
  getStatusText(status: any): string {
    // Vérifier d'abord si c'est une valeur numérique
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'En attente';
        case 1: return 'Confirmée';
        case 2: return 'Annulée';
        case 3: return 'Terminée';
        default: return 'Statut inconnu';
      }
    } else if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return 'En attente';
        case 'Confirmed': return 'Confirmée';
        case 'Cancelled': return 'Annulée';
        case 'Completed': return 'Terminée';
        default: return status;
      }
    }
    return 'Statut inconnu';
  }

  // Méthode pour obtenir la classe CSS du statut
  getStatusClass(status: any): string {
    // Vérifier d'abord si c'est une valeur numérique
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

  formatPrice(price: number): string {
    return price.toFixed(2) + ' €';
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR') + ' ' + 
           d.getHours().toString().padStart(2, '0') + ':' + 
           d.getMinutes().toString().padStart(2, '0');
  }

  isAdmin(): boolean {
    const currentUserResponse = this.authService.currentUserValue;
    return !!currentUserResponse && currentUserResponse.user.role === UserRole.Admin;
  }
  
  isStaff(): boolean {
    const currentUserResponse = this.authService.currentUserValue;
    return !!currentUserResponse && currentUserResponse.user.role === UserRole.Staff;
  }
  navigateToEdit(id: string): void {
    this.router.navigate(['/booking/edit', id]);
  }

}