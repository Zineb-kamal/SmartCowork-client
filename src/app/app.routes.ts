import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { inject } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SpacesCatalogComponent } from './features/spaces/spaces-catalog/spaces-catalog.component';
import { SpaceDetailsComponent } from './features/spaces/space-details/space-details.component';
import { SpaceFormsComponent } from './features/spaces/space-forms/space-forms.component';
import { BookingListComponent } from './features/booking/booking-list/booking-list.component';
import { BookingCreateComponent } from './features/booking/booking-create/booking-create.component';
import { BookingDetailsComponent } from './features/booking/booking-details/booking-details.component';
import { BookingEditComponent } from './features/booking/booking-edit/booking-edit.component';
import { BookingCalendarComponent } from './features/booking/booking-calendar/booking-calendar.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LocationsComponent } from './features/locations/locations.component';

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  
  // Routes des espaces
  { path: 'spaces', component: SpacesCatalogComponent },
  { 
    path: 'spaces/new', 
    component: SpaceFormsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
    data: { requiredRole: 'Admin' }
  },
  { 
    path: 'spaces/edit/:id',
    component: SpaceFormsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
    data: { requiredRole: 'Admin' }
  },
  { path: 'spaces/:id', component: SpaceDetailsComponent },
  
  // Routes des réservations - approche uniformisée
  {
    path: 'booking',
    component: BookingListComponent, // Changé pour correspondre aux autres
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'booking/create', 
    component: BookingCreateComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'booking/edit/:id', // Cette route spécifique doit être AVANT la route générique
    component: BookingEditComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { 
    path: 'booking/:id', 
    component: BookingDetailsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'booking/calendar',
    component: BookingCalendarComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
    data: { role: 'Admin' }
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  
  // Nouvelle route pour les emplacements
  {
    path: 'locations',
    component: LocationsComponent
  },
];