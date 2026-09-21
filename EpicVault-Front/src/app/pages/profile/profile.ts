import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html'
})
export class Profile {
  authService = inject(AuthService);

  codigoCopiado = signal(false);

  copiarCodigo(codigo: string | undefined) {
    if (!codigo) return;
    navigator.clipboard.writeText(codigo).then(() => {
      this.codigoCopiado.set(true);
      setTimeout(() => this.codigoCopiado.set(false), 2500); // El mensaje dura 2.5s
    }).catch(err => {
      console.error('Fallo al copiar el código arcano: ', err);
    });
  }
}