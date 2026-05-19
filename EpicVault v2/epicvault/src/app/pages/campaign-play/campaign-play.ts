import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CampaignService } from '../../services/campaign';
import { AuthService } from '../../services/auth';
import { CharacterService } from '../../services/character';
import { NoteService } from '../../services/note';
import { Character } from '../../interfaces/character';
import { Note } from '../../interfaces/note';

@Component({
  selector: 'app-campaign-play',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-play.html'
})
export class CampaignPlay implements OnInit {
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private campaignService = inject(CampaignService);
  private characterService = inject(CharacterService);
  private noteService = inject(NoteService);
  private cdr = inject(ChangeDetectorRef);

  campaign: any;
  characters: Character[] = [];
  notes: Note[] = [];
  isLoading: boolean = true;
  isDM: boolean = false;

  activeTab: 'personajes' | 'inventario' | 'notas' = 'personajes';
  myCharacter: Character | null = null;

  newCharacter = { name: '', race: '', class: '' };
  newNote = { title: '', content: '', isPublic: false };
  editingNoteId: string | null = null;

  selectedCharacter: Character | null = null;
  isModalOpen: boolean = false;

  expenseAmount: number = 0;
  expenseType: 'pc' | 'pp' | 'pe' | 'po' | 'ppt' = 'po';
  newItem = { name: '', quantity: 1, description: '', isPublic: false };

  ngOnInit() {
    const campaignId = this.route.snapshot.paramMap.get('id');
    if (campaignId) {
      this.loadCampaignData(campaignId);
    }
  }

  loadCampaignData(campaignId: string) {
    const currentUser = this.authService.currentUser();
    this.campaignService.getCampaign(campaignId).subscribe({
      next: (campaignData: any) => {
        this.campaign = campaignData;
        this.isDM = currentUser?._id === this.campaign.dungeon_master._id;
        this.characterService.getCharactersByCampaign(campaignId).subscribe((chars: any[]) => {
          this.characters = chars;
          this.myCharacter = this.characters.find(c => c.user_id._id === currentUser?._id) || null;
          // Actualizar el personaje seleccionado si el modal está abierto
          if (this.selectedCharacter) {
            this.selectedCharacter = this.characters.find(c => c._id === this.selectedCharacter?._id) || null;
          }
          this.noteService.getCampaignNotes(campaignId).subscribe((notesData: any[]) => {
            this.notes = notesData;
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        });
      },
      error: (err: any) => {
        console.error('Error cargando datos', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'personajes' | 'inventario' | 'notas') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }


  saveMoneyChanges() {
    if (!this.selectedCharacter?._id) return;
    const data = {
      public_money: this.selectedCharacter.public_money,
      private_money: this.selectedCharacter.private_money
    };
    this.characterService.updateMoney(this.selectedCharacter._id, data).subscribe({
      next: () => {
        this.loadCampaignData(this.campaign._id);
      }
    });
  }

  restarDinero(esPublico: boolean) {
    if (!this.selectedCharacter || this.expenseAmount <= 0) return;

    const cartera = esPublico ? this.selectedCharacter.public_money : this.selectedCharacter.private_money;

    // Tabla de conversión a Cobre (pc)
    const tasas = { ppt: 1000, po: 100, pe: 50, pp: 10, pc: 1 };

    // 1. Calculamos el valor total actual en cobre (mirar hacia atrás)
    let totalCobre = (cartera.ppt * tasas.ppt) +
      (cartera.po * tasas.po) +
      (cartera.pe * tasas.pe) +
      (cartera.pp * tasas.pp) +
      cartera.pc;

    // 2. Calculamos el coste en cobre
    const costeCobre = this.expenseAmount * tasas[this.expenseType];

    if (totalCobre < costeCobre) {
      alert("¡Fondos insuficientes! No tienes suficiente valor total en la cartera.");
      return;
    }

    // 3. Restamos
    totalCobre -= costeCobre;

    // 4. Redistribuimos (optimización de monedas)
    cartera.ppt = Math.floor(totalCobre / tasas.ppt);
    totalCobre %= tasas.ppt;
    cartera.po = Math.floor(totalCobre / tasas.po);
    totalCobre %= tasas.po;
    cartera.pe = Math.floor(totalCobre / tasas.pe);
    totalCobre %= tasas.pe;
    cartera.pp = Math.floor(totalCobre / tasas.pp);
    cartera.pc = totalCobre % tasas.pp;

    this.expenseAmount = 0;
    this.saveMoneyChanges();
  }


  agregarItem() {
    if (!this.selectedCharacter?._id || !this.newItem.name) return;
    this.characterService.addToInventory(this.selectedCharacter._id, this.newItem).subscribe({
      next: () => {
        this.newItem = { name: '', quantity: 1, description: '', isPublic: false };
        this.loadCampaignData(this.campaign._id);
      }
    });
  }

  borrarItem(itemId: string | undefined) {
    if (!this.selectedCharacter?._id || !itemId) return;
    this.characterService.removeFromInventory(this.selectedCharacter._id, itemId).subscribe({
      next: () => this.loadCampaignData(this.campaign._id)
    });
  }


  crearPersonaje() {
    const currentUser = this.authService.currentUser();
    if (!this.campaign || !currentUser) return;
    const charData: Partial<Character> = {
      ...this.newCharacter,
      level: 1,
      user_id: currentUser._id,
      campaign_id: this.campaign._id,
      public_money: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 },
      private_money: { pc: 0, pp: 0, pe: 0, po: 0, ppt: 0 },
      inventory: []
    };
    this.characterService.createCharacter(charData).subscribe({
      next: () => this.loadCampaignData(this.campaign._id)
    });
  }

  getPartyTotal(coin: 'pc' | 'pp' | 'pe' | 'po' | 'ppt'): number {
    return this.characters.reduce((total, char) => total + (char.public_money?.[coin] || 0), 0);
  }

  guardarNota() {
    const currentUser = this.authService.currentUser();
    if (!this.campaign || !currentUser) return;

    if (this.editingNoteId) {
      this.noteService.updateNote(this.editingNoteId, this.newNote).subscribe({
        next: () => { this.cancelarEdicion(); this.loadCampaignData(this.campaign._id); }
      });
    } else {
      const noteData = { ...this.newNote, author_id: currentUser._id, campaign_id: this.campaign._id };
      this.noteService.createNote(noteData).subscribe({
        next: () => { this.cancelarEdicion(); this.loadCampaignData(this.campaign._id); }
      });
    }
  }

  cargarNotaParaEditar(nota: Note) {
    this.editingNoteId = nota._id || null;
    this.newNote = { title: nota.title, content: nota.content, isPublic: nota.isPublic };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.editingNoteId = null;
    this.newNote = { title: '', content: '', isPublic: false };
  }

  borrarNota(id: string | undefined) {
    if (id && confirm('¿Borrar crónica?')) {
      this.noteService.deleteNote(id).subscribe({ next: () => this.loadCampaignData(this.campaign._id) });
    }
  }

  borrarPersonaje(id: string | undefined) {
    if (id && confirm('☠️ ¿Eliminar personaje?')) {
      this.characterService.deleteCharacter(id).subscribe({
        next: () => {
          if (this.myCharacter?._id === id) this.myCharacter = null;
          this.loadCampaignData(this.campaign._id);
        }
      });
    }
  }

  abrirFicha(char: Character) {
    this.selectedCharacter = char;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  cerrarFicha() {
    this.selectedCharacter = null;
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  get tieneItemsPublicos(): boolean {
    return this.characters.some(char =>
      char.inventory.some(item => item.isPublic)
    );
  }
}