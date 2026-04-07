import { Injectable }       from '@angular/core';
import { SwPush }           from '@angular/service-worker';
import { HttpClient }       from '@angular/common/http';
import { environment }      from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {

  // VAPID ключ — сгенерировать: npx web-push generate-vapid-keys
  private readonly VAPID_PUBLIC_KEY =
    'YOUR_VAPID_PUBLIC_KEY_HERE';

  constructor(private swPush: SwPush, private http: HttpClient) {}

  // ─── Запросить разрешение и подписаться ──────────────────
  async subscribe(): Promise<void> {
    if (!this.swPush.isEnabled) {
      console.warn('Service Worker is not enabled');
      return;
    }

    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      // Сохранить подписку на сервере
      await this.http.post(`${environment.apiUrl}/push/subscribe`, sub).toPromise();
      console.log('Push subscription active');
    } catch (e) {
      console.warn('Push subscription failed:', e);
    }
  }

  // ─── Слушать push уведомления ─────────────────────────────
  listenForMessages(): void {
    this.swPush.messages.subscribe((msg: any) => {
      console.log('Push received:', msg);
      // Показать встроенный notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(msg.notification?.title || 'SocialNet', {
          body: msg.notification?.body || '',
          icon: '/assets/icons/icon-192x192.png',
          badge: '/assets/icons/icon-96x96.png'
        });
      }
    });

    // Клик по уведомлению → открыть нужную страницу
    this.swPush.notificationClicks.subscribe(({ notification }) => {
      const url = notification.data?.url || '/notifications';
      window.open(url, '_blank');
    });
  }
}
