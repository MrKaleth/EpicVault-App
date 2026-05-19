import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FriendService } from '../../services/friend';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-profile.html'
})
export class PublicProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private friendService = inject(FriendService);
  authService = inject(AuthService);

  user = signal<any>(null);
  cargando = signal(true);
  error = signal(false);
  mensajeFeedback = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPerfil(id);
    }
  }

  cargarPerfil(id: string) {
    this.friendService.getPublicProfile(id).subscribe({
      next: (perfil) => {
        this.user.set(perfil);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  enviarSolicitud() {
    const miId = this.authService.currentUser()?._id;
    const amigoId = this.user()?._id;

    if (!miId || !amigoId) return;

    this.friendService.sendFriendRequest(miId, amigoId).subscribe({
      next: (resp: any) => {
        this.mensajeFeedback.set(resp.message);
        setTimeout(() => this.mensajeFeedback.set(null), 3000);
      },
      error: (err) => {
        this.mensajeFeedback.set(err.error.message || 'Error al enviar cuervo.');
        setTimeout(() => this.mensajeFeedback.set(null), 3000);
      }
    });
  }

  yaSonAmigos(): boolean {
    const miId = this.authService.currentUser()?._id;
    return this.user()?.friends.some((f: any) => f._id === miId || f === miId);
  }
}