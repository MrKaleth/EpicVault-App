import { Component, signal, inject, effect, computed } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from './services/auth';
import { NotificationService } from './services/notification';
import { FriendService } from './services/friend';
import { CampaignService } from './services/campaign';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private friendService = inject(FriendService);
  private campaignService = inject(CampaignService);

  protected readonly title = signal('EpicVault');

  notificaciones = signal<any[]>([]);

  notificacionesNoLeidas = computed(() => {
    return this.notificaciones().filter(n => !n.read).length;
  });

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) {
        this.cargarNotificaciones();
      } else {
        this.notificaciones.set([]);
      }
    }, { allowSignalWrites: true });
  }


  cargarNotificaciones() {
    const user = this.authService.currentUser();
    if (!user || !user._id) return;

    this.notificationService.getNotificaciones(user._id).subscribe({
      next: (res) => this.notificaciones.set(res),
      error: (err) => console.error('Error al interceptar los cuervos:', err)
    });
  }

  marcarBuzonLeido() {
    const user = this.authService.currentUser();
    if (!user || !user._id || this.notificacionesNoLeidas() === 0) return;

    this.notificationService.marcarTodasComoLeidas(user._id).subscribe({
      next: () => {
        this.notificaciones.update(notifs => notifs.map(n => ({ ...n, read: true })));
      }
    });
  }

  limpiarBuzon() {
    this.notificaciones.update(notifs => notifs.filter(n => !n.read));
  }

  accionar(notificacion: any, aceptar: boolean) {
    const miId = this.authService.currentUser()?._id;
    if (!miId || !notificacion.sender) return;

    const solicitanteId = notificacion.sender._id;


    if (notificacion.type === 'FRIEND_REQUEST') {
      if (aceptar) {
        this.friendService.acceptFriendRequest(miId, solicitanteId).subscribe({
          next: (res: any) => {
            this.authService.updateLocalUser(res.user);
            this.cargarNotificaciones();
          }
        });
      } else {
        this.friendService.rejectFriendRequest(miId, solicitanteId).subscribe({
          next: (res: any) => {
            this.authService.updateLocalUser(res.user);
            this.cargarNotificaciones();
          }
        });
      }
    }


    const campaignId = notificacion.campaign?._id;

    if (notificacion.type === 'INVITE_RECEIVED' && campaignId) {
      this.campaignService.respondToInvite(campaignId, miId, aceptar).subscribe({
        next: (res: any) => {
          if (res.user) this.authService.updateLocalUser(res.user);
          this.cargarNotificaciones();
        },
        error: (err) => console.error('Fallo al responder al DM:', err)
      });
    }

    if (notificacion.type === 'JOIN_REQUEST' && campaignId) {
      this.campaignService.respondToJoinRequest(campaignId, miId, solicitanteId, aceptar).subscribe({
        next: () => {
          this.cargarNotificaciones();
        },
        error: (err) => console.error('Fallo al gestionar al recluta:', err)
      });
    }
  }

  isLightMode = false;

  toggleTheme() {
    this.isLightMode = !this.isLightMode;

    if (this.isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }
}