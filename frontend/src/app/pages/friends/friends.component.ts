import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { HttpClient }    from '@angular/common/http';
import { AuthService }   from '../../services/auth.service';
import { environment }   from '../../../environments/environment';

@Component({
  selector: 'app-friends', standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div style="max-width:900px;margin:0 auto;padding:20px 16px">
  <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111);margin-bottom:6px">👥 Friends</h1>
  <p style="font-size:13px;color:var(--text-secondary,#6b7280);margin-bottom:20px">Manage your connections</p>

  <!-- Tabs -->
  <div style="display:flex;border-bottom:0.5px solid var(--border,#e5e7eb);margin-bottom:20px">
    @for (t of tabs; track t.id) {
      <button (click)="tab=t.id;load()"
              style="padding:10px 20px;border:none;background:none;cursor:pointer;font-size:13px;
                     font-weight:500;border-bottom:2px solid transparent;transition:all .15s"
              [style.borderBottomColor]="tab===t.id?'#6366f1':'transparent'"
              [style.color]="tab===t.id?'#6366f1':'var(--text-secondary,#6b7280)'">
        {{ t.label }}
        @if (t.count > 0) {
          <span style="margin-left:6px;background:#6366f1;color:#fff;font-size:10px;
                       padding:1px 6px;border-radius:10px">{{ t.count }}</span>
        }
      </button>
    }
  </div>

  <!-- Search -->
  <div style="position:relative;margin-bottom:16px">
    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px">🔍</span>
    <input [(ngModel)]="q" (ngModelChange)="filter()" placeholder="Search..."
           style="width:100%;padding:10px 14px 10px 36px;border:0.5px solid var(--border,#e5e7eb);
                  border-radius:10px;font-size:13px;outline:none;
                  background:var(--bg-primary,#fff);color:var(--text-primary,#111)">
  </div>

  <!-- User grid -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
    @for (u of filtered(); track u.id) {
      <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                  border-radius:14px;padding:18px;text-align:center">
        <a [routerLink]="['/profile', u.username]" style="text-decoration:none">
          <div style="width:64px;height:64px;border-radius:50%;margin:0 auto 10px;
                      display:flex;align-items:center;justify-content:center;
                      color:#fff;font-size:22px;font-weight:500;overflow:hidden;position:relative"
               [style.background]="avatarBg(u.username)">
            @if (u.avatarUrl) { <img [src]="u.avatarUrl" style="width:100%;height:100%;object-fit:cover"> }
            @else { {{ u.username.charAt(0).toUpperCase() }} }
            @if (u.isOnline) {
              <div style="position:absolute;bottom:2px;right:2px;width:14px;height:14px;
                          background:#22c55e;border-radius:50%;border:2px solid var(--bg-primary,#fff)"></div>
            }
          </div>
          <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:3px">
            {{ u.fullName || u.username }}
            @if (u.isVerified) { <span style="color:#3b82f6">✓</span> }
          </div>
          <div style="font-size:12px;color:var(--text-secondary,#6b7280);margin-bottom:12px">&#64;{{ u.username }}</div>
        </a>
        <div style="display:flex;gap:6px">
          <a [routerLink]="['/messages']"
             style="flex:1;padding:7px;border:0.5px solid var(--border,#e5e7eb);
                    border-radius:8px;font-size:12px;text-align:center;
                    text-decoration:none;color:var(--text-primary,#111)">
            💬
          </a>
          <button (click)="toggleFollow(u)"
                  style="flex:2;padding:7px;border:none;border-radius:8px;font-size:12px;
                         font-weight:500;cursor:pointer"
                  [style.background]="tab==='following'?'#fee2e2':'#6366f1'"
                  [style.color]="tab==='following'?'#b91c1c':'#fff'">
            {{ tab==='following' ? 'Unfollow' : 'Follow back' }}
          </button>
        </div>
      </div>
    }
  </div>

  @if (!filtered().length && !loading()) {
    <div style="text-align:center;padding:60px 20px">
      <div style="font-size:52px;margin-bottom:14px">👥</div>
      <p style="font-size:16px;font-weight:500;color:var(--text-primary,#111)">No {{ tab }} yet</p>
      <a routerLink="/explore" style="display:inline-block;margin-top:14px;padding:10px 24px;
                                      background:#6366f1;color:#fff;text-decoration:none;
                                      border-radius:10px;font-size:14px">
        Discover people →
      </a>
    </div>
  }
</div>
  `
})
export class FriendsComponent implements OnInit {
  users    = signal<any[]>([]);
  loading  = signal(true);
  tab      = 'followers';
  q        = '';

  tabs = [
    { id:'followers', label:'Followers', count: 0 },
    { id:'following', label:'Following', count: 0 },
  ];

  bgColors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#f43f5e'];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const me = this.auth.currentUser()?.username || '';
    const url = `${environment.apiUrl}/users/${me}/${this.tab}?page=0&size=40`;
    this.http.get<any>(url).subscribe({
      next: r => {
        this.users.set((r.content||[]).map((u:any) => ({...u, isOnline: Math.random() > 0.5})));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filter() {
    // filters are applied in filtered()
  }

  filtered() {
    const q = this.q.toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u =>
      u.username.toLowerCase().includes(q) || (u.fullName||'').toLowerCase().includes(q)
    );
  }

  toggleFollow(u: any) {
    this.http.post(`${environment.apiUrl}/users/${u.username}/follow`, {}).subscribe();
    this.users.update(l => l.filter(x => x.id !== u.id));
  }

  avatarBg(n: string) { return this.bgColors[n.charCodeAt(0) % this.bgColors.length]; }
}
