// src/app/features/admin/admin-spaces/admin-spaces.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SpacesService } from '../../../core/services/space.service';
import { SpaceStatus, SpaceType } from '../../../core/models/space.model';

@Component({
  selector: 'app-admin-spaces',
  templateUrl: './admin-spaces.component.html',
  styleUrls: ['./admin-spaces.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule]
})
export class AdminSpacesComponent implements OnInit {
  spaces: any[] = [];
  filteredSpaces: any[] = [];
  loading = true;
  error: string | null = null;
  success: string | null = null;
  searchTerm = '';
  
  // Formulaire d'édition
  editingSpace: any = null;
  spaceForm: FormGroup;
  showModal = false;
  
  // Types d'espace pour le select
  spaceTypes = [
    { value: SpaceType.MeetingRoom, label: 'Salle de réunion' },
    { value: SpaceType.PrivateOffice, label: 'Bureau privé' },
    { value: SpaceType.Desk, label: 'Espace ouvert' },
    { value: SpaceType.ConferenceRoom, label: 'Salle de conférence' }
  ];
  
  // Statuts d'espace pour le select
  spaceStatuses = [
    { value: SpaceStatus.Available, label: 'Disponible' },
    { value: SpaceStatus.Occupied, label: 'Indisponible' },
    { value: SpaceStatus.Maintenance, label: 'En maintenance' }
  ];

  constructor(
    private spaceService: SpacesService,
    private fb: FormBuilder
  ) {
    this.spaceForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      type: [SpaceType.MeetingRoom, [Validators.required]],
      status: [SpaceStatus.Available, [Validators.required]],
      amenities: ['']
    });
  }

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.loading = true;
    
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces) => {
        this.spaces = spaces;
        this.filteredSpaces = [...spaces];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading spaces', err);
        this.error = 'Erreur lors du chargement des espaces';
        this.loading = false;
      }
    });
  }

  searchSpaces(): void {
    const value = this.searchTerm.toLowerCase();
    
    this.filteredSpaces = this.spaces.filter(space => 
      space.name.toLowerCase().includes(value) || 
      space.description.toLowerCase().includes(value) || 
      space.location.toLowerCase().includes(value)
    );
  }

  openEditModal(space: any): void {
    this.editingSpace = space;
    
    this.spaceForm.patchValue({
      name: space.name,
      description: space.description,
      location: space.location,
      capacity: space.capacity,
      hourlyRate: space.hourlyRate,
      type: space.type,
      status: space.status,
      amenities: space.amenities ? space.amenities.join(', ') : ''
    });
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingSpace = null;
  }

  openAddSpaceModal(): void {
    this.editingSpace = null;
    
    this.spaceForm.reset({
      type: SpaceType.MeetingRoom,
      status: SpaceStatus.Available,
      capacity: 1,
      hourlyRate: 0
    });
    
    this.showModal = true;
  }

  saveSpace(): void {
    if (this.spaceForm.invalid) {
      return;
    }
    
    const formData = this.spaceForm.value;
    
    // Conversion des équipements en tableau
    const amenities = formData.amenities
      ? formData.amenities.split(',').map((item: string) => item.trim()).filter((item: string) => item)
      : [];
    
    const spaceData = {
      ...formData,
      amenities
    };
    
    if (this.editingSpace) {
      // Mise à jour d'un espace existant
      this.loading = true;
      
      this.spaceService.updateSpace(
        this.editingSpace.id,spaceData
      ).subscribe({
        next: () => {
          this.success = 'Espace mis à jour avec succès';
          this.loading = false;
          this.closeModal();
          this.loadSpaces();
          
          // Réinitialiser le message de succès après 3 secondes
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error updating space', err);
          this.error = 'Erreur lors de la mise à jour de l\'espace';
          this.loading = false;
        }
      });
    } else {
      // Création d'un nouvel espace
      this.loading = true;
      
      this.spaceService.createSpace(spaceData).subscribe({
        next: () => {
          this.success = 'Espace créé avec succès';
          this.loading = false;
          this.closeModal();
          this.loadSpaces();
          
          // Réinitialiser le message de succès après 3 secondes
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error creating space', err);
          this.error = 'Erreur lors de la création de l\'espace';
          this.loading = false;
        }
      });
    }
  }

  confirmDeleteSpace(space: any): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'espace ${space.name} ?`)) {
      this.loading = true;
      
      this.spaceService.deleteSpace(space.id).subscribe({
        next: () => {
          this.success = 'Espace supprimé avec succès';
          this.loading = false;
          this.loadSpaces();
          
          // Réinitialiser le message de succès après 3 secondes
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error deleting space', err);
          this.error = 'Erreur lors de la suppression de l\'espace';
          this.loading = false;
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const statusObj = this.spaceStatuses.find(s => s.label === status);
    return statusObj ? statusObj.label : status;
  }

  getTypeLabel(type: string): string {
    const typeObj = this.spaceTypes.find(t => t.label === type);
    return typeObj ? typeObj.label : type;
  }

  formatPrice(price: number): string {
    return price.toFixed(2) + ' €';
  }
}