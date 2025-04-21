// src/app/features/admin/admin-bookings/admin-bookings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BookingService } from '../../../core/services/booking.service';
import { SpacesService } from '../../../core/services/space.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule]
})
export class AdminBookingsComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  loading = true;
  error: string | null = null;
  success: string | null = null;
  searchTerm = '';
  
  // Maps pour stocker les noms d'espaces et d'utilisateurs
  spaceNames: { [key: string]: string } = {};
  userNames: { [key: string]: string } = {};
  
  // Filtres
  statusFilter = 'all';
  
  constructor(
    private bookingService: BookingService,
    private spaceService: SpacesService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.applyFilters();
        
        // Charger les noms d'espaces et d'utilisateurs
        this.loadSpaceNames();
        this.loadUserNames();
      },
      error: (err) => {
        console.error('Error loading bookings', err);
        this.error = 'Erreur lors du chargement des réservations';
        this.loading = false;
      }
    });
  }

  loadSpaceNames(): void {
    const spaceIds = [...new Set(this.bookings.map(booking => booking.spaceId))];
    
    spaceIds.forEach(id => {
      this.spaceService.getSpaceById(id).subscribe({
        next: (space) => {
          if (space) {
            this.spaceNames[id] = space.name;
            this.applyFilters(); // Mettre à jour l'affichage
          }
        },
        error: () => {
          this.spaceNames[id] = 'Espace inconnu';
        }
      });
    });
  }

  loadUserNames(): void {
    const userIds = [...new Set(this.bookings.map(booking => booking.userId))];
    
    userIds.forEach(id => {
      this.userService.getUserById(id).subscribe({
        next: (user) => {
          if (user) {
            this.userNames[id] = `${user.firstName} ${user.lastName}`;
            this.applyFilters(); // Mettre à jour l'affichage
          }
        },
        error: () => {
          this.userNames[id] = 'Utilisateur inconnu';
        }
      });
    });
    
    this.loading = false;
  }

  searchBookings(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.bookings];
    
    // Filtre par statut
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(booking => 
        booking.status === this.statusFilter || 
        booking.status === parseInt(this.statusFilter)
      );
    }
    
    // Filtre par recherche textuelle
    if (this.searchTerm) {
      const value = this.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        (this.spaceNames[booking.spaceId] || '').toLowerCase().includes(value) ||
        (this.userNames[booking.userId] || '').toLowerCase().includes(value) ||
        booking.id.toLowerCase().includes(value)
      );
    }
    
    this.filteredBookings = filtered;
  }

  confirmCancelBooking(booking: any): void {
    const spaceName = this.spaceNames[booking.spaceId] || 'Espace inconnu';
    const userName = this.userNames[booking.userId] || 'Utilisateur inconnu';
    
    if (confirm(`Êtes-vous sûr de vouloir annuler la réservation de ${spaceName} par ${userName} ?`)) {
      this.loading = true;
      
      this.bookingService.deleteBooking(booking.id).subscribe({
        next: () => {
          this.success = 'Réservation annulée avec succès';
          this.loading = false;
          this.loadBookings();
          
          // Réinitialiser le message de succès après 3 secondes
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error cancelling booking', err);
          this.error = 'Erreur lors de l\'annulation de la réservation';
          this.loading = false;
        }
      });
    }
  }

  getStatusText(status: any): string {
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
}