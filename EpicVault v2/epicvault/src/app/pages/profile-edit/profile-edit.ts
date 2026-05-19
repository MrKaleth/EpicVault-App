import { Component, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-edit.html'
})
export class ProfileEdit {
  authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  userEdicion: any = { ...this.authService.currentUser() };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  guardando = signal(false);
  mensajeError = signal<string | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      // Crear previsualización local
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.cdr.detectChanges(); 
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    const id = this.userEdicion._id;
    if (!id) return;

    this.guardando.set(true);
    this.mensajeError.set(null);

    const formData = new FormData();
    formData.append('username', this.userEdicion.username);
    formData.append('email', this.userEdicion.email);

    if (this.selectedFile) {
      formData.append('avatar_image', this.selectedFile);
    }

    this.userService.updateUser(id, formData).subscribe({
      next: (resp: any) => {
        if (resp.user) {
          this.authService.updateLocalUser(resp.user);
          this.router.navigate(['/perfil']);
        }
      },
      error: (err) => {
        console.error(err);
        this.mensajeError.set(err.error?.message || 'Error arcano al actualizar el perfil.');
        this.guardando.set(false);
      }
    });
  }
}