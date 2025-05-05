// src/app/features/spaces/space-forms/space-forms.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SpaceStatus, SpaceType } from '../../../core/models/space.model';
import { SpacesService } from '../../../core/services/space.service';

@Component({
  selector: 'app-space-forms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './space-forms.component.html',
  styleUrls: ['./space-forms.component.scss']
})
export class SpaceFormsComponent implements OnInit {
  spaceForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  spaceId = '';
  error = '';
  successMessage = '';
  spaceTypes = Object.values(SpaceType).filter(value => typeof value === 'number');
  spaceStatuses = Object.values(SpaceStatus).filter(value => typeof value === 'number');
  imagePreviewUrl: string | null = null;
  imageFile: File | null = null;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private spaceService: SpacesService
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.spaceId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.spaceId;
    
    if (this.isEditMode) {
      this.loadSpace();
    }
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

  loadSpace(): void {
    this.isLoading = true;
    this.spaceService.getSpaceById(this.spaceId)
      .subscribe({
        next: (space) => {
          this.spaceForm.patchValue(space);
          // Initialiser l'aperçu de l'image si une URL d'image existe
          if (space.imageUrl) {
            this.imagePreviewUrl = space.imageUrl;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = "Impossible de charger les détails de l'espace";
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  onSubmit(): void {
    if (this.spaceForm.invalid) {
      Object.keys(this.spaceForm.controls).forEach(key => {
        const control = this.spaceForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    // Si une nouvelle image a été sélectionnée
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
    if (this.isEditMode) {
      const spaceData = { ...this.spaceForm.value, id: this.spaceId };
      this.spaceService.updateSpace(this.spaceId, spaceData)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.successMessage = 'Espace mis à jour avec succès';
            setTimeout(() => {
              this.router.navigate(['/spaces/details', this.spaceId]);
            }, 1500);
          },
          error: (err) => {
            this.error = "Erreur lors de la mise à jour de l'espace";
            this.isSubmitting = false;
          }
        });
    } else {
      this.spaceService.createSpace(this.spaceForm.value)
        .subscribe({
          next: (space) => {
            this.isSubmitting = false;
            this.router.navigate(['/spaces/details', space.id]);
          },
          error: (err) => {
            this.error = "Erreur lors de la création de l'espace";
            this.isSubmitting = false;
          }
        });
    }
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
}