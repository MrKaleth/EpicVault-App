import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:4000/usuarios';

  private http = inject(HttpClient);

  constructor() { }

  // 1. Obtener todos (Listado)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // 2. Obtener uno (Para Detalle/Editar)
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // 3. Crear (Formulario Crear)
  createUser(user: User): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  // 4. Editar (¡MODIFICADO PARA ACEPTAR IMÁGENES MEDIANTE FORMDATA!)
  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  // 5. Eliminar (Botón Eliminar)
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}