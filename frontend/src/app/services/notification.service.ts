import { Injectable, signal }  from '@angular/core';
import { HttpClient }          from '@angular/common/http';
import { WebSocketService }    from './websocket.service';
import { AuthService }         from './auth.service';
import { environment }         from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  unreadCount = signal(0);
  private api = `${environment.apiUrl}/notifications`;

  constructor(
    private http: HttpClient,
    private ws:   WebSocketService,
    private auth: AuthService
  ) {
    // Подписка на реалтайм уведомления
    this.ws.message$.subscribe(() => {
      this.unreadCount.update(n => n + 1);
    });
  }

  loadUnreadCount() {
    this.http.get<number>(`${this.api}/unread-count`).subscribe(n => {
      this.unreadCount.set(n);
    });
  }

  markAllRead() {
    return this.http.patch(`${this.api}/read-all`, {});
  }
}
