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
import { InvoiceListComponent } from './features/billing/invoice-list/invoice-list.component';
import { PaymentFormComponent } from './features/billing/payment-form/payment-form.component';
import { TransactionHistoryComponent } from './features/billing/transaction-history/transaction-history.component';
import { InvoiceDetailsComponent } from './features/billing/invoice-details/invoice-details.component';
import { BillingDashboardComponent } from './features/billing/billing-dashboard/billing-dashboard.component';
import { SpaceCreateComponent } from './features/spaces/space-create/space-create.component';

export const routes: Routes = [
  // Routes publiques
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  
  // Routes des espaces
  { 
    path: 'spaces/create', 
    component: SpaceCreateComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
    data: { requiredRole: 'Admin' }
  },
  { path: 'spaces', component: SpacesCatalogComponent },
  { path: 'spaces/:id', component: SpaceDetailsComponent },
 
  { 
    path: 'spaces/edit/:id',
    component: SpaceFormsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
    data: { requiredRole: 'Admin' }
  },
  
  // Routes des réservations
  {
    path: 'booking',
    component: BookingListComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'booking/create', 
    component: BookingCreateComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'booking/calendar',
    component: BookingCalendarComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'booking/edit/:id',
    component: BookingEditComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  { 
    path: 'booking/:id', 
    component: BookingDetailsComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  
  // Routes du module de facturation
  {
    path: 'billing',
    children: [
      {
        path: '',
        component: BillingDashboardComponent,
        canActivate: [() => inject(AuthGuard).canActivate()]
      },
      {
        path: 'invoices',
        component: InvoiceListComponent,
        canActivate: [() => inject(AuthGuard).canActivate()]
      },
      {
        path: 'invoice/:id',
        component: InvoiceDetailsComponent,
        canActivate: [() => inject(AuthGuard).canActivate()]
      },
      {
        path: 'payment/:id',
        component: PaymentFormComponent,
        canActivate: [() => inject(AuthGuard).canActivate()]
      },
      {
        path: 'history',
        component: TransactionHistoryComponent,
        canActivate: [() => inject(AuthGuard).canActivate()]
      },
      {
        path: 'reports',
        component: InvoiceListComponent,
        canActivate: [() => inject(AuthGuard).canActivate()],
        data: { role: 'Admin' }
      }
    ]
  },
  
  // Routes d'administration
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [() => inject(AuthGuard).canActivate()],
    data: { role: 'Admin' }
  },
  
  // Autres routes
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'locations',
    component: LocationsComponent
  },
  
  // Route par défaut - redirige vers la page d'accueil
  { path: '**', redirectTo: '' }
];