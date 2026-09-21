import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css'
})
export class UserDetailComponent implements OnInit {

  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef); // ⏰ El despertador

  usuario: User = {
    username: '',
    email: '',
    password_hash: ''
  };

  ngOnInit(): void {
    // 1. Obtener el ID de la URL
    const id = this.route.snapshot.paramMap.get('id');

    // 2. Cargar los datos de ese usuario
    if (id) {
      this.userService.getUser(id).subscribe({
        next: (data) => {
          this.usuario = data;
          this.cd.detectChanges(); // Forzamos actualización
        },
        error: (e) => console.error(e)
      });
    }
  }

  actualizarUsuario() {
    if (this.usuario._id) {
      this.userService.updateUser(this.usuario._id, this.usuario).subscribe({
        next: () => {
          this.router.navigate(['/usuarios']);
        },
        error: (e) => alert('Error al actualizar')
      });
    }
  }
}