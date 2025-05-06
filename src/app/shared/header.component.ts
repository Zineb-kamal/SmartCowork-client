// src/app/shared/header/header.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { AuthService } from '../core/services/auth.service';
import { PopupService } from '../core/services/popup.service';
import { UserRole } from '../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule, LanguageSelectorComponent, RouterModule],
  template: `
    <div class="header">
      <div class="header-left">
        <a routerLink="/" class="logo">
          <span class="logo-text">SmartCowork</span>
          <div class="logo-accent"></div>
        </a>
        <nav class="nav-links">
          <a [routerLink]="['/locations']">{{ 'HEADER.LOCATIONS' | translate }}</a>
          <a [routerLink]="['/spaces']">{{ 'HEADER.SPACES' | translate }}</a>
          <a [routerLink]="['/booking']">{{ 'HEADER.BOOKINGS' | translate }}</a>
          <a [routerLink]="['/ai']">{{ 'Recommandations IA' | translate }}</a>
          <!-- Changed this from router link to a button that shows the popup -->
          <a href="javascript:void(0)" (click)="showContactPopup($event)">{{ 'HEADER.CONTACT' | translate }}</a>
          <a [routerLink]="['/about']">{{ 'HEADER.ABOUT' | translate }}</a>

        </nav>
      </div>
      
      <div class="header-right">
        <app-language-selector></app-language-selector>
        
        <!-- Affichage pour utilisateur non connecté -->
        <ng-container *ngIf="!isLoggedIn">
          <button class="login-btn" (click)="navigateToLogin()">{{ 'HOME.LOGIN_BUTTON' | translate }}</button>
          <button class="signup-btn" (click)="navigateToRegister()">{{ 'HOME.REGISTER_BUTTON' | translate }}</button>
        </ng-container>
        
        <!-- Affichage pour utilisateur connecté -->
        <ng-container *ngIf="isLoggedIn">
          <div class="user-menu">
            <button class="user-btn" (click)="toggleUserMenu()">
              {{ userName }} <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu" *ngIf="showMenu">
              <!-- Afficher Dashboard uniquement pour les admins -->
              <a *ngIf="authService.isAdmin()" routerLink="/admin">{{ 'HEADER.DASHBOARD' | translate }}</a>
              <a routerLink="/booking">{{ 'HEADER.MY_BOOKINGS' | translate }}</a>
              <a routerLink="/profile">{{ 'HEADER.PROFILE' | translate }}</a>
              <a (click)="logout()" class="logout-link">{{ 'HEADER.LOGOUT' | translate }}</a>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-left, .header-right {
      display: flex;
      align-items: center;
    }
    
    .logo {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      margin-right: 2rem;
    }
    
    .logo-text {
      color: #2e7d32;
      font-weight: 700;
      font-size: 1.5rem;
    }
    
    .logo-accent {
      height: 3px;
      width: 50%;
      background-color: #2e7d32;
      margin-top: 3px;
    }
    
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    
    .nav-links a {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      position: relative;
      cursor: pointer;
    }
    
    .nav-links a:hover:after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #2e7d32;
    }
    
    .login-btn, .signup-btn, .user-btn {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .login-btn {
      background: none;
      border: none;
      color: #2e7d32;
      margin-left: 1rem;
    }
    
    .signup-btn {
      background-color: #2e7d32;
      color: white;
      border: none;
      margin-left: 0.5rem;
    }
    
    .user-menu {
      position: relative;
      margin-left: 1rem;
    }
    
    .user-btn {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #333;
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 4px;
      min-width: 200px;
      margin-top: 0.5rem;
    }
    
    .dropdown-menu a {
      display: block;
      padding: 0.75rem 1rem;
      color: #333;
      text-decoration: none;
      transition: background 0.2s;
    }
    
    .dropdown-menu a:hover {
      background-color: #f5f5f5;
    }
    
    .logout-link {
      color: #f44336 !important;
      border-top: 1px solid #eee;
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userName = '';
  showMenu = false;
  
  constructor(
    public authService: AuthService,
    private router: Router,
    private popupService: PopupService // Added popup service
  ) { }
  
  ngOnInit(): void {
    // Observer les changements d'état de connexion
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userName = user.user.firstName || 'Utilisateur';
      }
    });
  }
  
  // New method to show contact popup
  showContactPopup(event: Event): void {
    event.preventDefault();
    console.log('HeaderComponent: Contact link clicked');
    this.popupService.showContactPopup();
  }
  
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
  
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
  
  toggleUserMenu(): void {
    this.showMenu = !this.showMenu;
  }
  
  logout(): void {
    this.authService.logout();
    this.showMenu = false;
    this.router.navigate(['/login']);
  }
   isAdmin(): boolean {
      const currentUserResponse = this.authService.currentUserValue;
      return !!currentUserResponse && currentUserResponse.user.role === UserRole.Admin;
    }
  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenu && !userMenu.contains(target) && this.showMenu) {
      this.showMenu = false;
    }
  }
}