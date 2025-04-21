// src/app/core/models/user.model.ts

// Enum représentant les rôles utilisateur
export enum UserRole {
    Admin = 0,
    Member = 1,
    Staff = 2
  }
  
  // Enum représentant les statuts utilisateur
  export enum UserStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Blocked = 'Blocked'
  }
  
  // Interface principale pour un utilisateur
  export interface User {
    id: string;              // Guid converti en string pour TypeScript
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt?: Date;        // Optionnel car peut être null
  }
  
  // Interface pour la création d'un utilisateur (sans ID, createdAt, updatedAt)
  export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;       // Inclus seulement à la création
    phoneNumber: string;
  }
  
  // Interface pour la mise à jour d'un utilisateur (tous les champs sont optionnels)
  export interface UpdateUserRequest {
    id: string;             // ID requis pour l'identification
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }
  
  // Interface pour la connexion
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  // Interface pour la réponse après connexion
  export interface LoginResponse {
    token: string;
    user: User;
  }
  
  // Interface pour le changement de mot de passe
  export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
  }
  
  // Interface pour le changement de rôle
  export interface ChangeRoleRequest {
    role: UserRole;
  }
  
  // Interface pour le changement de statut
  export interface ChangeStatusRequest {
    status: UserStatus;
  }