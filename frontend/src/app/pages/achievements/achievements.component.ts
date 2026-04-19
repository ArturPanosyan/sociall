import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient }   from '@angular/common/http';
import { AuthService }  from '../../services/auth.service';
import { environment }  from '../../../environments/environment';

@Component({
  selector: 'app-achievements', standalone: true,
  imports: [CommonModule],
  template: `
<div style="max-width:700px;margin:0 auto;padding:20px 16px">
  <div style="text-align:center;margin-bottom:28px">
    <div style="font-size:40px;margin-bottom:10px">🏅</div>
    <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">Achievements</h1>
    <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Your earned badges & milestones</p>
  </div>

  <!-- Check badges button -->
  <div style="text-align:center;margin-bottom:24px">
    <button (click)="checkBadges()" [disabled]="checking()"
            style="padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:500;cursor:pointer">
      {{ checking() ? 'Checking...' : '🔄 Check for new badges' }}
    </button>
    @if (newBadges().length) {
      <div style="margin-top:12px;padding:12px 16px;background:#dcfce7;border:0.5px solid #86efac;border-radius:12px;font-size:13px;color:#15803d">
        🎉 You earned {{ newBadges().length }} new badge{{ newBadges().length>1?'s':'' }}!
        @for (b of newBadges(); track b.id) { {{ b.emoji }} }
      </div>
    }
  </div>

  <!-- Earned badges -->
  @if (earned().length) {
    <div style="margin-bottom:24px">
      <h2 style="font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:14px">Earned ({{ earned().length }})</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px">
        @for (b of earned(); track b.id) {
          <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:14px;padding:16px;text-align:center">
            <div style="font-size:36px;margin-bottom:8px">{{ b.emoji }}</div>
            <div style="font-size:12px;font-weight:500;color:var(--text-primary,#111);margin-bottom:4px">{{ b.name }}</div>
            <div style="font-size:10px;color:var(--text-secondary,#6b7280);line-height:1.4">{{ b.description }}</div>
            <div style="margin-top:8px;font-size:10px;color:var(--text-muted,#9ca3af)">{{ earnedDate(b.earnedAt) }}</div>
          </div>
        }
      </div>
    </div>
  }

  <!-- All possible badges -->
  <div>
    <h2 style="font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:14px">All Badges</h2>
    <div style="display:flex;flex-direction:column;gap:8px">
      @for (b of allBadges; track b.type) {
        <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;border:0.5px solid var(--border,#e5e7eb)"
             [style.background]="isEarned(b.type) ? 'var(--bg-primary,#fff)' : 'var(--bg-secondary,#f9fafb)'"
             [style.opacity]="isEarned(b.type) ? '1' : '0.6'">
          <div style="font-size:28px;flex-shrink:0">{{ b.emoji }}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111)">{{ b.name }}</div>
            <div style="font-size:12px;color:var(--text-secondary,#6b7280)">{{ b.description }}</div>
            <div style="height:4px;background:var(--border,#e5e7eb);border-radius:10px;margin-top:8px;overflow:hidden">
              <div style="height:100%;background:#6366f1;border-radius:10px"
                   [style.width]="progress(b.type)+'%'"></div>
            </div>
          </div>
          @if (isEarned(b.type)) {
            <div style="font-size:18px;flex-shrink:0">✅</div>
          } @else {
            <div style="font-size:12px;color:var(--text-muted,#9ca3af);flex-shrink:0">{{ progress(b.type) }}%</div>
          }
        </div>
      }
    </div>
  </div>
</div>
  `
})
export class AchievementsComponent implements OnInit {
  earned    = signal<any[]>([]);
  newBadges = signal<any[]>([]);
  checking  = signal(false);

  allBadges = [
    { type:'FIRST_POST', emoji:'📝', name:'First Post!',       description:'Publish your first post',          threshold:1 },
    { type:'POSTS_10',   emoji:'🚀', name:'Content Creator',   description:'Publish 10 posts',                threshold:10 },
    { type:'POSTS_50',   emoji:'⭐', name:'Influencer',        description:'Publish 50 posts',                threshold:50 },
    { type:'POSTS_100',  emoji:'🌟', name:'Legend',            description:'Publish 100 posts',               threshold:100 },
    { type:'JOINED',     emoji:'🎉', name:'Welcome!',          description:'Join the platform',               threshold:1 },
    { type:'VERIFIED',   emoji:'✅', name:'Verified Creator',  description:'Get verified badge',              threshold:1 },
    { type:'SOCIAL',     emoji:'👥', name:'Social Butterfly',  description:'Follow 20+ people',               threshold:20 },
    { type:'POPULAR',    emoji:'💎', name:'Popular',           description:'Get 100+ followers',              threshold:100 },
  ];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const me = this.auth.currentUser()?.username;
    if (!me) return;
    this.http.get<any[]>(`${environment.apiUrl}/badges/${me}`).subscribe({
      next: b => this.earned.set(b),
      error: () => {}
    });
  }

  checkBadges() {
    this.checking.set(true);
    this.http.post<any[]>(`${environment.apiUrl}/badges/check`, {}).subscribe({
      next: b => { this.newBadges.set(b); this.earned.update(e => [...e, ...b]); this.checking.set(false); },
      error: () => this.checking.set(false)
    });
  }

  isEarned(type: string) { return this.earned().some(b => b.type === type); }

  progress(type: string): number {
    if (this.isEarned(type)) return 100;
    // Simplified mock progress
    return Math.floor(Math.random() * 60 + 10);
  }

  earnedDate(d: string) {
    return new Date(d).toLocaleDateString('en', { month:'short', day:'numeric', year:'numeric' });
  }
}
