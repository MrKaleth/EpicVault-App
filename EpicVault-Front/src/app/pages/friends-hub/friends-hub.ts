import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FriendService } from '../../services/friend';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-friends-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './friends-hub.html'
})
export class FriendsHub implements OnInit {
  friendService = inject(FriendService);
  authService = inject(AuthService);

  tabActiva = signal<'amigos' | 'enviadas' | 'buscar'>('amigos');

  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  misAmigos = signal<any[]>([]);

  solicitudesEnviadas = signal<any[]>([]);

  mensajeFeedback = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) {
        this.cargarDatosSociales();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.cargarDatosSociales();
  }

  cargarDatosSociales() {
    const user = this.authService.currentUser();
    if (!user) return;

    if (user.friends && user.friends.length > 0) {
      this.friendService.getUsersByIds(user.friends).subscribe({
        next: (res) => this.misAmigos.set(res),
        error: (err) => console.error('Error cargando amigos:', err)
      });
    } else {
      this.misAmigos.set([]);
    }


    if (user.sent_friend_requests && user.sent_friend_requests.length > 0) {
      this.friendService.getUsersByIds(user.sent_friend_requests).subscribe({
        next: (res) => this.solicitudesEnviadas.set(res),
        error: (err) => console.error('Error cargando peticiones enviadas:', err)
      });
    } else {
      this.solicitudesEnviadas.set([]);
    }
  }

  buscarAventureros() {
    const query = this.searchQuery();
    if (query.trim().length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.friendService.searchUsers(query).subscribe({
      next: (res) => {
        const miId = this.authService.currentUser()?._id;
        this.searchResults.set(res.filter(u => u._id !== miId));
      }
    });
  }

  enviarSolicitud(amigoId: string) {
    const miId = this.authService.currentUser()?._id;
    if (!miId) return;

    this.friendService.sendFriendRequest(miId, amigoId).subscribe({
      next: (resp: any) => {
        this.mostrarMensaje(resp.message);
        this.authService.updateLocalUser(resp.user);
      },
      error: (err) => this.mostrarMensaje(err.error.message || 'Error al enviar cuervo')
    });
  }

  cancelarSolicitud(receptorId: string) {
    const miId = this.authService.currentUser()?._id;
    if (!miId) return;

    this.friendService.cancelFriendRequest(miId, receptorId).subscribe({
      next: (resp: any) => {
        this.mostrarMensaje(resp.message);
        this.authService.updateLocalUser(resp.user);
      },
      error: (err) => this.mostrarMensaje('Error al cancelar la solicitud.')
    });
  }

  eliminarAmigo(amigoId: string) {
    if (!confirm('¿Estás seguro de que deseas expulsar a este aventurero de tu gremio?')) return;

    const miId = this.authService.currentUser()?._id;
    if (!miId) return;

    this.friendService.removeFriend(miId, amigoId).subscribe({
      next: (resp: any) => {
        this.mostrarMensaje(resp.message);
        this.authService.updateLocalUser(resp.user);
      },
      error: (err) => this.mostrarMensaje('Error al eliminar al amigo.')
    });
  }

  private mostrarMensaje(texto: string) {
    this.mensajeFeedback.set(texto);
    setTimeout(() => this.mensajeFeedback.set(null), 3000);
  }
}