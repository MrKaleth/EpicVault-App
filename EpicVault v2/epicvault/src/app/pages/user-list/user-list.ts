import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit {

  private userService = inject(UserService);
  private cd = inject(ChangeDetectorRef);

  listaUsuarios: User[] = [];

  // ✅ NUEVO: Variable para controlar si mostramos todo
  modoAvanzado: boolean = false;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // ✅ NUEVO: Función para activar/desactivar el modo
  toggleModoAvanzado() {
    this.modoAvanzado = !this.modoAvanzado;
  }

  cargarUsuarios() {
    this.userService.getUsers().subscribe({
      next: (datos) => {
        console.log('Usuarios recibidos:', datos);
        this.listaUsuarios = datos;
        this.cd.detectChanges();
      },
      error: (e) => console.error('Error cargando usuarios:', e)
    });
  }

  eliminarUsuario(id: string | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de borrar este usuario? Esta acción no se puede deshacer.')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (e) => alert('Error al eliminar usuario')
      });
    }
  }
}