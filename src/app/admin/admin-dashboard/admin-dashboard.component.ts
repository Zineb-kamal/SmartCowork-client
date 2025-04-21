// src/app/features/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SpacesService } from '../../core/services/space.service';
import { BookingService } from '../../core/services/booking.service';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [ CommonModule,    // Ajout du CommonModule pour les directives et pipes
    RouterModule ]
})
export class AdminDashboardComponent implements OnInit {
  // Définition des propriétés manquantes
  today = new Date();
  currentUser: any = null;
  activeTab = 'overview';
  
  // Statistiques
  totalUsers = 0;
  totalSpaces = 0;
  totalBookings = 0;
  activeBookings = 0;
  loading = true;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private spaceService: SpacesService,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue?.user;
    this.loadStatistics();
  }
  
  // Définition des méthodes manquantes
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  
  loadStatistics(): void {
    this.loading = true;
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.loading = false;
      }
    });
    
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces) => {
        this.totalSpaces = spaces.length;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading spaces', err);
        this.loading = false;
      }
    });
    
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.totalBookings = bookings.length;
        this.activeBookings = bookings.filter(b => 

          b.status === 0 || 
          b.status === 1
        ).length;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading bookings', err);
        this.loading = false;
      }
    });
  }
  
  checkLoadingComplete(): void {
    if (this.totalUsers > 0 && this.totalSpaces >= 0 && this.totalBookings >= 0) {
      this.loading = false;
    }
  }
}