// src/app/features/booking/booking-calendar/booking-calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Import FullCalendar et ses modules
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import enLocale from '@fullcalendar/core/locales/en-gb';

import { BookingService } from '../../../core/services/booking.service';
import { SpacesService } from '../../../core/services/space.service';
import { AuthService } from '../../../core/services/auth.service';
import { Booking, BookingStatus } from '../../../core/models/booking.model';

@Component({
  selector: 'app-booking-calendar',
  templateUrl: './booking-calendar.component.html',
  styleUrls: ['./booking-calendar.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule,
    FullCalendarModule
  ]
})
export class BookingCalendarComponent implements OnInit {
  // Initialiser calendarOptions avec des valeurs par défaut
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    events: [],
    height: 'auto'
  };
  
  events: EventInput[] = [];
  spaces: any[] = [];
  selectedSpaceId: string = 'all';
  loading = true;
  error: string | null = null;
  currentUser: any;
  currentLang: string;

  constructor(
    private bookingService: BookingService,
    private spaceService: SpacesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang || 'fr';
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Initialiser le calendrier avec toutes les options
    this.initializeCalendar();
    
    // Charger les espaces et les réservations
    this.loadSpaces();
  }

  initializeCalendar(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      locales: [frLocale, enLocale],
      locale: this.currentLang === 'fr' ? 'fr' : 'en-gb',
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      allDaySlot: false,
      slotMinTime: '07:00:00',
      slotMaxTime: '22:00:00',
      slotDuration: '00:30:00',
      nowIndicator: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this)
    };
  }

  loadSpaces(): void {
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces) => {
        this.spaces = spaces;
        this.loadBookings();
      },
      error: (err) => {
        console.error('Error loading spaces', err);
        this.error = this.translate.instant('booking.calendar.errorLoadingSpaces');
        this.loading = false;
      }
    });
  }

  loadBookings(): void {
    // Déterminer si l'utilisateur doit voir toutes les réservations ou seulement les siennes
    const isAdminOrStaff = this.currentUser.user.role === 'Admin' || 
                           this.currentUser.user.role === 'Staff';
    
    const bookingsObservable = isAdminOrStaff 
      ? this.bookingService.getAllBookings()
      : this.bookingService.getBookingsByUser(this.currentUser.user.id);
    
    bookingsObservable.subscribe({
      next: (bookings) => {
        // Convertir les réservations en événements pour le calendrier
        this.events = bookings.map(booking => {
          // Trouver le nom de l'espace
          const space = this.spaces.find(s => s.id === booking.spaceId);
          const spaceName = space ? space.name : 'Espace inconnu';
          
          // Utiliser la fonction utilitaire pour déterminer la couleur
          const color = this.getStatusColor(booking.status);
          
          return {
            id: booking.id,
            title: spaceName,
            start: new Date(booking.startTime),
            end: new Date(booking.endTime),
            backgroundColor: color,
            borderColor: color,
            textColor: '#FFFFFF',
            extendedProps: {
              bookingId: booking.id,
              spaceId: booking.spaceId,
              userId: booking.userId,
              status: booking.status,
              totalPrice: booking.totalPrice
            }
          };
        });
        
        // Mettre à jour les événements du calendrier
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.events
        };
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bookings', err);
        this.error = this.translate.instant('booking.calendar.errorLoadingBookings');
        this.loading = false;
      }
    });
  }

  // Fonction utilitaire pour obtenir la couleur selon le statut
  getStatusColor(status: any): string {
    // Pour les valeurs de type string
    if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return '#FF9800'; // Orange
        case 'Cancelled': return '#F44336'; // Red
        case 'Completed': return '#2196F3'; // Blue
        case 'Confirmed': return '#4CAF50'; // Green
        default: return '#4CAF50'; // Default Green
      }
    } 
    // Pour les valeurs numériques de l'enum
    else if (typeof status === 'number') {
      switch (status) {
        case 0: return '#FF9800'; // Pending
        case 2: return '#F44336'; // Cancelled
        case 3: return '#2196F3'; // Completed
        case 1: return '#4CAF50'; // Confirmed
        default: return '#4CAF50'; // Default Green
      }
    }
    // Valeur par défaut
    return '#4CAF50';
  }

  handleDateSelect(selectInfo: any): void {
    const start = selectInfo.start;
    const end = selectInfo.end;
    
    // Naviguer vers la page de création de réservation avec les dates présélectionnées
    this.router.navigate(['/booking/create'], { 
      queryParams: { 
        startDate: this.formatDateForParam(start),
        startTime: this.formatTimeForParam(start),
        endDate: this.formatDateForParam(end),
        endTime: this.formatTimeForParam(end)
      } 
    });
  }

  handleEventClick(clickInfo: any): void {
    // Naviguer vers la page de détails de la réservation
    const bookingId = clickInfo.event.extendedProps.bookingId;
    this.router.navigate(['/booking', bookingId]);
  }

  onSpaceFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedSpaceId = selectElement.value;
    
    // Filtrer les événements si un espace spécifique est sélectionné
    if (this.selectedSpaceId !== 'all') {
      const filteredEvents = this.events.filter(event => {
        const extendedProps = (event as any).extendedProps;
        return extendedProps && extendedProps.spaceId === this.selectedSpaceId;
      });
      
      this.calendarOptions = {
        ...this.calendarOptions,
        events: filteredEvents
      };
    } else {
      // Afficher tous les événements
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.events
      };
    }
  }

  // Méthodes utilitaires pour formatter les dates
  formatDateForParam(date: Date): string {
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  formatTimeForParam(date: Date): string {
    return date.getHours().toString().padStart(2, '0') + ':' + 
           date.getMinutes().toString().padStart(2, '0'); // Format HH:MM
  }
}