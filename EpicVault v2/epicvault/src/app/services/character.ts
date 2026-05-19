import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Character, InventoryItem, Money } from '../interfaces/character';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = 'http://localhost:4000/api/personajes';

  // Inyectamos el cliente HTTP (forma moderna)
  private http = inject(HttpClient);

  constructor() { }

  // 1. Crear personaje
  createCharacter(charData: Partial<Character>): Observable<Character> {
    return this.http.post<Character>(this.apiUrl, charData);
  }

  // 2. Obtener personajes de una campaña
  getCharactersByCampaign(campaignId: string): Observable<Character[]> {
    return this.http.get<Character[]>(`${this.apiUrl}/campaign/${campaignId}`);
  }

  // 3. Editar datos principales (nivel, clase, etc.)
  updateCharacter(id: string, data: Partial<Character>): Observable<Character> {
    return this.http.patch<Character>(`${this.apiUrl}/${id}`, data);
  }

  // 4. Actualizar el dinero
  updateMoney(id: string, data: { public_money: Money, private_money: Money }): Observable<Character> {
    return this.http.patch<Character>(`${this.apiUrl}/${id}/money`, data);
  }

  updatePartialCharacter(id: string, data: Partial<Character>): Observable<Character> {
    return this.http.patch<Character>(`${this.apiUrl}/${id}`, data);
  }

  // 5. Añadir objeto al inventario
  addToInventory(id: string, item: Partial<InventoryItem>): Observable<Character> {
    return this.http.post<Character>(`${this.apiUrl}/${id}/inventory`, item);
  }

  // 6. Editar un objeto del inventario
  updateInventoryItem(id: string, itemId: string, itemData: Partial<InventoryItem>): Observable<Character> {
    return this.http.patch<Character>(`${this.apiUrl}/${id}/inventory/${itemId}`, itemData);
  }

  // 7. Borrar objeto del inventario
  removeFromInventory(id: string, itemId: string): Observable<Character> {
    return this.http.delete<Character>(`${this.apiUrl}/${id}/inventory/${itemId}`);
  }

  // 8. Borrar personaje
  deleteCharacter(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}