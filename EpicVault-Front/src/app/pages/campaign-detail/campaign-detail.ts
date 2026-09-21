import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CampaignService } from '../../services/campaign';
import { AuthService } from '../../services/auth';
import { FriendService } from '../../services/friend';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-detail.html'
})
export class CampaignDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private campaignService = inject(CampaignService);
  public authService = inject(AuthService);
  private friendService = inject(FriendService);
  private cdr = inject(ChangeDetectorRef);

  campaign: any = null;
  isLoading: boolean = true;
  isDM: boolean = false;

  showDeleteModal: boolean = false;
  deleteConfirmText: string = '';
  isDeleting: boolean = false;

  showInviteModal: boolean = false;
  showManageModal: boolean = false; 
  myFriends: any[] = [];
  searchResults: any[] = [];
  searchQuery: string = '';
  feedbackMessage: string = '';

  ngOnInit() {
    this.loadCampaign();
  }

  loadCampaign() {
    const campaignId = this.route.snapshot.paramMap.get('id');
    if (!campaignId) return;

    this.campaignService.getCampaignById(campaignId).subscribe({
      next: (data) => {
        this.campaign = data;
        this.checkIfDM();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la sala', err);
        this.router.navigate(['/campanas']);
      }
    });
  }

  checkIfDM() {
    const currentUserId = this.authService.currentUser()?._id;
    if (this.campaign && this.campaign.dungeon_master) {
      this.isDM = this.campaign.dungeon_master._id === currentUserId;
      if (this.isDM) {
        this.loadMyFriends();
      }
    }
  }

 
  isUserInvolved(userId: string): boolean {
    if (!this.campaign) return false;

    const isDM = this.campaign.dungeon_master?._id === userId;
    const isPlayer = this.campaign.players?.some((p: any) => p._id === userId);

    const isPending = this.campaign.pending_invites?.some((p: any) => {
      return typeof p === 'string' ? p === userId : p._id === userId;
    });

    return isDM || isPlayer || isPending;
  }



  openInviteModal() {
    this.showInviteModal = true;
    this.searchQuery = '';
    this.searchResults = [];
    this.loadMyFriends();
  }

  closeInviteModal() {
    this.showInviteModal = false;
  }

  copyJoinCode() {
    if (!this.campaign?.join_code) return;
    navigator.clipboard.writeText(this.campaign.join_code).then(() => {
      this.showMessage('¡Código mágico copiado! 📋');
    });
  }

  loadMyFriends() {
    const user = this.authService.currentUser();
    if (user && user.friends && user.friends.length > 0) {
      this.friendService.getUsersByIds(user.friends).subscribe({
        next: (res) => {
          this.myFriends = res.filter(f => !this.isUserInvolved(f._id));
        },
        error: (err) => console.error('Error cargando amigos', err)
      });
    }
  }

  inviteFriend(friendId: string) {
    if (this.isUserInvolved(friendId)) {
      this.showMessage('Este aventurero ya está en tu lista o ha sido convocado.');
      return;
    }

    const dmId = this.authService.currentUser()?._id;
    if (!dmId || !this.campaign) return;

    this.campaignService.inviteFriendDirect(this.campaign._id, dmId, friendId).subscribe({
      next: () => {
        this.showMessage('¡Amigo invocado con éxito! 🦅');
        this.loadCampaign();
      },
      error: (err) => this.showMessage(err.error?.message || 'La invocación falló.')
    });
  }

  searchUsers() {
    if (this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    this.friendService.searchUsers(this.searchQuery).subscribe({
      next: (res) => {
        const myId = this.authService.currentUser()?._id;
        this.searchResults = res.filter(u => u._id !== myId && !this.isUserInvolved(u._id));
      }
    });
  }

  sendInvite(userId: string) {
    if (this.isUserInvolved(userId)) {
      this.showMessage('Ya hay un cuervo en camino para este usuario.');
      return;
    }

    const dmId = this.authService.currentUser()?._id;
    if (!dmId || !this.campaign) return;

    this.campaignService.inviteUser(this.campaign._id, dmId, userId).subscribe({
      next: () => {
        this.showMessage('Invitación enviada. ⏳');
        this.loadCampaign();
      },
      error: (err) => this.showMessage(err.error?.message || 'No se pudo enviar el cuervo.')
    });
  }

  removePlayer(playerId: string) {
    if (!this.isDM || !this.campaign) return;

    if (confirm('🚪 ¿Estás seguro de que deseas expulsar a este aventurero de la campaña?')) {
      this.campaignService.removePlayer(this.campaign._id, playerId).subscribe({
        next: () => {
          this.showMessage('Aventurero expulsado de la party.');
          this.loadCampaign();
        },
        error: (err: any) => this.showMessage(err.error?.message || 'Error al expulsar al jugador.')
      });
    }
  }

  cancelInvite(inviteId: string) {
    if (!this.isDM || !this.campaign) return;

    this.campaignService.cancelInvite(this.campaign._id, inviteId).subscribe({
      next: () => {
        this.showMessage('Invitación cancelada. El cuervo ha regresado.');
        this.loadCampaign();
      },
      error: (err: any) => this.showMessage(err.error?.message || 'Error al cancelar la invitación.')
    });
  }

  private showMessage(msg: string) {
    this.feedbackMessage = msg;
    setTimeout(() => this.feedbackMessage = '', 3000);
  }

  openDeleteModal() {
    this.showDeleteModal = true;
    this.deleteConfirmText = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    if (this.deleteConfirmText !== this.campaign.name) return;
    this.isDeleting = true;
    this.campaignService.deleteCampaign(this.campaign._id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/campanas']);
      },
      error: () => this.isDeleting = false
    });
  }
}