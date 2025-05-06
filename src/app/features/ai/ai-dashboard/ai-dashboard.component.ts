// src/app/features/ai/ai-dashboard/ai-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AiService, Recommendation } from '../services/ai.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AiRecommendationsComponent } from '../../../shared/ai-recommendations/ai-recommendations.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ai-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AiRecommendationsComponent],
  templateUrl: './ai-dashboard.component.html',
  styleUrl: './ai-dashboard.component.scss'
})
export class AiDashboardComponent implements OnInit {
  loading = false;
  error = '';
  success = '';
  userId :any;
  spaceRecommendations: Recommendation[] = [];
  timeSlotRecommendations: Recommendation[] = [];
  pricingRecommendations: Recommendation[] = [];
  
  constructor(
    private aiService: AiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.currentUserValue?.user?.id;
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading = true;
    
    this.aiService.getUserRecommendations().subscribe({
      next: (data) => {
        // Classement des recommandations par type
        this.spaceRecommendations = data.filter(r => r.type === 'Space');
        this.timeSlotRecommendations = data.filter(r => r.type === 'TimeSlot');
        this.pricingRecommendations = data.filter(r => r.type === 'Pricing');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading recommendations', err);
        this.error = 'Erreur lors du chargement des recommandations';
        this.loading = false;
      }
    });
  }

  onRecommendationApplied(recommendation: Recommendation): void {
    this.success = 'Recommandation appliquée avec succès!';
    setTimeout(() => this.success = '', 3000);
    
    // Logique spécifique selon le type de recommandation
    switch(recommendation.type) {
      case 'Space':
        // Navigation vers les détails de l'espace
        // router.navigate(['/spaces', extractSpaceId(recommendation)])
        break;
      case 'TimeSlot':
        // Navigation vers la création de réservation avec les paramètres pré-remplis
        // router.navigate(['/booking/create'], { queryParams: {...} })
        break;
      case 'Pricing':
        // Application du plan tarifaire recommandé
        break;
    }
  }

  onRecommendationDeleted(id: string): void {
    // Mise à jour des listes locales
    this.spaceRecommendations = this.spaceRecommendations.filter(r => r.id !== id);
    this.timeSlotRecommendations = this.timeSlotRecommendations.filter(r => r.id !== id);
    this.pricingRecommendations = this.pricingRecommendations.filter(r => r.id !== id);
  }

  onRecommendationMarked(id: string): void {
    // Fonction appelée quand une recommandation est marquée comme lue
  }
}
