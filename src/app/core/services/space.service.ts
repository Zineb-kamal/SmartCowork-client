// src/app/core/services/spaces.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Space, SpaceType, SpaceStatus } from '../models/space.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpacesService {
  private apiUrl = environment.apiUrl + '/space';

  constructor(private http: HttpClient) { }

  getAllSpaces(): Observable<Space[]> {
    
    return this.http.get<Space[]>(this.apiUrl);
  }

  getSpaceById(id: string): Observable<Space> {
    return this.http.get<Space>(`${this.apiUrl}/${id}`);
  }

  getAvailableSpaces(): Observable<Space[]> {
    return this.http.get<Space[]>(`${this.apiUrl}/available`);
  }

  getSpacesByType(type: SpaceType): Observable<Space[]> {
    return this.http.get<Space[]>(`${this.apiUrl}/type/${type}`);
  }

  createSpace(spaceData: any): Observable<Space> {
    return this.http.post<Space>(this.apiUrl, spaceData);
  }

  updateSpace(id: string, spaceData: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, spaceData);
  }

  deleteSpace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(formData: FormData): Observable<any> {
  let apiUrl = environment.apiUrl;
  
  if (!apiUrl.includes('/api')) {
    apiUrl = `${apiUrl}/api`;
  }

  const fullUrl = `${apiUrl}/upload/image`.replace(/([^:]\/)\/+/g, '$1');
  
  console.log('URL d\'upload d\'image:', fullUrl); 
  
  return this.http.post<any>(fullUrl, formData);
  
  }
  
}