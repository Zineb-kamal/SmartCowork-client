// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL de base de l'API (à adapter selon votre configuration)
  private apiUrl = 'http://localhost:5072/api';

  constructor(private http: HttpClient) { }

  // Méthode GET générique
  get<T>(path: string, params: any = {}): Observable<T> {
    const httpParams = this.toHttpParams(params);
    return this.http.get<T>(`${this.apiUrl}/${path}`, { params: httpParams });
  }

  // Méthode POST générique
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${path}`, body);
  }

  // Méthode PUT générique
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${path}`, body);
  }

  // Méthode DELETE générique
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${path}`);
  }

  // Convertit un objet params en HttpParams
  private toHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (!params) {
      return httpParams;
    }
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    
    return httpParams;
  }
}