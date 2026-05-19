import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CampaignService } from '../../services/campaign';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-campaign-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-create.html'
})
export class CampaignCreate {
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private router = inject(Router);

  campaignData = { name: '', description: '' };
  selectedFile: File | null = null; 
  imagePreview: string | ArrayBuffer | null = null; 

  errorMessage: string = '';
  isSubmitting: boolean = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  crearCampana() {
    const currentUser = this.authService.currentUser();
    if (!currentUser?._id) return;
    if (!this.campaignData.name.trim()) return;

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('name', this.campaignData.name);
    formData.append('description', this.campaignData.description);
    formData.append('dungeon_master', currentUser._id);

    if (this.selectedFile) {
      formData.append('cover_image', this.selectedFile); 
    }

    this.campaignService.createCampaign(formData).subscribe({
      next: () => this.router.navigate(['/campanas']),
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Error al crear la campaña';
      }
    });
  }
}