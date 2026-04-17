import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../../environments/environment';

interface Notif {
  id: number; type: string; message: string;
  sender: { username: string; avatarUrl: string; fullName: string } | null;
  entityType: string; entityId: number;
  isRead: boolean; createdAt: string;
}

@Component({
  selector: 'app-notifications', standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div style="max-width:680px;margin:0 auto;padding:20px 16px">

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">Notifications</h1>
    @if (unread() > 0) {
      <button (click)="markAll()"
              style="font-size:13px;color:#6366f1;background:none;border:none;cursor:pointer;font-weight:500">
        Mark all read
      </button>
    }
  </div>

  <!-- Tab filter -->
  <div style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto">
    @for (t of tabs; track t.id) {
      <button (click)="activeTab=t.id"
              style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;
                     cursor:pointer;white-space:nowrap;transition:all .15s"
              [style.background]="activeTab===t.id ? '#6366f1' : 'var(--bg-primary,#fff)'"
              [style.color]="activeTab===t.id ? '#fff' : 'var(--text-primary,#111)'"
              [style.border]="activeTab===t.id ? 'none' : '0.5px solid var(--border,#e5e7eb)'">
        {{ t.label }}
      </button>
    }
  </div>

  @if (loading()) {
    @for (i of [1,2,3,4,5]; track i) {
      <div style="display:flex;gap:12px;padding:14px;margin-bottom:8px;border-radius:14px;
                  background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);animation:pulse 1.5s infinite">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--bg-secondary,#f9fafb);flex-shrink:0"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px;justify-content:center">
          <div style="height:12px;background:var(--bg-secondary,#f9fafb);border-radius:4px;width:60%"></div>
          <div style="height:10px;background:var(--bg-secondary,#f9fafb);border-radius:4px;width:30%"></div>
        </div>
      </div>
    }
  } @else {
    @for (n of filtered(); track n.id) {
      <div style="display:flex;align-items:center;gap:12px;padding:14px;margin-bottom:6px;
                  border-radius:14px;border:0.5px solid;transition:all .15s;cursor:pointer"
           [style.background]="n.isRead ? 'var(--bg-primary,#fff)' : '#eef2ff'"
           [style.borderColor]="n.isRead ? 'var(--border,#e5e7eb)' : '#c7d2fe'"
           (click)="markRead(n)">

        <!-- Avatar with type icon -->
        <div style="position:relative;flex-shrink:0">
          <div style="width:44px;height:44px;border-radius:50%;background:#6366f1;
                      display:flex;align-items:center;justify-content:center;
                      color:#fff;font-size:15px;font-weight:500;overflow:hidden">
            @if (n.sender?.avatarUrl) {
              <img [src]="n.sender!.avatarUrl" style="width:100%;height:100%;object-fit:cover">
            } @else {
              {{ n.sender?.username?.charAt(0)?.toUpperCase() || '?' }}
            }
          </div>
          <div style="position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;
                      border-radius:50%;border:2px solid var(--bg-primary,#fff);
                      display:flex;align-items:center;justify-content:center;font-size:10px"
               [style.background]="typeColor(n.type)">
            {{ typeIcon(n.type) }}
          </div>
        </div>

        <!-- Content -->
        <div style="flex:1;min-width:0">
          <p style="font-size:13px;color:var(--text-primary,#111);line-height:1.5;margin:0">
            <strong>{{ n.sender?.fullName || n.sender?.username }}</strong>
            {{ stripName(n) }}
          </p>
          <p style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:2px">
            {{ timeAgo(n.createdAt) }}
          </p>
        </div>

        <!-- Unread dot / action -->
        <div style="flex-shrink:0;display:flex;align-items:center;gap:8px">
          @if (n.type === 'FOLLOW') {
            <button style="padding:5px 14px;background:#6366f1;color:#fff;border:none;
                           border-radius:8px;font-size:12px;font-weight:500;cursor:pointer">
              Follow back
            </button>
          }
          @if (!n.isRead) {
            <div style="width:8px;height:8px;border-radius:50%;background:#6366f1;flex-shrink:0"></div>
          }
        </div>
      </div>
    }

    @if (!filtered().length) {
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:52px;margin-bottom:14px">🔔</div>
        <div style="font-size:16px;font-weight:500;color:var(--text-primary,#111);margin-bottom:6px">All caught up!</div>
        <p style="font-size:14px;color:var(--text-secondary,#6b7280)">No {{ activeTab === 'all' ? '' : activeTab }} notifications</p>
      </div>
    }
  }
</div>
<style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}</style>
  `
})
export class NotificationsComponent implements OnInit {
  all     = signal<Notif[]>([]);
  loading = signal(true);
  unread  = signal(0);
  activeTab = 'all';

  tabs = [
    { id:'all',     label:'All' },
    { id:'LIKE',    label:'❤️ Likes' },
    { id:'COMMENT', label:'💬 Comments' },
    { id:'FOLLOW',  label:'👤 Follows' },
    { id:'MESSAGE', label:'✉️ Messages' },
  ];

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/notifications`).subscribe({
      next: r => {
        const list = r.content || [];
        this.all.set(list);
        this.unread.set(list.filter((n: Notif) => !n.isRead).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filtered() {
    const list = this.all();
    return this.activeTab === 'all' ? list : list.filter(n => n.type === this.activeTab);
  }

  markRead(n: Notif) {
    if (!n.isRead) {
      this.http.patch(`${environment.apiUrl}/notifications/${n.id}/read`, {}).subscribe();
      this.all.update(l => l.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      this.unread.update(v => Math.max(0, v - 1));
    }
  }

  markAll() {
    this.http.patch(`${environment.apiUrl}/notifications/read-all`, {}).subscribe();
    this.all.update(l => l.map(n => ({ ...n, isRead: true })));
    this.unread.set(0);
  }

  typeIcon(t: string) { return {LIKE:'❤️',COMMENT:'💬',FOLLOW:'👤',MESSAGE:'✉️',MENTION:'📣',SYSTEM:'⚙️'}[t] ?? '🔔'; }
  typeColor(t: string) { return {LIKE:'#fecaca',COMMENT:'#e0e7ff',FOLLOW:'#dcfce7',MESSAGE:'#fef3c7',MENTION:'#fce7f3',SYSTEM:'#f3f4f6'}[t] ?? '#f3f4f6'; }

  stripName(n: Notif): string {
    const name = n.sender?.fullName || n.sender?.username || '';
    return n.message.replace(name, '').trim();
  }

  timeAgo(d: string): string {
    const diff = Date.now() - new Date(d).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  }
}
