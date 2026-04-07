import { Injectable }             from '@angular/core';
import { HttpInterceptorFn,
         HttpRequest, HttpHandlerFn,
         HttpErrorResponse }       from '@angular/common/http';
import { inject }                  from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService }             from '../services/auth.service';
import { Router }                  from '@angular/router';

// Functional interceptor (Angular 17+)
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  // Пропускаем public эндпоинты
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Добавляем токен
  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 → попробовать обновить токен
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return auth.refreshToken().pipe(
          switchMap(res => {
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${res.accessToken}`)
            });
            return next(retryReq);
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
