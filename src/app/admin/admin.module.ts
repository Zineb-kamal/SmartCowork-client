// src/app/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminDashboardComponent
  ]
})
export class AdminModule { }