import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campaign } from '../interfaces/campaign';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/campanas';

  // 1. GET: Obtener todas las campañas de un usuario específico
  getUserCampaigns(userId: string): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/usuario/${userId}`);
  }

  // 2. GET: Obtener UNA campaña por su ID (para el "Lobby")
  getCampaignById(campaignId: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${campaignId}`);
  }

  // 3. POST: Crear una nueva campaña (Modificado para usar FormData)
  createCampaign(campaignData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, campaignData);
  }

  // 4. PUT: Actualizar una campaña (Modificado para usar FormData)
  updateCampaign(campaignId: string, campaignData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${campaignId}`, campaignData);
  }

  // 5. DELETE: Eliminar una campaña de la existencia
  deleteCampaign(campaignId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${campaignId}`);
  }

  // A. Invitar amigo directamente (Entra al instante)
  inviteFriendDirect(campaignId: string, dmId: string, friendId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${campaignId}/invite-direct`, { dmId, friendId });
  }

  // B. Invitar a un aventurero (Se va a la sala de espera y requiere que él acepte)
  inviteUser(campaignId: string, dmId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${campaignId}/invite`, { dmId, userId });
  }

  // C. Unirse por Código Mágico (El jugador lo teclea, requiere que el DM acepte)
  joinByCode(joinCode: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/join/code`, { join_code: joinCode, userId });
  }

  // D. Jugador responde a una invitación (Sí o No a INVITE_RECEIVED)
  respondToInvite(campaignId: string, userId: string, accept: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${campaignId}/respond-invite`, { userId, accept });
  }

  // E. DM responde a una petición de código (Sí o No a JOIN_REQUEST)
  respondToJoinRequest(campaignId: string, dmId: string, userId: string, accept: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${campaignId}/respond-request`, { dmId, userId, accept });
  }

  // Dentro de CampaignService
  getCampaign(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Expulsar a un jugador de la campaña
  removePlayer(campaignId: string, playerId: string) {
    return this.http.delete(`${this.apiUrl}/${campaignId}/players/${playerId}`);
  }

  // CANCELAR INVITACIÓN 
  cancelInvite(campaignId: string, inviteId: string) {
    return this.http.delete(`${this.apiUrl}/${campaignId}/invites/${inviteId}`);
  }
}
