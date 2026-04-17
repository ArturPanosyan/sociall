import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { AuthService }    from '../../services/auth.service';
import { PostService, Post } from '../../services/post.service';
import { environment }    from '../../../environments/environment';

interface Profile {
  id: number; username: string; fullName: string; bio: string;
  avatarUrl: string; coverUrl: string; website: string; location: string;
  followersCount: number; followingCount: number; postsCount: number;
  isVerified: boolean; isPrivate: boolean; role: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
@if (profile()) {
<div style="max-width:935px;margin:0 auto;padding-bottom:40px">

  <!-- Cover photo -->
  <div style="height:220px;background:linear-gradient(135deg,#312e81 0%,#6366f1 50%,#8b5cf6 100%);
              position:relative;overflow:hidden">
    @if (profile()!.coverUrl) {
      <img [src]="profile()!.coverUrl" style="width:100%;height:100%;object-fit:cover">
    }
    @if (isOwn()) {
      <button (click)="coverInput.click()"
              style="position:absolute;bottom:12px;right:12px;padding:6px 14px;
                     background:rgba(0,0,0,.5);color:#fff;border:none;border-radius:8px;
                     font-size:12px;cursor:pointer;backdrop-filter:blur(4px)">
        📷 Change cover
      </button>
      <input #coverInput type="file" accept="image/*" style="display:none">
    }
  </div>

  <!-- Profile header -->
  <div style="padding:0 24px">
    <div style="display:flex;align-items:flex-end;gap:20px;margin-top:-40px;margin-bottom:16px">

      <!-- Avatar -->
      <div style="position:relative;flex-shrink:0">
        <div style="width:140px;height:140px;border-radius:50%;
                    border:4px solid var(--color-background-primary);
                    overflow:hidden;background:#6366f1;
                    display:flex;align-items:center;justify-content:center">
          @if (profile()!.avatarUrl) {
            <img [src]="profile()!.avatarUrl" style="width:100%;height:100%;object-fit:cover">
          } @else {
            <span style="font-size:48px;color:#fff;font-weight:500">
              {{ profile()!.username.charAt(0).toUpperCase() }}
            </span>
          }
        </div>
        @if (isOwn()) {
          <button (click)="avatarInput.click()"
                  style="position:absolute;bottom:6px;right:6px;width:32px;height:32px;
                         background:#6366f1;color:#fff;border:none;border-radius:50%;
                         cursor:pointer;font-size:14px;border:2px solid var(--color-background-primary)">
            📷
          </button>
          <input #avatarInput type="file" accept="image/*" style="display:none">
        }
      </div>

      <!-- Action buttons -->
      <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;margin-left:auto">
        @if (isOwn()) {
          <button (click)="editMode = !editMode"
                  style="padding:8px 20px;border:1.5px solid var(--color-border-secondary);
                         background:none;border-radius:8px;font-size:14px;font-weight:500;
                         cursor:pointer;color:var(--color-text-primary)">
            {{ editMode ? 'Cancel' : 'Edit profile' }}
          </button>
        } @else {
          <button (click)="toggleFollow()"
                  style="padding:8px 24px;border:none;border-radius:8px;
                         font-size:14px;font-weight:500;cursor:pointer;transition:all .15s"
                  [style.background]="isFollowing() ? 'var(--color-background-secondary)' : '#6366f1'"
                  [style.color]="isFollowing() ? 'var(--color-text-primary)' : '#fff'"
                  [style.border]="isFollowing() ? '1.5px solid var(--color-border-secondary)' : 'none'">
            {{ isFollowing() ? 'Following' : 'Follow' }}
          </button>
          <a [routerLink]="['/messages']"
             style="padding:8px 20px;border:1.5px solid var(--color-border-secondary);
                    background:none;border-radius:8px;font-size:14px;font-weight:500;
                    cursor:pointer;color:var(--color-text-primary);text-decoration:none;
                    display:flex;align-items:center">
            Message
          </a>
        }
      </div>
    </div>

    <!-- Edit form -->
    @if (editMode) {
      <div style="background:var(--color-background-secondary);border-radius:16px;
                  padding:20px;margin-bottom:20px;border:0.5px solid var(--color-border-tertiary)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="font-size:12px;color:var(--color-text-secondary);display:block;margin-bottom:4px">Full name</label>
            <input [(ngModel)]="editFullName" style="width:100%;padding:8px 12px;border:0.5px solid var(--color-border-tertiary);border-radius:8px;background:var(--color-background-primary);color:var(--color-text-primary);font-size:13px;outline:none">
          </div>
          <div>
            <label style="font-size:12px;color:var(--color-text-secondary);display:block;margin-bottom:4px">Website</label>
            <input [(ngModel)]="editWebsite" style="width:100%;padding:8px 12px;border:0.5px solid var(--color-border-tertiary);border-radius:8px;background:var(--color-background-primary);color:var(--color-text-primary);font-size:13px;outline:none">
          </div>
          <div style="grid-column:1/-1">
            <label style="font-size:12px;color:var(--color-text-secondary);display:block;margin-bottom:4px">Bio</label>
            <textarea [(ngModel)]="editBio" rows="2" style="width:100%;padding:8px 12px;border:0.5px solid var(--color-border-tertiary);border-radius:8px;background:var(--color-background-primary);color:var(--color-text-primary);font-size:13px;outline:none;resize:none"></textarea>
          </div>
          <div>
            <label style="font-size:12px;color:var(--color-text-secondary);display:block;margin-bottom:4px">Location</label>
            <input [(ngModel)]="editLocation" style="width:100%;padding:8px 12px;border:0.5px solid var(--color-border-tertiary);border-radius:8px;background:var(--color-background-primary);color:var(--color-text-primary);font-size:13px;outline:none">
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button (click)="saveProfile()"
                  style="padding:8px 20px;background:#6366f1;color:#fff;border:none;
                         border-radius:8px;font-size:13px;font-weight:500;cursor:pointer">
            Save changes
          </button>
          <button (click)="editMode=false"
                  style="padding:8px 16px;border:0.5px solid var(--color-border-tertiary);background:none;
                         border-radius:8px;font-size:13px;cursor:pointer;color:var(--color-text-secondary)">
            Cancel
          </button>
        </div>
      </div>
    }

    <!-- Name & info -->
    <div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <h1 style="font-size:20px;font-weight:500;color:var(--color-text-primary)">
          {{ profile()!.fullName || profile()!.username }}
        </h1>
        @if (profile()!.isVerified) {
          <span style="color:#6366f1;font-size:16px" title="Verified">✓</span>
        }
        @if (profile()!.role === 'ADMIN') {
          <span style="background:#fef3c7;color:#b45309;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:500">ADMIN</span>
        }
      </div>
      <p style="font-size:14px;color:var(--color-text-secondary)">&#64;{{ profile()!.username }}</p>

      @if (profile()!.bio) {
        <p style="font-size:14px;color:var(--color-text-primary);margin-top:10px;line-height:1.6">{{ profile()!.bio }}</p>
      }

      <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:10px">
        @if (profile()!.location) {
          <span style="font-size:13px;color:var(--color-text-secondary)">📍 {{ profile()!.location }}</span>
        }
        @if (profile()!.website) {
          <a [href]="profile()!.website" target="_blank"
             style="font-size:13px;color:#6366f1;text-decoration:none">
            🔗 {{ profile()!.website }}
          </a>
        }
      </div>
    </div>

    <!-- Stats -->
    <div style="display:flex;gap:28px;padding:14px 0;border-top:0.5px solid var(--color-border-tertiary);
                border-bottom:0.5px solid var(--color-border-tertiary);margin-bottom:24px">
      <div style="text-align:center;cursor:pointer">
        <div style="font-size:18px;font-weight:500;color:var(--color-text-primary)">{{ profile()!.postsCount }}</div>
        <div style="font-size:12px;color:var(--color-text-secondary)">posts</div>
      </div>
      <div style="text-align:center;cursor:pointer" (click)="showTab='followers'">
        <div style="font-size:18px;font-weight:500;color:var(--color-text-primary)">{{ profile()!.followersCount }}</div>
        <div style="font-size:12px;color:var(--color-text-secondary)">followers</div>
      </div>
      <div style="text-align:center;cursor:pointer" (click)="showTab='following'">
        <div style="font-size:18px;font-weight:500;color:var(--color-text-primary)">{{ profile()!.followingCount }}</div>
        <div style="font-size:12px;color:var(--color-text-secondary)">following</div>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:0;margin-bottom:0;border-bottom:0.5px solid var(--color-border-tertiary)">
      @for (tab of ['posts','tagged','reels']; track tab) {
        <button (click)="showTab = tab"
                style="flex:1;padding:12px;border:none;background:none;cursor:pointer;
                       font-size:12px;font-weight:500;letter-spacing:.5px;text-transform:uppercase;
                       transition:all .15s;border-bottom:2px solid transparent;margin-bottom:-0.5px"
                [style.color]="showTab===tab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'"
                [style.border-bottom-color]="showTab===tab ? 'var(--color-text-primary)' : 'transparent'">
          {{ tab === 'posts' ? '⊞ Posts' : tab === 'tagged' ? '🏷 Tagged' : '▶ Reels' }}
        </button>
      }
    </div>
  </div>

  <!-- Photo grid -->
  @if (showTab === 'posts') {
    @if (loadingPosts()) {
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;padding:3px 24px">
        @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
          <div style="aspect-ratio:1;background:var(--color-background-secondary);border-radius:2px"></div>
        }
      </div>
    }

    @if (!loadingPosts() && posts().length === 0) {
      <div style="text-align:center;padding:60px 20px;color:var(--color-text-secondary)">
        <div style="font-size:48px;margin-bottom:12px">📷</div>
        <p style="font-size:18px;font-weight:500;color:var(--color-text-primary)">No posts yet</p>
        @if (isOwn()) {
          <p style="font-size:14px;margin-top:6px">Share your first photo or video</p>
        }
      </div>
    }

    @if (posts().length > 0) {
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;padding:3px 24px">
        @for (post of posts(); track post.id) {
          <a [routerLink]="['/posts', post.id]"
             style="aspect-ratio:1;position:relative;overflow:hidden;display:block;background:var(--color-background-secondary)">
            @if (post.mediaUrls?.length) {
              <img [src]="post.mediaUrls[0]"
                   style="width:100%;height:100%;object-fit:cover;transition:transform .2s">
            } @else {
              <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
                          padding:12px;background:var(--color-background-secondary)">
                <p style="font-size:12px;color:var(--color-text-secondary);text-align:center;
                           line-height:1.4;overflow:hidden;display:-webkit-box;
                           -webkit-line-clamp:4;-webkit-box-orient:vertical">
                  {{ post.content }}
                </p>
              </div>
            }

            <!-- Hover overlay -->
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0);
                        display:flex;align-items:center;justify-content:center;
                        gap:20px;transition:background .2s;opacity:0"
                 onmouseenter="this.style.background='rgba(0,0,0,.4)';this.style.opacity='1'"
                 onmouseleave="this.style.background='rgba(0,0,0,0)';this.style.opacity='0'">
              <span style="color:#fff;font-size:14px;font-weight:500">❤️ {{ post.likesCount }}</span>
              <span style="color:#fff;font-size:14px;font-weight:500">💬 {{ post.commentsCount }}</span>
            </div>

            @if (post.mediaUrls?.length > 1) {
              <div style="position:absolute;top:8px;right:8px;color:#fff;font-size:14px">⊞</div>
            }
          </a>
        }
      </div>
    }
  }

  @if (showTab === 'tagged') {
    <div style="text-align:center;padding:60px;color:var(--color-text-secondary)">
      <div style="font-size:40px;margin-bottom:10px">🏷</div>
      <p>No tagged posts yet</p>
    </div>
  }

  @if (showTab === 'reels') {
    <div style="text-align:center;padding:60px;color:var(--color-text-secondary)">
      <div style="font-size:40px;margin-bottom:10px">▶</div>
      <p>No reels yet</p>
    </div>
  }

</div>
}

@if (loading()) {
  <div style="max-width:935px;margin:0 auto">
    <div style="height:220px;background:var(--color-background-secondary);border-radius:0 0 12px 12px"></div>
    <div style="padding:0 24px">
      <div style="width:140px;height:140px;border-radius:50%;background:var(--color-background-secondary);margin-top:-40px;margin-bottom:16px"></div>
    </div>
  </div>
}
  `
})
export class ProfileComponent implements OnInit {
  profile      = signal<Profile | null>(null);
  posts        = signal<Post[]>([]);
  loading      = signal(true);
  loadingPosts = signal(true);
  isFollowing  = signal(false);
  showTab      = 'posts';
  editMode     = false;
  editFullName = '';
  editBio      = '';
  editWebsite  = '';
  editLocation = '';

  get isOwn() {
    return signal(this.profile()?.username === this.auth.currentUser()?.username);
  }

  constructor(
    private route: ActivatedRoute,
    private http:  HttpClient,
    public  auth:  AuthService,
    private postSvc: PostService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => this.loadProfile(p['username']));
  }

  loadProfile(username: string) {
    this.loading.set(true);
    this.http.get<Profile>(`${environment.apiUrl}/users/${username}`).subscribe({
      next: p => {
        this.profile.set(p);
        this.loading.set(false);
        this.editFullName = p.fullName || '';
        this.editBio      = p.bio      || '';
        this.editWebsite  = p.website  || '';
        this.editLocation = p.location || '';
        this.loadPosts(username);
      }
    });
    this.http.get<any>(`${environment.apiUrl}/users/${username}/following-status`).subscribe({
      next: r => this.isFollowing.set(r?.following ?? false),
      error: () => {}
    });
  }

  loadPosts(username: string) {
    this.loadingPosts.set(true);
    this.postSvc.getUserPosts(username, 0).subscribe({
      next: r  => { this.posts.set(r.content); this.loadingPosts.set(false); },
      error: () => this.loadingPosts.set(false)
    });
  }

  toggleFollow() {
    const p = this.profile();
    if (!p) return;
    this.http.post(`${environment.apiUrl}/users/${p.username}/follow`, {}).subscribe({
      next: () => {
        const f = !this.isFollowing();
        this.isFollowing.set(f);
        this.profile.update(x => x ? {
          ...x, followersCount: x.followersCount + (f ? 1 : -1)
        } : x);
      }
    });
  }

  saveProfile() {
    this.http.put(`${environment.apiUrl}/users/me`, {
      fullName: this.editFullName, bio: this.editBio,
      website: this.editWebsite, location: this.editLocation
    }).subscribe({
      next: (p: any) => { this.profile.set(p); this.editMode = false; }
    });
  }
}
