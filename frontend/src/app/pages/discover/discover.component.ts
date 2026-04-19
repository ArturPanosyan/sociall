import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../../environments/environment';

@Component({
  selector: 'app-discover', standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div style="max-width:900px;margin:0 auto;padding:20px 16px">

  <div style="margin-bottom:24px">
    <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">✨ Discover</h1>
    <p style="font-size:13px;color:var(--text-secondary,#6b7280)">What's trending right now</p>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

    <!-- Left column -->
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- Trending hashtags -->
      <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:16px">
        <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:14px;
                    display:flex;align-items:center;gap:6px">
          🔥 Trending Topics
        </div>
        @for (tag of (data()?.hashtags || defaultTags); track tag.name; let i = $index) {
          <a [routerLink]="['/hashtag', tag.name]"
             style="display:flex;align-items:center;justify-content:space-between;
                    padding:9px 0;border-bottom:0.5px solid var(--border,#e5e7eb);text-decoration:none"
             [style.borderBottom]="i === 9 ? 'none' : '0.5px solid var(--border,#e5e7eb)'">
            <div>
              <div style="font-size:13px;font-weight:500;color:var(--text-primary,#111)">#{{ tag.name }}</div>
              <div style="font-size:11px;color:var(--text-secondary,#6b7280);margin-top:1px">{{ tag.postsCount || (10 + i * 7) }} posts</div>
            </div>
            <div style="font-size:11px;color:#6366f1;font-weight:500">#{{ i + 1 }}</div>
          </a>
        }
      </div>

      <!-- Top users -->
      <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:16px">
        <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:14px">
          ⭐ Who to Follow
        </div>
        @for (u of (data()?.users || []); track u.id) {
          <div style="display:flex;align-items:center;gap:10px;padding:7px 0">
            <a [routerLink]="['/profile', u.username]"
               style="width:36px;height:36px;border-radius:50%;background:#6366f1;flex-shrink:0;
                      display:flex;align-items:center;justify-content:center;
                      color:#fff;font-size:13px;font-weight:500;text-decoration:none;overflow:hidden">
              @if (u.avatarUrl) { <img [src]="u.avatarUrl" style="width:100%;height:100%;object-fit:cover"> }
              @else { {{ u.username.charAt(0).toUpperCase() }} }
            </a>
            <div style="flex:1;min-width:0">
              <a [routerLink]="['/profile', u.username]"
                 style="font-size:13px;font-weight:500;color:var(--text-primary,#111);text-decoration:none;display:flex;align-items:center;gap:4px">
                {{ u.fullName || u.username }}
                @if (u.isVerified) { <span style="color:#3b82f6;font-size:11px">✓</span> }
              </a>
              <div style="font-size:11px;color:var(--text-secondary,#6b7280)">&#64;{{ u.username }}</div>
            </div>
            <button (click)="follow(u)"
                    style="padding:5px 12px;font-size:12px;font-weight:500;border-radius:8px;cursor:pointer;flex-shrink:0"
                    [style.background]="u.followed ? 'var(--bg-secondary,#f9fafb)' : '#6366f1'"
                    [style.color]="u.followed ? 'var(--text-primary,#111)' : '#fff'"
                    [style.border]="u.followed ? '0.5px solid var(--border,#e5e7eb)' : 'none'">
              {{ u.followed ? '✓' : 'Follow' }}
            </button>
          </div>
        }
        @if (!data()?.users?.length) {
          @for (u of mockUsers; track u.username) {
            <div style="display:flex;align-items:center;gap:10px;padding:7px 0">
              <div style="width:36px;height:36px;border-radius:50%;flex-shrink:0;
                          display:flex;align-items:center;justify-content:center;
                          color:#fff;font-size:13px;font-weight:500"
                   [style.background]="u.color">
                {{ u.username.charAt(0).toUpperCase() }}
              </div>
              <div style="flex:1"><div style="font-size:13px;font-weight:500;color:var(--text-primary,#111)">{{ u.name }}</div>
                <div style="font-size:11px;color:var(--text-secondary,#6b7280)">{{ u.desc }}</div></div>
              <button style="padding:5px 12px;font-size:12px;font-weight:500;border-radius:8px;
                             cursor:pointer;background:#6366f1;color:#fff;border:none">Follow</button>
            </div>
          }
        }
      </div>
    </div>

    <!-- Right column — hot posts -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111);
                  display:flex;align-items:center;gap:6px;margin-bottom:4px">
        📈 Top Posts Today
      </div>
      @for (post of (data()?.posts || []); track post.id; let i = $index) {
        <a [routerLink]="['/posts', post.id]"
           style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                  border-radius:14px;padding:14px;text-decoration:none;display:block;
                  transition:transform .12s" class="hot-post">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="font-size:18px;font-weight:600;color:var(--text-muted,#9ca3af);min-width:24px">
              {{ i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1) }}
            </div>
            <div style="font-size:12px;color:var(--text-secondary,#6b7280)">&#64;{{ post.username }}</div>
          </div>
          <p style="font-size:13px;color:var(--text-primary,#111);line-height:1.5;margin-bottom:8px;
                    display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">
            {{ post.content || 'No content' }}
          </p>
          <div style="display:flex;gap:12px;font-size:12px;color:var(--text-muted,#9ca3af)">
            <span>❤️ {{ post.likesCount }}</span>
            <span>👁 {{ post.viewsCount }}</span>
          </div>
        </a>
      }
      @if (!data()?.posts?.length && !loading()) {
        @for (p of mockPosts; track p.title) {
          <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                      border-radius:14px;padding:14px">
            <div style="font-size:13px;font-weight:500;color:var(--text-primary,#111);margin-bottom:4px">{{ p.title }}</div>
            <div style="font-size:12px;color:var(--text-secondary,#6b7280);margin-bottom:8px">{{ p.desc }}</div>
            <div style="font-size:11px;color:var(--text-muted,#9ca3af)">❤️ {{ p.likes }} · 👁 {{ p.views }}</div>
          </div>
        }
      }
    </div>
  </div>
</div>
<style>.hot-post:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.06)}</style>
  `
})
export class DiscoverComponent implements OnInit {
  data    = signal<any>(null);
  loading = signal(true);
  defaultTags = [
    {name:'webdev',postsCount:1240},{name:'angular',postsCount:980},{name:'java',postsCount:870},
    {name:'design',postsCount:760},{name:'ai',postsCount:650},{name:'startup',postsCount:540},
    {name:'photography',postsCount:480},{name:'travel',postsCount:420},{name:'food',postsCount:380},{name:'coding',postsCount:340}
  ];
  mockUsers = [
    {username:'alice',  name:'Alice Johnson', desc:'Frontend dev 🚀',  color:'#6366f1'},
    {username:'bob',    name:'Bob Smith',     desc:'Backend engineer', color:'#10b981'},
    {username:'carol',  name:'Carol Chen',    desc:'UX Designer 🎨',   color:'#f59e0b'},
    {username:'dave',   name:'Dave Miller',   desc:'DevOps & Cloud',   color:'#ef4444'},
  ];
  mockPosts = [
    {title:'10 Angular 17 Tips You Should Know',desc:'Signals, standalone components...',likes:847,views:12400},
    {title:'Spring Boot 3.2 New Features',      desc:'Virtual threads, AOT compilation...',likes:623,views:9800},
    {title:'How I Built a SaaS in 30 Days',     desc:'Tech stack, lessons learned...',likes:512,views:8200},
  ];

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/trending`).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  follow(u: any) {
    this.http.post(`${environment.apiUrl}/users/${u.username}/follow`,{}).subscribe();
    if (this.data()) {
      this.data.update(d => ({...d, users: d.users.map((x:any) => x.id===u.id?{...x,followed:true}:x)}));
    }
  }
}
