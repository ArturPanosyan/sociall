import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { RouterLink }                from '@angular/router';
import { HttpClient }                from '@angular/common/http';
import { environment }               from '../../../environments/environment';

interface NotifSender {
  username: string;
  avatarUrl: string;
  fullName: string;
}

interface Notification {
  id:         number;
  type:       string;
  message:    string;
  sender:     NotifSender | null;
  entityType: string;
  entityId:   number;
  isRead:     boolean;
  createdAt:  string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="max-w-2xl mx-auto px-4 py-6">

  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
    @if (unread() > 0) {
      <button (click)="markAllRead()"
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
        Mark all as read
      </button>
    }
  </div>

  @if (loading()) {
    <div class="space-y-3">
      @for (i of [1,2,3,4,5]; track i) {
        <div class="bg-white rounded-2xl p-4 animate-pulse flex gap-3">
          <div class="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-1/3"></div>
          </div>
        </div>
      }
    </div>
  } @else if (notifications().length) {
    <div class="space-y-2">
      @for (notif of notifications(); track notif.id) {
        <div class="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm transition"
             [class.border-l-4]="!notif.isRead"
             [class.border-indigo-500]="!notif.isRead">

          <div class="relative flex-shrink-0">
            <img [src]="notif.sender?.avatarUrl || '/assets/default-avatar.png'"
                 class="w-12 h-12 rounded-full object-cover">
            <span class="absolute -bottom-1 -right-1 text-base">{{ iconFor(notif.type) }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-800">
              <a [routerLink]="['/profile', notif.sender?.username]"
                 class="font-semibold hover:text-indigo-600">
                {{ notif.sender?.fullName || notif.sender?.username }}
              </a>
              {{ stripSenderName(notif) }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">{{ timeAgo(notif.createdAt) }}</p>
          </div>

          @if (!notif.isRead) {
            <div class="w-2.5 h-2.5 bg-indigo-600 rounded-full flex-shrink-0 mt-1"></div>
          }
        </div>
      }
    </div>
  } @else {
    <div class="text-center py-20 text-gray-400">
      <p class="text-5xl mb-4">🔔</p>
      <p class="font-medium text-lg">All caught up!</p>
      <p class="text-sm mt-1">No new notifications</p>
    </div>
  }
</div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  loading       = signal(true);
  unread        = signal(0);
  private api   = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any>(this.api).subscribe({
      next: res => {
        this.notifications.set(res.content || []);
        this.unread.set((res.content || []).filter((n: Notification) => !n.isRead).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markAllRead() {
    this.http.patch(`${this.api}/read-all`, {}).subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      this.unread.set(0);
    });
  }

  stripSenderName(notif: Notification): string {
    const name = notif.sender?.fullName || notif.sender?.username || '';
    return notif.message.replace(name, '').trim();
  }

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      LIKE: '❤️', COMMENT: '💬', FOLLOW: '👤',
      MENTION: '📣', MESSAGE: '✉️', SYSTEM: '⚙️'
    };
    return icons[type] ?? '🔔';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min  = Math.floor(diff / 60000);
    if (min < 1)  return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr  < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  }
}
