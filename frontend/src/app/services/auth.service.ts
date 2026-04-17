import { Injectable, signal } from '@angular/core';
import { HttpClient }          from '@angular/common/http';
import { Router }              from '@angular/router';
import { tap, catchError }     from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment }         from '../../environments/environment';

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  tokenType:    string;
  expiresIn:    number;
  user:         UserProfile;
}

export interface UserProfile {
  id:         number;
  username:   string;
  email:      string;
  fullName:   string;
  avatarUrl:  string;
  role:       string;
  isVerified: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = environment.apiUrl;

  // Реактивное состояние (Angular 17 Signals)
  currentUser = signal<UserProfile | null>(this.loadUser());
  isLoggedIn  = signal<boolean>(!!this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  isFirstLogin(): boolean { return !localStorage.getItem('onboarded'); }

  // ─── Регистрация ──────────────────────────────────────────
  register(data: { username: string; email: string; password: string; fullName?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/register`, data).pipe(
      tap(res => this.saveSession(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ─── Вход ─────────────────────────────────────────────────
  login(emailOrUsername: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, { emailOrUsername, password }).pipe(
      tap(res => this.saveSession(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ─── Выход ────────────────────────────────────────────────
  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.API}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe();
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ─── Обновить токен ───────────────────────────────────────
  refreshToken(): Observable<AuthResponse> {
    const refresh = localStorage.getItem('refresh_token') ?? '';
    return this.http.post<AuthResponse>(`${this.API}/auth/refresh`, {}, {
      headers: { 'Refresh-Token': refresh }
    }).pipe(tap(res => this.saveSession(res)));
  }

  // ─── Helpers ──────────────────────────────────────────────
  getToken(): string | null { return localStorage.getItem('access_token'); }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('access_token',  res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  private loadUser(): UserProfile | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
