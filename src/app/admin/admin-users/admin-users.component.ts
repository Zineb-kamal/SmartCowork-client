// src/app/features/admin/admin-users/admin-users.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserRole } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';


@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = true;
  error: string | null = null;
  success: string | null = null;
  searchTerm = '';
  
  // Formulaire d'édition
  editingUser: any = null;
  userForm: FormGroup;
  showModal = false;
  
  // Roles pour le select
  userRoles = [
    { value: UserRole.Admin, label: 'Admin' },
    { value: UserRole.Staff, label: 'Staff' },
    { value: UserRole.Member, label: 'Member' }
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: [UserRole.Member, [Validators.required]],
      status: ['Active', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
      }
    });
  }

  searchUsers(): void {
    const value = this.searchTerm.toLowerCase();
    
    this.filteredUsers = this.users.filter(user => 
      user.firstName.toLowerCase().includes(value) || 
      user.lastName.toLowerCase().includes(value) || 
      user.email.toLowerCase().includes(value)
    );
  }

  openEditModal(user: any): void {
    this.editingUser = user;
    
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status
    });
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingUser = null;
  }

  openAddUserModal(): void {
    this.editingUser = null;
    
    this.userForm.reset({
      role: UserRole.Member,
      status: 'Active'
    });
    
    this.showModal = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      return;
    }
    
    const userData = this.userForm.value;
    
    if (this.editingUser) {
      // Mise à jour d'un utilisateur existant
      this.loading = true;
      
      this.userService.updateUser(this.editingUser.id, userData).subscribe({
        next: () => {
          this.success = 'Utilisateur mis à jour avec succès';
          this.loading = false;
          this.closeModal();
          this.loadUsers();
          
          // Réinitialiser le message de succès après 3 secondes
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error updating user', err);
          this.error = 'Erreur lors de la mise à jour de l\'utilisateur';
          this.loading = false;
        }
      });
    } else {
      // Création d'un nouvel utilisateur
      this.loading = true;
      
      this.userService.createUser({
        ...userData,
        password: 'TemporaryPassword123!' // Mot de passe temporaire
      }).subscribe({
        next: () => {
          this.success = 'Utilisateur créé avec succès';
          this.loading = false;
          this.closeModal();
          this.loadUsers();
          
          // Réinitialiser le message de succès après 3 secondes
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error creating user', err);
          this.error = 'Erreur lors de la création de l\'utilisateur';
          this.loading = false;
        }
      });
    }
  }

  confirmDeleteUser(user: any): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      this.loading = true;
      
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.success = 'Utilisateur supprimé avec succès';
          this.loading = false;
          this.loadUsers();
          
          // Réinitialiser le message de succès après 3 secondes
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error deleting user', err);
          this.error = 'Erreur lors de la suppression de l\'utilisateur';
          this.loading = false;
        }
      });
    }
  }

  getRoleLabel(role: string): string {
    const roleObj = this.userRoles.find(r => r.label === role);
    return roleObj ? roleObj.label : role;
  }
}