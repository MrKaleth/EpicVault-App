import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  creds = {
    email: '',
    password_hash: ''
  };

  errorMsg: string = '';


  login() {
    this.errorMsg = '';

    this.authService.login(this.creds).subscribe({
      next: (user) => {
        console.log('Login correcto:', user);
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error('Error login:', err);
        this.errorMsg = 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
      }
    });
  }
}