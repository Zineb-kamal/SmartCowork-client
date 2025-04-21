// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UpdateUserRequest, ChangePasswordRequest, ChangeRoleRequest, ChangeStatusRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) { }

  // Récupérer tous les utilisateurs (Admin)
  getAllUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('user');
  }
// src/app/core/services/user.service.ts
// Ajouter cette méthode manquante
createUser(userData: User): Observable<User> {
  return this.apiService.post<User>('user/register', userData);
}
  // Récupérer un utilisateur par son ID
  getUserById(id: string): Observable<User> {
    return this.apiService.get<User>(`user/${id}`);
  }

  // Mettre à jour un utilisateur
  updateUser(id: string, userData: UpdateUserRequest): Observable<void> {
    return this.apiService.put<void>(`user/${id}`, userData);
  }

  // Changer le mot de passe
  changePassword(id: string, passwordData: ChangePasswordRequest): Observable<void> {
    return this.apiService.put<void>(`user/${id}/password`, passwordData);
  }

  // Changer le rôle (Admin)
  changeRole(id: string, roleData: ChangeRoleRequest): Observable<void> {
    return this.apiService.put<void>(`user/${id}/role`, roleData);
  }

  // Changer le statut (Admin)
  changeStatus(id: string, statusData: ChangeStatusRequest): Observable<void> {
    return this.apiService.put<void>(`user/${id}/status`, statusData);
  }

  // Supprimer un utilisateur (Admin)
  deleteUser(id: string): Observable<void> {
    return this.apiService.delete<void>(`user/${id}`);
  }
}