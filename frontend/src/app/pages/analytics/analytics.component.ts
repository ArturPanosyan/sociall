import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../../environments/environment';

interface Stats {
  totalPosts: number; totalFollowers: number; totalFollowing: number;
  totalLikes: number; totalViews: number; postsThisWeek: number;
  engagementRate: number;
  topPost?: { id: number; content: string; likes: number; views: number; };
}

@Component({
  selector: 'app-analytics', standalone: true, imports: [CommonModule, RouterLink],
  template: `
<div class="max-w-2xl mx-auto px-4 py-6">
  <div class="flex items-center gap-3 mb-6">
    <button onclick="history.back()" style="color:var(--text-secondary);font-size:20px">←</button>
    <h1 style="font-size:22px;font-weight:500;color:var(--text-primary)">Your Analytics</h1>
  </div>

  @if (loading()) {
    <div class="grid grid-cols-2 gap-3 mb-6">
      @for (i of [1,2,3,4]; track i) {
        <div class="stat-card animate-pulse" style="height:80px"></div>
      }
    </div>
  }

  @if (stats()) {
    <!-- Main stats -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="stat-card">
        <div class="stat-val">{{ stats()!.totalFollowers }}</div>
        <div class="stat-lbl">Followers</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ stats()!.totalPosts }}</div>
        <div class="stat-lbl">Posts</div>
        <div class="stat-delta up">+{{ stats()!.postsThisWeek }} this week</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ stats()!.totalLikes }}</div>
        <div class="stat-lbl">Total Likes</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ stats()!.totalViews }}</div>
        <div class="stat-lbl">Total Views</div>
      </div>
    </div>

    <!-- Engagement -->
    <div class="rounded-2xl p-4 mb-4" style="background:var(--bg-primary);border:0.5px solid var(--border)">
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">Engagement rate</div>
      <div style="font-size:28px;font-weight:500;color:var(--text-primary)">
        {{ stats()!.engagementRate.toFixed(1) }}%
      </div>
      <div style="height:8px;background:var(--bg-secondary);border-radius:10px;margin-top:10px;overflow:hidden">
        <div style="height:100%;background:#6366f1;border-radius:10px;transition:width .6s"
             [style.width]="Math.min(stats()!.engagementRate * 5, 100) + '%'"></div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:6px">
        {{ stats()!.engagementRate > 5 ? '🔥 Great!' : stats()!.engagementRate > 2 ? '👍 Good' : '📈 Growing' }}
      </div>
    </div>

    <!-- Top post -->
    @if (stats()!.topPost) {
      <div class="rounded-2xl p-4" style="background:var(--bg-primary);border:0.5px solid var(--border)">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">🏆 Your best post</div>
        <p style="font-size:13px;color:var(--text-primary);margin-bottom:10px;line-height:1.5">
          {{ stats()!.topPost!.content }}...
        </p>
        <div class="flex gap-4">
          <span style="font-size:12px;color:var(--text-secondary)">❤️ {{ stats()!.topPost!.likes }}</span>
          <span style="font-size:12px;color:var(--text-secondary)">👁 {{ stats()!.topPost!.views }}</span>
          <a [routerLink]="['/posts', stats()!.topPost!.id]"
             style="font-size:12px;color:#6366f1;margin-left:auto">View post →</a>
        </div>
      </div>
    }

    <!-- Tips -->
    <div class="mt-4 rounded-2xl p-4" style="background:#e0e7ff;border:0.5px solid #c7d2fe">
      <div style="font-size:12px;font-weight:500;color:#4338ca;margin-bottom:8px">💡 Tips to grow faster</div>
      <ul style="font-size:12px;color:#4338ca;line-height:1.8;padding-left:16px">
        <li>Post consistently — {{ stats()!.postsThisWeek < 3 ? 'aim for 3+ posts/week' : 'great pace!' }}</li>
        <li>Use photos/videos — they get 2× more views</li>
        <li>Engage back — reply to comments within 1 hour</li>
        <li>Add polls to boost interaction</li>
      </ul>
    </div>
  }
</div>
  `
})
export class AnalyticsComponent implements OnInit {
  stats   = signal<Stats | null>(null);
  loading = signal(true);
  Math    = Math;

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<Stats>(`${environment.apiUrl}/analytics/profile`).subscribe({
      next: s => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
