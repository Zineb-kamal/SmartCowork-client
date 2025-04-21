// src/app/features/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import {  RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: any = null;
  loading = false;
  success = false;
  error = '';
  isEditMode = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserProfile();
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)]],
    });
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user.user;
        this.profileForm.patchValue({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          phoneNumber: this.user.phoneNumber || '',
        });
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.loadUserProfile(); // Reset form when cancelling edit
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.success = false;
    this.error = '';

    const updatedProfile = {
      id: this.user.id,
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      phoneNumber: this.profileForm.value.phoneNumber,
    };

    // Simuler la mise à jour du profil (remplacer par votre vrai service)
    setTimeout(() => {
      // Mise à jour simulée
      this.success = true;
      this.loading = false;
      this.isEditMode = false;
      
      // Dans un cas réel, vous appelleriez votre API:
      // this.userService.updateProfile(updatedProfile).subscribe(
      //   (response) => {
      //     this.success = true;
      //     this.loading = false;
      //     this.isEditMode = false;
      //   },
      //   (error) => {
      //     this.error = 'Erreur lors de la mise à jour du profil';
      //     this.loading = false;
      //   }
      // );
    }, 1000);
  }
}