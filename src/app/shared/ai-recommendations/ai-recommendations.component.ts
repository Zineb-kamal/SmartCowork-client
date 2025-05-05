// src/app/shared/ai-recommendations/ai-recommendations.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

interface Recommendation {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
  confidence: number;
  isRead?: boolean;
}

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="recommendations-panel">
      <div class="recommendations-header">
        <h3>{{ title }}</h3>
        <div class="confidence-legend">
          <span class="confidence-item">
            <i class="confidence-dot high"></i> {{ 'recommendations.highConfidence' | translate }}
          </span>
          <span class="confidence-item">
            <i class="confidence-dot medium"></i> {{ 'recommendations.mediumConfidence' | translate }}
          </span>
          <span class="confidence-item">
            <i class="confidence-dot low"></i> {{ 'recommendations.lowConfidence' | translate }}
          </span>
        </div>
      </div>
      
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>{{ 'recommendations.loading' | translate }}</p>
      </div>
      
      <div *ngIf="!loading && recommendations.length === 0" class="empty-state">
        <i class="fas fa-lightbulb empty-icon"></i>
        <p>{{ 'recommendations.noRecommendations' | translate }}</p>
      </div>
      
      <div *ngIf="!loading && recommendations.length > 0" class="recommendations-grid">
        <div *ngFor="let recommendation of recommendations" class="recommendation-card">
          <div class="recommendation-header">
            <div class="recommendation-type">
              <i [ngClass]="getRecommendationIcon(recommendation.type)"></i>
              {{ 'recommendations.type.' + recommendation.type.toLowerCase() | translate }}
            </div>
            <div class="recommendation-actions">
              <button class="icon-btn" (click)="markAsRead(recommendation)" *ngIf="!recommendation.isRead">
                <i class="fas fa-check"></i>
              </button>
              <button class="icon-btn" (click)="deleteRecommendation(recommendation)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="recommendation-content">
            <div [ngClass]="getConfidenceBadge(recommendation.confidence)">
              {{ getConfidenceLabel(recommendation.confidence) | translate }}
            </div>
            <div class="recommendation-details">
              <ng-container *ngIf="recommendation.type === 'Space'">
                <h4>{{ getRecommendationContent(recommendation, 'spaceName') }}</h4>
                <p>{{ 'recommendations.spaceType' | translate }}: {{ getRecommendationContent(recommendation, 'spaceType') }}</p>
                <p>{{ 'recommendations.capacity' | translate }}: {{ getRecommendationContent(recommendation, 'capacity') }}</p>
                <p>{{ 'recommendations.pricePerHour' | translate }}: {{ formatPrice(getRecommendationContent(recommendation, 'pricePerHour')) }}</p>
                <p class="recommendation-reason">{{ getRecommendationContent(recommendation, 'reason') }}</p>
              </ng-container>
              
              <ng-container *ngIf="recommendation.type === 'TimeSlot'">
                <h4>{{ 'recommendations.suggestedTimeSlot' | translate }}</h4>
                <p>{{ 'recommendations.day' | translate }}: {{ getRecommendationContent(recommendation, 'dayOfWeek') }}</p>
                <p>{{ 'recommendations.startTime' | translate }}: {{ formatTime(getRecommendationContent(recommendation, 'startTime')) }}</p>
                <p>{{ 'recommendations.endTime' | translate }}: {{ formatTime(getRecommendationContent(recommendation, 'endTime')) }}</p>
                <p class="recommendation-reason">{{ getRecommendationContent(recommendation, 'reason') }}</p>
              </ng-container>
              
              <ng-container *ngIf="recommendation.type === 'Pricing'">
                <h4>{{ 'recommendations.suggestedPricing' | translate }}</h4>
                <p>{{ 'recommendations.planType' | translate }}: {{ getRecommendationContent(recommendation, 'planType') }}</p>
                <p>{{ 'recommendations.discount' | translate }}: {{ getRecommendationContent(recommendation, 'discount') }}%</p>
                <p class="recommendation-reason">{{ getRecommendationContent(recommendation, 'reason') }}</p>
              </ng-container>

              <ng-container *ngIf="recommendation.type === 'OccupancyPrediction'">
                <h4>{{ 'recommendations.occupancyPrediction' | translate }}</h4>
                <p>{{ 'recommendations.predictedRate' | translate }}: {{ formatPercentage(getRecommendationContent(recommendation, 'predictedOccupancyRate')) }}</p>
                <p>{{ 'recommendations.confidence' | translate }}: {{ formatPercentage(getRecommendationContent(recommendation, 'confidence')) }}</p>
                <p class="recommendation-reason">{{ 'recommendations.occupancyReason' | translate }}</p>
              </ng-container>
            </div>
          </div>
          <div class="recommendation-footer">
            <span class="recommendation-date">{{ recommendation.createdAt | date:'dd MMM yyyy' }}</span>
            <button class="btn-small" (click)="applyRecommendation(recommendation)">
              {{ 'recommendations.apply' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['ai-recommendations.component.scss']
})
export class AiRecommendationsComponent implements OnInit {
  @Input() title: string = 'AI Recommendations';
  @Input() userId: string | null = null;
  @Input() type: string | null = null;
  @Input() endpoint: string = 'trending';
  
  @Output() applied = new EventEmitter<Recommendation>();
  @Output() deleted = new EventEmitter<string>();
  @Output() marked = new EventEmitter<string>();
  
  recommendations: Recommendation[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  constructor(private http: HttpClient) { }
  
  ngOnInit(): void {
    this.loadRecommendations();
  }
  
  loadRecommendations(): void {
    this.loading = true;
    
    let url = `${environment.apiUrl}/recommendation/${this.endpoint}`;
    
    // Add query parameters if provided
    const params: any = {};
    if (this.userId) params.userId = this.userId;
    if (this.type) params.type = this.type;
    
    this.http.get<Recommendation[]>(url, { params }).subscribe({
      next: (data) => {
        this.recommendations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading recommendations', err);
        this.loading = false;
        this.error = 'Error loading AI recommendations';
      }
    });
  }
  
  getRecommendationContent(recommendation: Recommendation, property: string): any {
    try {
      const content = JSON.parse(recommendation.content);
      return content[property] || null;
    } catch (e) {
      console.error('Error parsing recommendation content', e);
      return null;
    }
  }
  
  getRecommendationIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'space':
        return 'fas fa-building';
      case 'timeslot':
        return 'fas fa-clock';
      case 'pricing':
        return 'fas fa-tag';
      case 'occupancyprediction':
        return 'fas fa-chart-line';
      default:
        return 'fas fa-lightbulb';
    }
  }
  
  getConfidenceBadge(confidence: number): string {
    if (confidence >= 0.8) {
      return 'confidence-badge high';
    } else if (confidence >= 0.5) {
      return 'confidence-badge medium';
    } else {
      return 'confidence-badge low';
    }
  }
  
  getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) {
      return 'recommendations.confidenceHigh';
    } else if (confidence >= 0.5) {
      return 'recommendations.confidenceMedium';
    } else {
      return 'recommendations.confidenceLow';
    }
  }
  
  markAsRead(recommendation: Recommendation): void {
    const url = `${environment.apiUrl}/recommendation/${recommendation.id}/read`;
    
    this.http.put(url, {}).subscribe({
      next: () => {
        recommendation.isRead = true;
        this.marked.emit(recommendation.id);
      },
      error: (err) => {
        console.error('Error marking recommendation as read', err);
      }
    });
  }
  
  deleteRecommendation(recommendation: Recommendation): void {
    const url = `${environment.apiUrl}/recommendation/${recommendation.id}`;
    
    this.http.delete(url).subscribe({
      next: () => {
        this.recommendations = this.recommendations.filter(r => r.id !== recommendation.id);
        this.deleted.emit(recommendation.id);
      },
      error: (err) => {
        console.error('Error deleting recommendation', err);
      }
    });
  }
  
  applyRecommendation(recommendation: Recommendation): void {
    this.applied.emit(recommendation);
  }
  
  formatPrice(price: number | null): string {
    if (price === null) return 'N/A';
    return price.toFixed(2) + ' €';
  }
  
  formatTime(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.getHours().toString().padStart(2, '0') + ':' + 
             date.getMinutes().toString().padStart(2, '0');
    } catch (e) {
      return dateStr;
    }
  }
  
  formatPercentage(value: number | null): string {
    if (value === null) return 'N/A';
    return (value * 100).toFixed(1) + '%';
  }
}