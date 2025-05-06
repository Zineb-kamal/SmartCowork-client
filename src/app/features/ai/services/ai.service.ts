// src/app/features/ai/services/ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Recommendation {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
  confidence: number;
  isRead?: boolean;
}

export interface UserPreference {
  id?: string;
  userId?: string;
  preferredSpaceType?: string;
  preferredCapacity?: number;
  preferredDayOfWeek?: number;
  preferredStartTime?: string;
  preferredDuration?: string;
  featurePreferences?: { [key: string]: number };
}

export interface UserActivity {
  id?: string;
  userId: string;
  bookingId: string;
  spaceId: string;
  startTime: Date;
  endTime: Date;
  wasCancelled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/recommendation`;

  constructor(private http: HttpClient) { }

  getUserRecommendations(type?: string): Observable<Recommendation[]> {
    let url = `${this.apiUrl}/user`;
    if (type) {
      url += `?type=${type}`;
    }
    return this.http.get<Recommendation[]>(url);
  }

  getTrendingSpaces(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.apiUrl}/trending`);
  }

  getSpaceRecommendation(userId: string): Observable<Recommendation> {
    return this.http.get<Recommendation>(`${this.apiUrl}/space/${userId}`);
  }

  getTimeSlotRecommendation(userId: string, spaceId: string): Observable<Recommendation> {
    return this.http.get<Recommendation>(`${this.apiUrl}/timeslot/${userId}/${spaceId}`);
  }

  getPricingRecommendation(userId: string): Observable<Recommendation> {
    return this.http.get<Recommendation>(`${this.apiUrl}/pricing/${userId}`);
  }

  getUserPreferences(): Observable<UserPreference> {
    return this.http.get<UserPreference>(`${this.apiUrl}/preferences`);
  }

  updateUserPreferences(preferences: UserPreference): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/preferences`, preferences);
  }

  trackActivity(activity: UserActivity): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/track`, activity);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  deleteRecommendation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Méthode utilitaire pour extraire le contenu de la recommandation
  parseRecommendationContent(content: string): any {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Error parsing recommendation content', e);
      return {};
    }
  }
}