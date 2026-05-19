import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:4000/api/notificaciones';

  // 1. Obtener todas las notificaciones de un usuario
  getNotificaciones(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  // 2. Marcar una notificación como leída
  marcarComoLeida(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/leida`, {});
  }

  // 3. Marcar todo el buzón como leído
  marcarTodasComoLeidas(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/leidas-todas/${userId}`, {});
  }

  // 4. Eliminar un mensaje (opcional, para limpieza manual)
  eliminarNotificacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}