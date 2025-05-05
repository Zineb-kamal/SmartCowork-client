// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, CreateUserRequest, User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
[x: string]: any;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Charger l'utilisateur depuis localStorage au démarrage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Récupérer l'utilisateur courant
  get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.currentUserValue?.token;
  }

 // Modifier cette méthode pour utiliser l'énumération
 hasRole(role: UserRole | string): boolean {
  return this.currentUserValue?.user.role === role;
}
isAdmin(): boolean {
  const currentUserResponse = this.currentUserValue;
  return !!currentUserResponse && currentUserResponse.user.role === UserRole.Admin;
}

isStaff(): boolean {
  const currentUserResponse = this.currentUserValue;
  return !!currentUserResponse && currentUserResponse.user.role === UserRole.Staff;
}



  // Connexion utilisateur
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('user/login', credentials)
      .pipe(
        tap(response => {
          // Stocker les données utilisateur et le token
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  // Inscription utilisateur
  register(userData: CreateUserRequest): Observable<User> {
    return this.apiService.post<User>('user/register', userData);
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

}