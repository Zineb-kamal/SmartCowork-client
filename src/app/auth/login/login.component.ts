// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '/dashboard';
  error: string = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Initialiser le formulaire de connexion avec validation
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Récupérer l'URL de retour depuis les paramètres de route ou utiliser la valeur par défaut
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Rediriger vers le tableau de bord si déjà connecté
    // if (this.authService.isLoggedIn()) {
    //   this.router.navigate([this.returnUrl]);
    // }
  }

  // Getter pratique pour accéder facilement aux contrôles du formulaire dans le template
  get f() { 
    return this.loginForm.controls; 
  }

  // Gérer la soumission du formulaire
// Gérer la soumission du formulaire
onSubmit(): void {
  this.submitted = true;

  // Arrêter si le formulaire est invalide
  if (this.loginForm.invalid) {
    return;
  }

  this.loading = true;
  this.error = '';

  this.authService.login({
    email: this.f['email'].value,
    password: this.f['password'].value
  })
  .subscribe({
    next: (response) => {
      // Vérifier le rôle de l'utilisateur et rediriger en conséquence
      const userRole = response?.user?.role;
      
      if (userRole === 0) {
        // Rediriger vers le tableau de bord admin
        this.router.navigate(['/admin']);
      } else {
        // Rediriger vers la page d'accueil pour les autres utilisateurs
        this.router.navigate(['/']); // Ou '/' si c'est votre route d'accueil
      }
    },
    error: (error) => {
      // Gestion des différentes erreurs possibles
      if (error.status === 401) {
        this.error = 'LOGIN.INVALID_CREDENTIALS';
      } else if (error.status === 403) {
        this.error = 'LOGIN.ACCOUNT_DISABLED';
      } else {
        this.error = 'LOGIN.SERVER_ERROR';
      }
      this.loading = false;
    }
  });
}

  // Basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    passwordInput.type = this.showPassword ? 'text' : 'password';
  }
}