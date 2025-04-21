import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [
    // Retirez LoginComponent d'ici s'il est standalone
    // Seulement si RegisterComponent n'est pas standalone
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    LoginComponent,
    RegisterComponent
  ]
})
export class AuthModule { }