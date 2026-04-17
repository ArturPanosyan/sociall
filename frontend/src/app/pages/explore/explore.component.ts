import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterLink }     from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { Subject }        from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment }    from '../../../environments/environment';

interface UserCard  { id:number; username:string; fullName:string; avatarUrl:string; isVerified:boolean; }
interface PostCard  { id:number; content:string; username:string; likesCount:number; commentsCount:number; mediaUrls:string[]; createdAt:string; }
interface HashtagCard { name:string; postsCount:number; }

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div style="max-width:935px;margin:0 auto;padding:20px 16px">

  <!-- Search bar -->
  <div style="position:relative;margin-bottom:24px">
    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);
                 color:var(--color-text-secondary);font-size:16px">🔍</span>
    <input [(ngModel)]="query" (ngModelChange)="onSearch($event)"
           placeholder="Search people, posts, hashtags..."
           style="width:100%;padding:12px 14px 12px 42px;
                  background:var(--color-background-secondary);
                  border:0.5px solid var(--color-border-tertiary);
                  border-radius:12px;font-size:15px;
                  color:var(--color-text-primary);outline:none;transition:border-color .15s"
           onfocus="this.style.borderColor='#6366f1'"
           onblur="this.style.borderColor='var(--color-border-tertiary)'">
    @if (query) {
      <button (click)="query='';results.set(null)"
              style="position:absolute;right:12px;top:50%;transform:translateY(-50%);
                     background:none;border:none;cursor:pointer;
                     color:var(--color-text-secondary);font-size:18px">×</button>
    }
  </div>

  <!-- Search results -->
  @if (results()) {
    <div style="background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);
                border-radius:16px;overflow:hidden;margin-bottom:24px">

      @if (results()!.users?.length) {
        <div style="padding:12px 16px;border-bottom:0.5px solid var(--color-border-tertiary)">
          <div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;
                      color:var(--color-text-secondary);margin-bottom:10px">People</div>
          @for (u of results()!.users; track u.username) {
            <a [routerLink]="['/profile', u.username]"
               style="display:flex;align-items:center;gap:12px;padding:8px 0;text-decoration:none">
              <div style="width:40px;height:40px;border-radius:50%;background:#6366f1;
                          display:flex;align-items:center;justify-content:center;
                          color:#fff;font-weight:500;font-size:14px;flex-shrink:0">
                {{ u.username.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div style="font-size:14px;font-weight:500;color:var(--color-text-primary)">
                  {{ u.fullName || u.username }}
                  @if (u.isVerified) { <span style="color:#6366f1">✓</span> }
                </div>
                <div style="font-size:12px;color:var(--color-text-secondary)">&#64;{{ u.username }}</div>
              </div>
            </a>
          }
        </div>
      }

      @if (results()!.hashtags?.length) {
        <div style="padding:12px 16px">
          <div style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.5px;
                      color:var(--color-text-secondary);margin-bottom:10px">Hashtags</div>
          @for (h of results()!.hashtags; track h.name) {
            <a [routerLink]="['/hashtag', h.name]"
               style="display:flex;align-items:center;gap:12px;padding:8px 0;text-decoration:none">
              <div style="width:40px;height:40px;border-radius:50%;background:var(--color-background-secondary);
                          display:flex;align-items:center;justify-content:center;font-size:18px">
                #
              </div>
              <div>
                <div style="font-size:14px;font-weight:500;color:var(--color-text-primary)">#{{ h.name }}</div>
                <div style="font-size:12px;color:var(--color-text-secondary)">{{ h.postsCount }} posts</div>
              </div>
            </a>
          }
        </div>
      }

      @if (!results()!.users?.length && !results()!.hashtags?.length) {
        <div style="padding:32px;text-align:center;color:var(--color-text-secondary)">
          No results for "{{ query }}"
        </div>
      }
    </div>
  }

  <!-- Categories -->
  @if (!query) {
    <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:24px;
                scrollbar-width:none">
      @for (cat of categories; track cat.id) {
        <button (click)="activeCategory = cat.id"
                style="display:flex;align-items:center;gap:6px;padding:8px 16px;
                       border-radius:20px;border:1.5px solid;white-space:nowrap;
                       font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;flex-shrink:0"
                [style.background]="activeCategory === cat.id ? '#6366f1' : 'var(--color-background-primary)'"
                [style.color]="activeCategory === cat.id ? '#fff' : 'var(--color-text-primary)'"
                [style.border-color]="activeCategory === cat.id ? '#6366f1' : 'var(--color-border-tertiary)'">
          <span style="font-size:14px">{{ cat.icon }}</span>
          {{ cat.label }}
        </button>
      }
    </div>
  }

  <!-- Trending hashtags -->
  @if (!query) {
    <div style="margin-bottom:28px">
      <h2 style="font-size:16px;font-weight:500;color:var(--color-text-primary);margin-bottom:14px">
        🔥 Trending
      </h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        @for (tag of trendingTags; track tag) {
          <a [routerLink]="['/hashtag', tag]"
             style="padding:8px 16px;background:var(--color-background-secondary);
                    border-radius:20px;font-size:13px;font-weight:500;
                    color:var(--color-text-primary);text-decoration:none;
                    border:0.5px solid var(--color-border-tertiary);transition:all .15s"
             onmouseenter="this.style.borderColor='#6366f1';this.style.color='#6366f1'"
             onmouseleave="this.style.borderColor='var(--color-border-tertiary)';this.style.color='var(--color-text-primary)'">
            #{{ tag }}
          </a>
        }
      </div>
    </div>
  }

  <!-- Suggested people -->
  @if (!query) {
    <div style="margin-bottom:28px">
      <h2 style="font-size:16px;font-weight:500;color:var(--color-text-primary);margin-bottom:14px">
        👥 People you might know
      </h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px">
        @for (u of suggestedUsers(); track u.username) {
          <div style="background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);
                      border-radius:16px;padding:20px 14px;text-align:center">
            <div style="width:60px;height:60px;border-radius:50%;margin:0 auto 10px;
                        background:#6366f1;display:flex;align-items:center;
                        justify-content:center;color:#fff;font-size:22px;font-weight:500">
              {{ u.username.charAt(0).toUpperCase() }}
            </div>
            <div style="font-size:13px;font-weight:500;color:var(--color-text-primary);margin-bottom:2px">
              {{ u.fullName || u.username }}
            </div>
            <div style="font-size:11px;color:var(--color-text-secondary);margin-bottom:12px">
              &#64;{{ u.username }}
            </div>
            <a [routerLink]="['/profile', u.username]"
               style="display:block;padding:6px;background:#6366f1;color:#fff;
                      border-radius:8px;font-size:12px;font-weight:500;text-decoration:none">
              View profile
            </a>
          </div>
        }
      </div>
    </div>
  }

  <!-- Explore photo grid -->
  @if (!query) {
    <div>
      <h2 style="font-size:16px;font-weight:500;color:var(--color-text-primary);margin-bottom:14px">
        ✨ Explore
      </h2>
      @if (loadingGrid()) {
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
          @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
            <div style="aspect-ratio:1;background:var(--color-background-secondary);border-radius:4px"></div>
          }
        </div>
      }
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
        @for (post of explorePosts(); track post.id; let i = $index) {
          <a [routerLink]="['/posts', post.id]"
             style="position:relative;overflow:hidden;display:block;
                    border-radius:4px;background:var(--color-background-secondary)"
             [style.grid-row]="i % 7 === 0 ? 'span 2' : ''"
             [style.grid-column]="i % 7 === 0 ? 'span 1' : ''"
             [style.aspect-ratio]="i % 7 === 0 ? 'auto' : '1'">

            @if (post.mediaUrls?.length) {
              <img [src]="post.mediaUrls[0]"
                   style="width:100%;height:100%;object-fit:cover;min-height:150px">
            } @else {
              <div style="min-height:150px;padding:14px;display:flex;align-items:center;
                          justify-content:center;background:var(--color-background-secondary)">
                <p style="font-size:12px;color:var(--color-text-secondary);text-align:center;
                           line-height:1.5;overflow:hidden;display:-webkit-box;
                           -webkit-line-clamp:4;-webkit-box-orient:vertical">
                  {{ post.content }}
                </p>
              </div>
            }

            <div style="position:absolute;inset:0;background:rgba(0,0,0,0);
                        display:flex;align-items:center;justify-content:center;
                        gap:16px;transition:all .2s;opacity:0"
                 onmouseenter="this.style.background='rgba(0,0,0,.4)';this.style.opacity='1'"
                 onmouseleave="this.style.background='transparent';this.style.opacity='0'">
              <span style="color:#fff;font-size:13px;font-weight:500">❤️ {{ post.likesCount }}</span>
              <span style="color:#fff;font-size:13px;font-weight:500">💬 {{ post.commentsCount }}</span>
            </div>
          </a>
        }
      </div>
    </div>
  }
</div>
  `
})
export class ExploreComponent implements OnInit {
  query         = '';
  activeCategory = 'all';
  results       = signal<any>(null);
  suggestedUsers = signal<UserCard[]>([]);
  explorePosts  = signal<PostCard[]>([]);
  loadingGrid   = signal(true);

  private search$ = new Subject<string>();

  trendingTags = ['tech', 'design', 'javascript', 'spring', 'angular', 'ai', 'webdev', 'coding'];

  categories = [
    { id: 'all',     icon: '✨', label: 'All' },
    { id: 'tech',    icon: '💻', label: 'Tech' },
    { id: 'design',  icon: '🎨', label: 'Design' },
    { id: 'photo',   icon: '📷', label: 'Photo' },
    { id: 'video',   icon: '🎬', label: 'Video' },
    { id: 'travel',  icon: '✈️',  label: 'Travel' },
    { id: 'food',    icon: '🍕', label: 'Food' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSuggested();
    this.loadExplore();
    this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      if (q.length >= 2) this.doSearch(q);
      else this.results.set(null);
    });
  }

  onSearch(q: string) { this.search$.next(q); }

  doSearch(q: string) {
    this.http.get<any>(`${environment.apiUrl}/search?q=${encodeURIComponent(q)}`).subscribe({
      next: r => this.results.set(r),
      error: () => this.results.set({ users: [], hashtags: [] })
    });
  }

  loadSuggested() {
    this.http.get<any>(`${environment.apiUrl}/users/search?q=&page=0&size=6`).subscribe({
      next: r => this.suggestedUsers.set((r.content || r || []).slice(0, 6)),
      error: () => {}
    });
  }

  loadExplore() {
    this.http.get<any>(`${environment.apiUrl}/posts/feed?page=0&size=18`).subscribe({
      next: r => { this.explorePosts.set(r.content || []); this.loadingGrid.set(false); },
      error: () => this.loadingGrid.set(false)
    });
  }
}
