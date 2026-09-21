import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CampaignService } from '../../services/campaign';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-list.html'
})
export class CampaignList implements OnInit {
  private campaignService = inject(CampaignService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  campaigns: any[] = [];
  filteredCampaigns: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  joinCode: string = '';
  joinFeedback: { type: 'success' | 'error', message: string } | null = null;
  isJoining: boolean = false;

  ngOnInit() {
    this.loadMyCampaigns();
  }

  loadMyCampaigns() {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser._id) return;

    this.campaignService.getUserCampaigns(currentUser._id).subscribe({
      next: (data) => {
        this.campaigns = data;
        this.filteredCampaigns = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando campañas', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterCampaigns() {
    if (!this.searchTerm) {
      this.filteredCampaigns = this.campaigns;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCampaigns = this.campaigns.filter(c =>
        c.name.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  isMyCampaign(campaign: any): boolean {
    const currentUserId = this.authService.currentUser()?._id;
    return campaign.dungeon_master?._id === currentUserId;
  }

  unirsePorCodigo() {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser._id || !this.joinCode.trim()) return;

    this.isJoining = true;
    this.joinFeedback = null;
    this.cdr.detectChanges();

    this.campaignService.joinByCode(this.joinCode.trim().toUpperCase(), currentUser._id).subscribe({
      next: (res) => {
        this.isJoining = false;
        this.joinCode = ''; 
        this.joinFeedback = { type: 'success', message: '¡Llamada a la puerta enviada! Espera a que el DM te deje entrar. 🦅' };
        this.cdr.detectChanges();

        // Limpiamos el mensaje de éxito tras 4 segundos
        setTimeout(() => {
          this.joinFeedback = null;
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isJoining = false;
        this.joinFeedback = { type: 'error', message: err.error.message || 'El código mágico ha fallado. 🚫' };
        this.cdr.detectChanges();

        setTimeout(() => {
          this.joinFeedback = null;
          this.cdr.detectChanges();
        }, 4000);
      }
    });
  }
}