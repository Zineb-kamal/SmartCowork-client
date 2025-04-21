// src/app/features/booking/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingCreateDto, BookingUpdateDto } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/booking`;

  constructor(private http: HttpClient) { }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  getBookingsByUser(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  getBookingsBySpace(spaceId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/space/${spaceId}`);
  }

  createBooking(booking: BookingCreateDto): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  updateBooking(id: string, booking: BookingUpdateDto): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, booking);
  }

  deleteBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  checkAvailability(spaceId: string, startTime: Date, endTime: Date): Observable<boolean> {
    let params = new HttpParams()
      .set('spaceId', spaceId)
      .set('startTime', startTime.toISOString())
      .set('endTime', endTime.toISOString());
    
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, { params });
  }

  
  // Méthode pour vérifier la disponibilité en excluant une réservation spécifique
  // Utile lors de la modification d'une réservation existante
// Dans booking.service.ts, mettez à jour la méthode checkAvailabilityExcluding
checkAvailabilityExcluding(spaceId: string, startTime: Date, endTime: Date, excludeBookingId: string): Observable<boolean> {
  let params = new HttpParams()
    .set('spaceId', spaceId)
    .set('startTime', startTime.toISOString())
    .set('endTime', endTime.toISOString())
    .set('excludeBookingId', excludeBookingId);
  
  // Utiliser le même endpoint existant
  return this.http.get<boolean>(`${this.apiUrl}/check-availability`, { params });
}
}