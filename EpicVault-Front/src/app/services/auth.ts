import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user';
import { tap, catchError, throwError, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:4000/api';

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());
  successMessage = signal<string | null>(null);

  isAdminOrModerator = computed(() => {
    const user = this.currentUser();
    return user?.global_roles?.some(role => ['ADMIN', 'MODERATOR'].includes(role)) ?? false;
  });

  constructor() {
    const savedUser = localStorage.getItem('epicvault_user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('epicvault_user');
      }
    }
  }

  login(credentials: { email: string; password_hash: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
      tap((user: User) => {
        this.currentUser.set(user);
        localStorage.setItem('epicvault_user', JSON.stringify(user));
        this.router.navigate(['/perfil']);
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => new Error('Credenciales incorrectas'));
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('epicvault_user');
    this.router.navigate(['/login']);
  }

  updateLocalUser(newUser: User) {
    if (!newUser || !newUser.email) return;

    
    this.currentUser.set({ ...newUser });
    localStorage.setItem('epicvault_user', JSON.stringify(newUser));

    this.successMessage.set('¡Bóveda actualizada! ✨');
    setTimeout(() => this.successMessage.set(null), 3000);
  }



}