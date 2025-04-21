// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Récupérer le rôle requis à partir des données de route
    const requiredRole = route.data['role'] as string;
    
    // Vérifier si l'utilisateur est connecté et a le rôle requis
    if (this.authService.isLoggedIn() && this.authService.hasRole(requiredRole)) {
      return true;
    }
    
    // Rediriger vers le tableau de bord si non autorisé
    this.router.navigate(['/dashboard']);
    return false;
  }
}