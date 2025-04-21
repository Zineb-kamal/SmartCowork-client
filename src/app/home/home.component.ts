// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContactPopupComponent } from '../shared/contact-popup/contact-popup.component';

interface City {
  value: string;
  label: string;
  spacesCount?: number;
}

interface SpaceType {
  value: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ContactPopupComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  selectedCity: string = '';
  selectedSpaceType: string = '';
  currencySymbol: string = 'MAD ';
  showContactPopup = false;
  
  // Moroccan cities
  moroccanCities: City[] = [
    { value: 'casablanca', label: 'Casablanca' },
    { value: 'rabat', label: 'Rabat' },
    { value: 'marrakech', label: 'Marrakech' },
    { value: 'tangier', label: 'Tanger' },
    { value: 'agadir', label: 'Agadir' },
    { value: 'fes', label: 'Fès' },
    { value: 'meknes', label: 'Meknès' },
    { value: 'oujda', label: 'Oujda' },
    { value: 'kenitra', label: 'Kénitra' },
    { value: 'tetouan', label: 'Tétouan' }
  ];
  
  // Featured cities without images
  featuredCities: City[] = [
    { value: 'casablanca', label: 'Casablanca', spacesCount: 24 },
    { value: 'rabat', label: 'Rabat', spacesCount: 18 },
    { value: 'marrakech', label: 'Marrakech', spacesCount: 15 },
    { value: 'tangier', label: 'Tanger', spacesCount: 10 },
    { value: 'agadir', label: 'Agadir', spacesCount: 8 }
  ];
  
  // Space types
  spaceTypes: SpaceType[] = [
    { value: 'desk', label: 'HOME.SPACES.DESK.TITLE' },
    { value: 'meeting_room', label: 'HOME.SPACES.MEETING_ROOM.TITLE' },
    { value: 'private_office', label: 'HOME.SPACES.PRIVATE_OFFICE.TITLE' },
    { value: 'conference_room', label: 'HOME.SPACES.CONFERENCE_ROOM.TITLE' }
  ];

  constructor(
    private router: Router,
    private translateService: TranslateService
  ) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  
  searchSpaces() {
    if (this.selectedCity) {
      // Navigate to search results with selected filters
      this.router.navigate(['/search'], { 
        queryParams: { 
          city: this.selectedCity,
          type: this.selectedSpaceType || 'all'
        } 
      });
    }
  }
  
  selectCity(cityValue: string) {
    this.selectedCity = cityValue;
    this.searchSpaces();
  }
}