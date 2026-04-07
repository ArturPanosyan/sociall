import { inject }            from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }       from '../services/auth.service';

// ─── authGuard: только для авторизованных ─────────────────────
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};

// ─── guestGuard: только для гостей ────────────────────────────
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  router.navigate(['/feed']);
  return false;
};
