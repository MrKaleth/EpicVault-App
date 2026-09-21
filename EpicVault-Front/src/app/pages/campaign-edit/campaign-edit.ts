import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CampaignService } from '../../services/campaign';

@Component({
  selector: 'app-campaign-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-edit.html'
})
export class CampaignEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private campaignService = inject(CampaignService);
  private cdr = inject(ChangeDetectorRef); 

  campaignId: string = '';
  campaignData = { name: '', description: '' };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  isLoading: boolean = true;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.campaignId = this.route.snapshot.paramMap.get('id') || '';
    if (this.campaignId) {
      this.cargarDatosCampana();
    }
  }

  cargarDatosCampana() {
    this.campaignService.getCampaignById(this.campaignId).subscribe({
      next: (data) => {
        this.campaignData.name = data.name;
        this.campaignData.description = data.description;
        if (data.cover_url) {
          this.imagePreview = data.cover_url;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la campaña', err);
        this.router.navigate(['/campanas']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => {
        this.imagePreview = reader.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    if (!this.campaignData.name.trim()) return;

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('name', this.campaignData.name);
    formData.append('description', this.campaignData.description);

    if (this.selectedFile) {
      formData.append('cover_image', this.selectedFile);
    }

    this.campaignService.updateCampaign(this.campaignId, formData).subscribe({
      next: () => {
        this.router.navigate(['/campanas', this.campaignId]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Error al actualizar la campaña';
        this.cdr.detectChanges();
      }
    });
  }
}