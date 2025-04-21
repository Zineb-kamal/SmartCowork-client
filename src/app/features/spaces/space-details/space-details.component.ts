// src/app/spaces/space-details/space-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Space, SpaceStatus, SpaceType } from '../../../core/models/space.model';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SpacesService } from '../../../core/services/space.service';
import { UserRole } from '../../../core/models/user.model';



@Component({
  selector: 'app-space-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './space-details.component.html',
  styleUrls: ['./space-details.component.scss']
})
export class SpaceDetailsComponent implements OnInit {
  space: Space | null = null;
  isLoading = true;
  error = '';
  spaceTypes = SpaceType;
  spaceStatuses = SpaceStatus;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spaceService: SpacesService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadSpace();
  
    
  }

  loadSpace(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = "ID d'espace non valide";
      this.isLoading = false;
      return;
    }
    
    this.spaceService.getSpaceById(id)
      .subscribe({
        next: (space: Space | null) => {
          this.space = space;
          this.isLoading = false;
        },
        error: (err: any) => {
          this.error = "Impossible de charger les détails de l'espace";
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  deleteSpace(): void {
    if (!this.space) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${this.space.name}" ?`)) {
      this.spaceService.deleteSpace(this.space.id)
        .subscribe({
          next: () => {
            this.router.navigate(['/spaces']);
          },
          error: (err: any) => {
            this.error = "Erreur lors de la suppression de l'espace";
            console.error(err);
          }
        });
    }
  }

  getSpaceTypeName(type: SpaceType): string {
    switch(type) {
      case SpaceType.Desk: return 'Bureau individuel';
      case SpaceType.MeetingRoom: return 'Salle de réunion';
      case SpaceType.PrivateOffice: return 'Bureau privé';
      case SpaceType.ConferenceRoom: return 'Salle de conférence';
      default: return 'Inconnu';
    }
  }
  
  getStatusClass(status: SpaceStatus): string {
    switch(status) {
      case SpaceStatus.Available: return 'status-available';
      case SpaceStatus.Occupied: return 'status-occupied';
      case SpaceStatus.Maintenance: return 'status-maintenance';
      default: return '';
    }
  }
  
  getStatusName(status: SpaceStatus): string {
    switch(status) {
      case SpaceStatus.Available: return 'Disponible';
      case SpaceStatus.Occupied: return 'Occupé';
      case SpaceStatus.Maintenance: return 'En maintenance';
      default: return 'Inconnu';
    }
  }
  isAdmin(): boolean {
    const currentUserResponse = this.authService.currentUserValue;
    return !!currentUserResponse && currentUserResponse.user.role === UserRole.Admin;
  }
}