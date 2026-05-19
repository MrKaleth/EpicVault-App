import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './user-create.html',
  styleUrl: './user-create.css'
})
export class UserCreateComponent {

  private userService = inject(UserService);
  private router = inject(Router);

  // Inicializamos con TODOS los campos
  nuevoUsuario: User = {
    username: '',
    email: '',
    password_hash: '', // Aquí escribiremos la contraseña en texto plano
    avatar_url: '',
    verified: false,   // Por defecto no verificado
    global_roles: ['USER'] // Por defecto rol USER
  };

  crearUsuario() {
    this.userService.createUser(this.nuevoUsuario).subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (e) => {
        console.error(e);
        alert('Error al crear usuario');
      }
    });
  }
}