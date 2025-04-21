import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  image: string;
  spacesCount: number;
  features: string[];
  description?: string;
  contactInfo?: string;
  openingHours?: string[];
}

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  location: Location | undefined;
  loading = true;

  constructor() { }

  ngOnInit(): void {
    // Simuler le chargement des données
    setTimeout(() => {
      this.location = this.getCasablancaLocation();
      this.loading = false;
    }, 800);
  }

  // Données de l'emplacement de Casablanca
  getCasablancaLocation(): Location {
    return {
      id: '1',
      name: 'SmartCowork Casablanca',
      address: '17 Rue el Oraibi Jilali',
      city: 'Casablanca',
      postalCode: '20250',
      country: 'Maroc',
      image: 'assets/images/locations/casablanca.jpg',
      spacesCount: 12,
      features: [
        'WiFi haut débit', 
        'Salles de conférence', 
        'Café gratuit', 
        'Espace détente', 
        'Imprimante & scanner',
        'Cuisine équipée'
      ],
      description: 'Notre espace de coworking à Casablanca offre un environnement de travail moderne et inspirant au cœur de la ville. Avec une vue imprenable et des installations de première classe, c\'est l\'endroit idéal pour les professionnels et les entreprises en quête d\'un espace de travail flexible.',
      contactInfo: '+212 522 123 456',
      openingHours: [
        'Lundi - Vendredi: 8h00 - 20h00',
        'Samedi: 9h00 - 18h00',
        'Dimanche: Fermé'
      ]
    };
  }
}