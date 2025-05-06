// src/app/features/ai/user-preferences/user-preferences.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AiService, UserPreference } from '../services/ai.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterModule],
  templateUrl: './user-preferences.component.html',
  styleUrl: './user-preferences.component.scss'
})
export class UserPreferencesComponent implements OnInit {
  preferencesForm: FormGroup;
  loading = false;
  success = '';
  error = '';
  
  // Options pour les sélecteurs
  spaceTypes = [
    { value: 'MeetingRoom', label: 'Salle de réunion' },
    { value: 'PrivateOffice', label: 'Bureau privé' },
    { value: 'OpenSpace', label: 'Espace ouvert' },
    { value: 'ConferenceRoom', label: 'Salle de conférence' }
  ];
  
  daysOfWeek = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' }
  ];
  
  features = [
    { key: 'wifi', label: 'Wi-Fi' },
    { key: 'projector', label: 'Projecteur' },
    { key: 'whiteboard', label: 'Tableau blanc' },
    { key: 'coffee', label: 'Machine à café' },
    { key: 'quietZone', label: 'Zone calme' },
    { key: 'naturalLight', label: 'Lumière naturelle' },
    { key: 'parking', label: 'Parking' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private aiService: AiService
  ) {
    // Initialisation du formulaire
    this.preferencesForm = this.fb.group({
      preferredSpaceType: [''],
      preferredCapacity: ['', [Validators.min(1), Validators.max(100)]],
      preferredDayOfWeek: [''],
      preferredStartTime: [''],
      preferredDuration: [''],
      featurePreferences: this.fb.group({})
    });
    
    // Ajout dynamique des contrôles pour les préférences de fonctionnalités
    const featureGroup = this.preferencesForm.get('featurePreferences') as FormGroup;
    this.features.forEach(feature => {
      featureGroup.addControl(feature.key, this.fb.control(0));
    });
  }

  ngOnInit(): void {
    this.loadUserPreferences();
  }

  loadUserPreferences(): void {
    this.loading = true;
    
    this.aiService.getUserPreferences().subscribe({
      next: (preferences) => {
        if (preferences) {
          // Mise à jour du formulaire avec les préférences existantes
          this.preferencesForm.patchValue({
            preferredSpaceType: preferences.preferredSpaceType || '',
            preferredCapacity: preferences.preferredCapacity || '',
            preferredDayOfWeek: preferences.preferredDayOfWeek?.toString() || '',
            preferredStartTime: this.formatTimeForInput(preferences.preferredStartTime),
            preferredDuration: this.formatTimeForInput(preferences.preferredDuration)
          });
          
          // Mise à jour des préférences de fonctionnalités
          if (preferences.featurePreferences) {
            const featureGroup = this.preferencesForm.get('featurePreferences') as FormGroup;
            Object.entries(preferences.featurePreferences).forEach(([key, value]) => {
              if (featureGroup.contains(key)) {
                featureGroup.get(key)?.setValue(value);
              }
            });
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user preferences', err);
        this.error = 'Erreur lors du chargement des préférences';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.preferencesForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Préparation des données
    const formValues = this.preferencesForm.value;
    const preferenceData: UserPreference = {
      preferredSpaceType: formValues.preferredSpaceType || undefined,
      preferredCapacity: formValues.preferredCapacity || undefined,
      preferredDayOfWeek: formValues.preferredDayOfWeek ? parseInt(formValues.preferredDayOfWeek) : undefined,
      preferredStartTime: formValues.preferredStartTime || undefined,
      preferredDuration: formValues.preferredDuration || undefined,
      featurePreferences: formValues.featurePreferences
    };
    
    // Envoi des préférences
    this.aiService.updateUserPreferences(preferenceData).subscribe({
      next: () => {
        this.success = 'Préférences mises à jour avec succès';
        this.loading = false;
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving preferences', err);
        this.error = 'Erreur lors de la sauvegarde des préférences';
        this.loading = false;
      }
    });
  }

  // Utilitaire pour formater l'heure pour les champs d'entrée
  formatTimeForInput(timeStr?: string): string {
    if (!timeStr) return '';
    
    // Si c'est déjà au format HH:mm, on le retourne tel quel
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
      return timeStr;
    }
    
    try {
      // Sinon on essaie de le parser comme un objet TimeSpan ou Date
      const match = timeStr.match(/(\d+):(\d+)/);
      if (match) {
        return `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}`;
      }
    } catch (e) {
      return '';
    }
    
    return '';
  }
  
  // Pour afficher une valeur d'importance sous forme textuelle
  getImportanceLabel(value: number): string {
    if (value >= 0.7) return 'Très important';
    if (value >= 0.4) return 'Important';
    if (value > 0) return 'Un peu important';
    return 'Pas important';
  }
}