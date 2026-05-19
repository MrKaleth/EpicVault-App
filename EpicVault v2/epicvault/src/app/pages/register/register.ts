import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  userData = {
    username: '',
    email: '',
    password_hash: ''
  };

  mensaje = '';
  esError = false;

  registrar() {
  this.http.post('http://localhost:4000/api/register', this.userData)
    .subscribe({
      next: (resp: any) => {
        this.esError = false;
        this.mensaje = resp.message || '¡Registro completado!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.esError = true;
        this.mensaje = err.error?.message || 'Error de conexión con el servidor';
        console.error('Detalle del error:', err);
      }
    });
}
}