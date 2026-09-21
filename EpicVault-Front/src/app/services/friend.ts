import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:4000/api/amigos';

  constructor() { }

  // 1. BUSCAR USUARIOS (Por nombre o código DARI#1234)
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar?q=${query}`);
  }

  // 2. OBTENER PERFIL PÚBLICO
  getPublicProfile(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/perfil/${id}`);
  }

  // 3. ENVIAR SOLICITUD DE AMISTAD
  sendFriendRequest(miId: string, amigoId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitar`, { miId, amigoId });
  }

  // 4. ACEPTAR SOLICITUD
  acceptFriendRequest(miId: string, solicitanteId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/aceptar`, { miId, solicitanteId });
  }

  // 5. RECHAZAR SOLICITUD
  rejectFriendRequest(miId: string, solicitanteId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rechazar`, { miId, solicitanteId });
  }

  // 6. OBTENER VARIOS PERFILES (Para tu lista de amigos)
  getUsersByIds(ids: string[]): Observable<any[]> {
    // Enviamos los IDs como una lista separada por comas
    return this.http.get<any[]>(`${this.apiUrl}/lista?ids=${ids.join(',')}`);
  }

  // 7. CANCELAR SOLICITUD ENVIADA
  cancelFriendRequest(miId: string, receptorId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancelar`, { miId, receptorId });
  }

  // 8. ELIMINAR AMIGO
  removeFriend(miId: string, amigoId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/eliminar`, { miId, amigoId });
  }
}