import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../interfaces/note';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:4000/api/notas';

  private http = inject(HttpClient);

  constructor() { }

  // 1. Obtener notas de una campaña
  getCampaignNotes(campaignId: string): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/campaign/${campaignId}`);
  }

  // 2. Crear nota
  createNote(noteData: Partial<Note>): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, noteData);
  }

  // 3. Editar nota
  updateNote(id: string, noteData: Partial<Note>): Observable<Note> {
    return this.http.patch<Note>(`${this.apiUrl}/${id}`, noteData);
  }

  // 4. Borrar nota
  deleteNote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}