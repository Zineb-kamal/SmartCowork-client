import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingListComponent } from '../features/booking/booking-list/booking-list.component';
import { BookingCreateComponent } from '../features/booking/booking-create/booking-create.component';
import { BookingDetailsComponent } from '../features/booking/booking-details/booking-details.component';
import { routes } from '../app.routes';
import { BookingEditComponent } from '../features/booking/booking-edit/booking-edit.component';
import { AuthGuard } from '../core/guards/auth.guard';

export const BOOKING_ROUTES: Routes = [
  // {
  //   path: '',
  //   component: BookingListComponent
  // },
  // {
  //   path: 'create',
  //   component: BookingCreateComponent
  // },
  // {
  //   path: ':id',
  //   component: BookingDetailsComponent
  // },
  // {
  //   path: 'booking/edit/:id',
  //   component: BookingEditComponent,
  //   canActivate: [AuthGuard] // Si vous utilisez un guard d'authentification
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsRoutingModule { }
