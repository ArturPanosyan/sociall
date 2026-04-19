import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../../environments/environment';

@Component({
  selector: 'app-leaderboard', standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div style="max-width:700px;margin:0 auto;padding:20px 16px">

  <div style="text-align:center;margin-bottom:28px">
    <div style="font-size:40px;margin-bottom:8px">🏆</div>
    <h1 style="font-size:24px;font-weight:500;color:var(--text-primary,#111);margin-bottom:4px">Leaderboard</h1>
    <p style="font-size:14px;color:var(--text-secondary,#6b7280)">Top creators this week</p>
  </div>

  <!-- Tab -->
  <div style="display:flex;gap:6px;justify-content:center;margin-bottom:24px">
    @for (t of tabs; track t.id) {
      <button (click)="tab=t.id"
              style="padding:7px 18px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer"
              [style.background]="tab===t.id ? '#6366f1' : 'var(--bg-primary,#fff)'"
              [style.color]="tab===t.id ? '#fff' : 'var(--text-primary,#111)'"
              [style.border]="tab===t.id ? 'none' : '0.5px solid var(--border,#e5e7eb)'">
        {{ t.label }}
      </button>
    }
  </div>

  <!-- Top 3 podium -->
  @if (top3().length >= 3) {
    <div style="display:flex;align-items:flex-end;justify-content:center;gap:12px;margin-bottom:28px">
      <!-- 2nd -->
      <div style="text-align:center;flex:1">
        <div style="width:60px;height:60px;border-radius:50%;background:#94a3b8;
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:20px;font-weight:500;margin:0 auto 8px;
                    border:3px solid #94a3b8;overflow:hidden">
          {{ top3()[1].username.charAt(0).toUpperCase() }}
        </div>
        <div style="font-size:13px;font-weight:500;color:var(--text-primary,#111)">{{ top3()[1].fullName || top3()[1].username }}</div>
        <div style="font-size:12px;color:var(--text-secondary,#6b7280)">{{ metric(top3()[1]) }}</div>
        <div style="height:60px;background:linear-gradient(to bottom,#cbd5e1,#94a3b8);
                    border-radius:8px 8px 0 0;margin-top:8px;display:flex;align-items:center;
                    justify-content:center;font-size:20px;color:#fff;font-weight:500">2</div>
      </div>
      <!-- 1st -->
      <div style="text-align:center;flex:1">
        <div style="font-size:24px;margin-bottom:4px">👑</div>
        <div style="width:72px;height:72px;border-radius:50%;background:#fbbf24;
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:24px;font-weight:500;margin:0 auto 8px;
                    border:3px solid #f59e0b;overflow:hidden">
          {{ top3()[0].username.charAt(0).toUpperCase() }}
        </div>
        <div style="font-size:14px;font-weight:600;color:var(--text-primary,#111)">{{ top3()[0].fullName || top3()[0].username }}</div>
        <div style="font-size:12px;color:var(--text-secondary,#6b7280)">{{ metric(top3()[0]) }}</div>
        <div style="height:80px;background:linear-gradient(to bottom,#fde68a,#f59e0b);
                    border-radius:8px 8px 0 0;margin-top:8px;display:flex;align-items:center;
                    justify-content:center;font-size:22px;color:#fff;font-weight:500">1</div>
      </div>
      <!-- 3rd -->
      <div style="text-align:center;flex:1">
        <div style="width:60px;height:60px;border-radius:50%;background:#b45309;
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:20px;font-weight:500;margin:0 auto 8px;
                    border:3px solid #b45309;overflow:hidden">
          {{ top3()[2].username.charAt(0).toUpperCase() }}
        </div>
        <div style="font-size:13px;font-weight:500;color:var(--text-primary,#111)">{{ top3()[2].fullName || top3()[2].username }}</div>
        <div style="font-size:12px;color:var(--text-secondary,#6b7280)">{{ metric(top3()[2]) }}</div>
        <div style="height:44px;background:linear-gradient(to bottom,#fcd34d,#b45309);
                    border-radius:8px 8px 0 0;margin-top:8px;display:flex;align-items:center;
                    justify-content:center;font-size:18px;color:#fff;font-weight:500">3</div>
      </div>
    </div>
  }

  <!-- Full list -->
  <div style="display:flex;flex-direction:column;gap:8px">
    @for (u of users(); track u.id; let i = $index) {
      <a [routerLink]="['/profile', u.username]"
         style="display:flex;align-items:center;gap:12px;padding:14px 16px;
                background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                border-radius:14px;text-decoration:none;transition:transform .12s"
         class="lb-row">
        <!-- Rank -->
        <div style="width:28px;text-align:center;font-weight:600;flex-shrink:0"
             [style.color]="i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#b45309':'var(--text-muted,#9ca3af)'">
          {{ i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : '#'+(i+1) }}
        </div>
        <!-- Avatar -->
        <div style="width:40px;height:40px;border-radius:50%;background:#6366f1;flex-shrink:0;
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:15px;font-weight:500">
          {{ u.username.charAt(0).toUpperCase() }}
        </div>
        <!-- Name -->
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111)">
            {{ u.fullName || u.username }}
            @if (u.isVerified) { <span style="color:#3b82f6;font-size:12px">✓</span> }
          </div>
          <div style="font-size:12px;color:var(--text-secondary,#6b7280)">&#64;{{ u.username }}</div>
        </div>
        <!-- Metric -->
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:16px;font-weight:600;color:#6366f1">{{ metric(u) }}</div>
          <div style="font-size:11px;color:var(--text-muted,#9ca3af)">{{ metricLabel() }}</div>
        </div>
      </a>
    }
  </div>
</div>
<style>.lb-row:hover { transform: translateX(4px); }</style>
  `
})
export class LeaderboardComponent implements OnInit {
  users  = signal<any[]>([]);
  loading = signal(true);
  tab    = 'followers';
  tabs   = [
    { id:'followers', label:'👥 Followers' },
    { id:'posts',     label:'📝 Posts'     },
    { id:'likes',     label:'❤️ Likes'     },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Use existing search with empty query to get all users sorted
    this.http.get<any>(`${environment.apiUrl}/users/search?q=&page=0&size=20`).subscribe({
      next: r => { this.users.set(r.content || r || []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.users.set(this.mockUsers()); }
    });
  }

  top3() { return this.users().slice(0, 3); }
  metric(u: any): string {
    if (this.tab === 'followers') return (u.followersCount || 0).toLocaleString();
    if (this.tab === 'posts')     return (u.postsCount || 0).toLocaleString();
    return (u.followersCount || 0).toLocaleString();
  }
  metricLabel() {
    return { followers:'followers', posts:'posts', likes:'total likes' }[this.tab] ?? '';
  }

  mockUsers() {
    return [
      { id:1, username:'alice',  fullName:'Alice Johnson', followersCount:1240, postsCount:87,  isVerified:true  },
      { id:2, username:'bob',    fullName:'Bob Smith',     followersCount:890,  postsCount:156, isVerified:false },
      { id:3, username:'admin',  fullName:'Admin User',    followersCount:450,  postsCount:23,  isVerified:true  },
      { id:4, username:'demo',   fullName:'Demo User',     followersCount:120,  postsCount:12,  isVerified:false },
    ];
  }
}
