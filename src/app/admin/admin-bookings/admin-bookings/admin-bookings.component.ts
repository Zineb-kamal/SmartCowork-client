// src/app/admin/admin-bookings/admin-bookings/admin-bookings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BookingService } from '../../../core/services/booking.service';
import { SpacesService } from '../../../core/services/space.service';
import { UserService } from '../../../core/services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Recommendation {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
  confidence: number;
  isRead?: boolean;
}

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule]
})
export class AdminBookingsComponent implements OnInit {
  // Bookings data
  bookings: any[] = [];
  filteredBookings: any[] = [];
  loading = true;
  error: string | null = null;
  success: string | null = null;
  searchTerm = '';
  
  // AI Recommendations
  recommendations: Recommendation[] = [];
  showRecommendations = false;
  loadingRecommendations = false;
  
  // Maps to store space and user names
  spaceNames: { [key: string]: string } = {};
  userNames: { [key: string]: string } = {};
  
  // Filters
  statusFilter = 'all';
  dateFilter = 'all';
  
  // Sorting
  sortColumn = 'startTime';
  sortDirection = 'desc';
  
  // Pagination
  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  
  // Modal
  showDetailsModal = false;
  selectedBooking: any = null;
  
  constructor(
    private bookingService: BookingService,
    private spaceService: SpacesService,
    private userService: UserService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.calculateTotalPages();
        this.applyFilters();
        
        // Load space and user names
        this.loadSpaceNames();
        this.loadUserNames();
      },
      error: (err) => {
        console.error('Error loading bookings', err);
        this.error = 'Error loading bookings';
        this.loading = false;
      }
    });
  }

  refreshBookings(): void {
    this.loadBookings();
    this.success = 'Bookings refreshed successfully';
    setTimeout(() => {
      this.success = null;
    }, 3000);
  }

  loadSpaceNames(): void {
    const spaceIds = [...new Set(this.bookings.map(booking => booking.spaceId))];
    
    spaceIds.forEach(id => {
      this.spaceService.getSpaceById(id).subscribe({
        next: (space) => {
          if (space) {
            this.spaceNames[id] = space.name;
            this.applyFilters(); // Update display
          }
        },
        error: () => {
          this.spaceNames[id] = 'Unknown Space';
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
            this.applyFilters(); // Update display
          }
        },
        error: () => {
          this.userNames[id] = 'Unknown User';
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
    
    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(booking => 
        booking.status === this.statusFilter || 
        booking.status === parseInt(this.statusFilter)
      );
    }
    
    // Filter by date
    if (this.dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        
        switch (this.dateFilter) {
          case 'today':
            return bookingDate >= today && bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'thisWeek':
            return bookingDate >= thisWeekStart;
          case 'thisMonth':
            return bookingDate >= thisMonthStart;
          default:
            return true;
        }
      });
    }
    
    // Filter by search term
    if (this.searchTerm) {
      const value = this.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        (this.spaceNames[booking.spaceId] || '').toLowerCase().includes(value) ||
        (this.userNames[booking.userId] || '').toLowerCase().includes(value) ||
        booking.id.toString().toLowerCase().includes(value)
      );
    }
    
    // Apply sorting
    filtered = this.sortBookings(filtered);
    
    // Update total pages
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredBookings = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  sortBookings(bookings: any[]): any[] {
    return bookings.sort((a, b) => {
      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];
      
      // Special handling for nested properties or computed values
      if (this.sortColumn === 'userName') {
        valueA = this.userNames[a.userId] || '';
        valueB = this.userNames[b.userId] || '';
      }
      
      // Handle dates
      if (this.sortColumn === 'startTime' || this.sortColumn === 'endTime' || this.sortColumn === 'createdAt') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      // Compare values
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Toggle sort direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.applyFilters();
  }

  toggleRecommendations(): void {
    this.showRecommendations = !this.showRecommendations;
    
    if (this.showRecommendations && this.recommendations.length === 0) {
      this.loadRecommendations();
    }
  }

  loadRecommendations(): void {
    this.loadingRecommendations = true;
    // Replace with your actual AI service endpoint
    const aiServiceUrl = environment.apiUrl + '/recommendation/trending';
    
    this.http.get<Recommendation[]>(aiServiceUrl).subscribe({
      next: (data) => {
        this.recommendations = data;
        this.loadingRecommendations = false;
      },
      error: (err) => {
        console.error('Error loading recommendations', err);
        this.loadingRecommendations = false;
        this.error = 'Error loading AI recommendations';
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    });
  }

  getRecommendationContent(recommendation: Recommendation, property: string): any {
    try {
      const content = JSON.parse(recommendation.content);
      return content[property] || null;
    } catch (e) {
      console.error('Error parsing recommendation content', e);
      return null;
    }
  }

  getRecommendationIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'space':
        return 'fas fa-building';
      case 'timeslot':
        return 'fas fa-clock';
      case 'pricing':
        return 'fas fa-tag';
      default:
        return 'fas fa-lightbulb';
    }
  }

  getConfidenceBadge(confidence: number): string {
    if (confidence >= 0.8) {
      return 'confidence-badge high';
    } else if (confidence >= 0.5) {
      return 'confidence-badge medium';
    } else {
      return 'confidence-badge low';
    }
  }

  getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) {
      return 'admin.recommendations.confidenceHigh';
    } else if (confidence >= 0.5) {
      return 'admin.recommendations.confidenceMedium';
    } else {
      return 'admin.recommendations.confidenceLow';
    }
  }

  markAsRead(id: string): void {
    // Replace with your actual AI service endpoint
    const url = environment.apiUrl + `/recommendation/${id}/read`;
    
    this.http.put(url, {}).subscribe({
      next: () => {
        const recommendation = this.recommendations.find(r => r.id === id);
        if (recommendation) {
          recommendation.isRead = true;
        }
      },
      error: (err) => {
        console.error('Error marking recommendation as read', err);
      }
    });
  }

  deleteRecommendation(id: string): void {
    // Replace with your actual AI service endpoint
    const url = environment.apiUrl + `/recommendation/${id}`;
    
    this.http.delete(url).subscribe({
      next: () => {
        this.recommendations = this.recommendations.filter(r => r.id !== id);
      },
      error: (err) => {
        console.error('Error deleting recommendation', err);
      }
    });
  }

  applyRecommendation(recommendation: Recommendation): void {
    // Implementation will depend on the type of recommendation
    const type = recommendation.type.toLowerCase();
    
    if (type === 'space') {
      // Navigate to space details or create booking
      const spaceId = this.getRecommendationContent(recommendation, 'spaceId');
      if (spaceId) {
        // Implement navigation or action
        this.success = 'Navigating to space details...';
        setTimeout(() => {
          this.success = null;
        }, 3000);
      }
    } else if (type === 'timeslot') {
      // Create a booking with the recommended time slot
      const startTime = this.getRecommendationContent(recommendation, 'startTime');
      const endTime = this.getRecommendationContent(recommendation, 'endTime');
      const spaceId = this.getRecommendationContent(recommendation, 'spaceId');
      
      if (startTime && endTime && spaceId) {
        // Implement booking creation
        this.success = 'Creating booking with recommended time slot...';
        setTimeout(() => {
          this.success = null;
        }, 3000);
      }
    } else if (type === 'pricing') {
      // Apply the recommended pricing plan
      const planType = this.getRecommendationContent(recommendation, 'planType');
      const discount = this.getRecommendationContent(recommendation, 'discount');
      
      if (planType && discount) {
        // Implement pricing update
        this.success = `Applying ${planType} pricing plan with ${discount}% discount...`;
        setTimeout(() => {
          this.success = null;
        }, 3000);
      }
    }
    
    // Mark as read after applying
    this.markAsRead(recommendation.id);
  }

  confirmCancelBooking(booking: any): void {
    const spaceName = this.spaceNames[booking.spaceId] || 'Unknown Space';
    const userName = this.userNames[booking.userId] || 'Unknown User';
    
    if (confirm(`Are you sure you want to cancel the booking of ${spaceName} by ${userName}?`)) {
      this.loading = true;
      
      this.bookingService.deleteBooking(booking.id).subscribe({
        next: () => {
          this.success = 'Booking cancelled successfully';
          this.loading = false;
          this.loadBookings();
          
          // Reset success message after 3 seconds
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error cancelling booking', err);
          this.error = 'Error during booking cancellation';
          this.loading = false;
          
          // Reset error message after 3 seconds
          setTimeout(() => {
            this.error = null;
          }, 3000);
        }
      });
    }
  }

  canCancelBooking(booking: any): boolean {
    // Can cancel if status is Pending or Confirmed
    return booking.status === 0 || booking.status === 1 || 
           booking.status === 'Pending' || booking.status === 'Confirmed';
  }

  canEditBooking(booking: any): boolean {
    // Can edit if status is Pending or Confirmed
    return booking.status === 0 || booking.status === 1 || 
           booking.status === 'Pending' || booking.status === 'Confirmed';
  }

  viewBookingDetails(booking: any): void {
    this.selectedBooking = booking;
    this.showDetailsModal = true;
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedBooking = null;
  }

  editBooking(booking: any): void {
    // Navigate to edit page or open edit modal
    window.location.href = `/booking/edit/${booking.id}`;
  }

  // Pagination methods
  goToPage(page: any): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }
  
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.bookings.length / this.itemsPerPage);
  }
  
  getPaginationPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    
    if (this.totalPages <= 7) {
      // Show all pages if there are 7 or fewer
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Show ellipsis if current page is more than 3
      if (this.currentPage > 3) {
        pages.push('...');
      }
      
      // Calculate range around current page
      let rangeStart = Math.max(2, this.currentPage - 1);
      let rangeEnd = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Adjust range to always show 3 pages
      if (rangeStart === 2 && rangeEnd < 4) {
        rangeEnd = Math.min(4, this.totalPages - 1);
      }
      if (rangeEnd === this.totalPages - 1 && rangeStart > this.totalPages - 3) {
        rangeStart = Math.max(this.totalPages - 3, 2);
      }
      
      // Add range pages
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }
      
      // Show ellipsis if current page is less than totalPages - 2
      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  // Utility methods
  getStatusText(status: any): string {
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Pending';
        case 1: return 'Confirmed';
        case 2: return 'Cancelled';
        case 3: return 'Completed';
        default: return 'Unknown';
      }
    } else if (typeof status === 'string') {
      switch (status) {
        case 'Pending': return 'Pending';
        case 'Confirmed': return 'Confirmed';
        case 'Cancelled': return 'Cancelled';
        case 'Completed': return 'Completed';
        default: return status;
      }
    }
    return 'Unknown';
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

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getHours().toString().padStart(2, '0') + ':' + 
           date.getMinutes().toString().padStart(2, '0');
  }

  formatPrice(price: number): string {
    return price.toFixed(2) + ' €';
  }

  calculateDuration(startTime: string | Date, endTime: string | Date): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs === 0) {
      return `${diffMins} minutes`;
    } else if (diffMins === 0) {
      return `${diffHrs} hours`;
    } else {
      return `${diffHrs} hours, ${diffMins} minutes`;
    }
  }
}