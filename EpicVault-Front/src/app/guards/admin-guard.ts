import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdminOrModerator()) return true;

  console.warn('Acceso denegado: Insuficientes privilegios.');
  router.navigate(['/inicio']); 
  return false;
};