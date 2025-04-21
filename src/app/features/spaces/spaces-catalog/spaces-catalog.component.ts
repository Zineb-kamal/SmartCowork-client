// src/app/spaces/spaces-catalog/spaces-catalog.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SpacesService } from '../../../core/services/space.service';
import { Space, SpaceType } from '../../../core/models/space.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-spaces-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,TranslateModule],
  templateUrl: './spaces-catalog.component.html',
  styleUrls: ['./spaces-catalog.component.scss']
})
export class SpacesCatalogComponent implements OnInit {
  spaces: Space[] = [];
  filteredSpaces: Space[] = [];
  loading = true;
  error = '';
  
  // Filtres
  selectedType: string = '';
  selectedCity: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  
  // Options de filtre
  spaceTypes = [
    { value: '', label: 'Tous les types' },
    { value: SpaceType.Desk.toString(), label: 'Bureau individuel' },
    { value: SpaceType.MeetingRoom.toString(), label: 'Salle de réunion' },
    { value: SpaceType.PrivateOffice.toString(), label: 'Bureau privé' },
    { value: SpaceType.ConferenceRoom.toString(), label: 'Salle de conférence' }
  ];
  
  cities: string[] = [];

  constructor(private spacesService: SpacesService) { }

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.loading = true;
    
    if (this.selectedType) {
      this.spacesService.getSpacesByType(Number(this.selectedType))
        .subscribe(this.handleSpacesResponse.bind(this));
    } else {
      this.spacesService.getAllSpaces()
        .subscribe(this.handleSpacesResponse.bind(this));
    }
  }

  handleSpacesResponse(spaces: Space[]): void {
    this.loading = false;
    this.spaces = spaces;
    this.updateCitiesFilter();
    this.applyFilters();
  }

  updateCitiesFilter(): void {
    // Extraire les villes uniques des espaces
    this.cities = [...new Set(this.spaces
      .filter(space => space.city)
      .map(space => space.city as string))];
  }

  applyFilters(): void {
    this.filteredSpaces = this.spaces.filter(space => {
      // Filtre par ville
      if (this.selectedCity && space.city !== this.selectedCity) {
        return false;
      }
      
      // Filtre par prix min
      if (this.minPrice !== null && space.pricePerHour < this.minPrice) {
        return false;
      }
      
      // Filtre par prix max
      if (this.maxPrice !== null && space.pricePerHour > this.maxPrice) {
        return false;
      }
      
      return true;
    });
  }

  resetFilters(): void {
    this.selectedType = '';
    this.selectedCity = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.loadSpaces();
  }
  getSpaceTypeLabel(type: number): string {
    const spaceType = this.spaceTypes.find(t => t.value === type.toString());
    return spaceType ? spaceType.label : '';
  }
}