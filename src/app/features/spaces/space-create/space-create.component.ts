// src/app/features/spaces/space-create/space-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SpaceStatus, SpaceType } from '../../../core/models/space.model';
import { SpacesService } from '../../../core/services/space.service';

@Component({
  selector: 'app-space-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './space-create.component.html',
  styleUrls: ['./space-create.component.scss']
})
export class SpaceCreateComponent implements OnInit {
  spaceForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  error = '';
  successMessage = '';
  imagePreviewUrl: string | null = null;
  imageFile: File | null = null;
  
  // Options pour les listes déroulantes
  spaceTypes = Object.values(SpaceType).filter(value => typeof value === 'number');
  spaceStatuses = Object.values(SpaceStatus).filter(value => typeof value === 'number');
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private spaceService: SpacesService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.spaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      type: [SpaceType.Desk, [Validators.required]],
      status: [SpaceStatus.Available, [Validators.required]],
      pricePerHour: [0, [Validators.required, Validators.min(0)]],
      pricePerDay: [0, [Validators.required, Validators.min(0)]],
      pricePerWeek: [0, [Validators.required, Validators.min(0)]],
      pricePerMonth: [0, [Validators.required, Validators.min(0)]],
      pricePerYear: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      city: ['']
    });
  }

  onSubmit(): void {
    if (this.spaceForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.spaceForm.controls).forEach(key => {
        const control = this.spaceForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    // Si une image a été sélectionnée, l'uploader d'abord
    if (this.imageFile) {
      this.uploadImageAndSaveSpace();
    } else {
      this.saveSpace();
    }
  }

  uploadImageAndSaveSpace(): void {
    if (!this.imageFile) return;
    
    // Créer un FormData pour l'upload
    const formData = new FormData();
    formData.append('file', this.imageFile);
    
    this.spaceService.uploadImage(formData).subscribe({
      next: (response) => {
        // Mettre à jour l'URL de l'image dans le formulaire
        this.spaceForm.get('imageUrl')?.setValue(response.imageUrl);
        // Continuer avec la sauvegarde de l'espace
        this.saveSpace();
      },
      error: (err) => {
        this.error = "Erreur lors de l'upload de l'image";
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }

  saveSpace(): void {
    this.spaceService.createSpace(this.spaceForm.value)
      .subscribe({
        next: (space) => {
          this.successMessage = 'Espace créé avec succès!';
          this.isSubmitting = false;
          
          // Redirection après un court délai
          setTimeout(() => {
            this.router.navigate(['/spaces', space.id]);
          }, 1500);
        },
        error: (err) => {
          this.error = "Erreur lors de la création de l'espace";
          this.isSubmitting = false;
          console.error(err);
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      
      // Créer un URL d'aperçu pour l'image sélectionnée
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreviewUrl = null;
    this.spaceForm.get('imageUrl')?.setValue('');
  }

  getSpaceTypeName(type: number): string {
    switch(type) {
      case SpaceType.Desk: return 'Bureau individuel';
      case SpaceType.MeetingRoom: return 'Salle de réunion';
      case SpaceType.PrivateOffice: return 'Bureau privé';
      case SpaceType.ConferenceRoom: return 'Salle de conférence';
      default: return 'Inconnu';
    }
  }
  
  getStatusName(status: number): string {
    switch(status) {
      case SpaceStatus.Available: return 'Disponible';
      case SpaceStatus.Occupied: return 'Occupé';
      case SpaceStatus.Maintenance: return 'En maintenance';
      default: return 'Inconnu';
    }
  }
}