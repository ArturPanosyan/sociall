import { Component, signal }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';
import { RouterLink }               from '@angular/router';
import { UserService }              from '../../services/user.service';
import { PostService, Post }        from '../../services/post.service';
import { debounceTime, Subject }    from 'rxjs';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="max-w-2xl mx-auto px-4 py-6">

  <!-- Search Bar -->
  <div class="relative mb-6">
    <span class="absolute left-4 top-3.5 text-gray-400 text-lg">🔍</span>
    <input [(ngModel)]="query"
           (ngModelChange)="onSearch($event)"
           type="text"
           placeholder="Search people, hashtags, posts..."
           class="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl
                  shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  outline-none transition">
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
    @for (tab of tabs; track tab) {
      <button (click)="activeTab.set(tab)"
              class="flex-1 py-2 text-sm font-medium rounded-lg transition"
              [class.bg-white]="activeTab() === tab"
              [class.text-gray-900]="activeTab() === tab"
              [class.shadow-sm]="activeTab() === tab"
              [class.text-gray-500]="activeTab() !== tab">
        {{ tab }}
      </button>
    }
  </div>

  <!-- People Results -->
  @if (activeTab() === 'People') {
    @if (loading()) {
      <div class="space-y-3">
        @for (i of [1,2,3]; track i) {
          <div class="bg-white rounded-2xl p-4 animate-pulse flex gap-3">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
              <div class="h-3 bg-gray-100 rounded w-1/4"></div>
            </div>
          </div>
        }
      </div>
    } @else if (users().length) {
      <div class="space-y-3">
        @for (user of users(); track user.id) {
          <div class="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <a [routerLink]="['/profile', user.username]">
              <img [src]="user.avatarUrl || '/assets/default-avatar.png'"
                   class="w-12 h-12 rounded-full object-cover">
            </a>
            <div class="flex-1">
              <a [routerLink]="['/profile', user.username]"
                 class="font-semibold text-gray-900 hover:text-indigo-600">
                {{ user.fullName || user.username }}
                @if (user.isVerified) { <span class="text-blue-500">✓</span> }
              </a>
              <p class="text-sm text-gray-400">&#64;{{ user.username }} · {{ user.followersCount }} followers</p>
              @if (user.bio) {
                <p class="text-sm text-gray-600 mt-1 line-clamp-1">{{ user.bio }}</p>
              }
            </div>
            <button class="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium
                           rounded-xl hover:bg-indigo-700 transition">
              Follow
            </button>
          </div>
        }
      </div>
    } @else if (query) {
      <div class="text-center py-12 text-gray-400">
        <p class="text-3xl mb-2">👤</p>
        <p>No users found for "{{ query }}"</p>
      </div>
    } @else {
      <!-- Trending Users -->
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Suggested for you
      </h2>
      <div class="space-y-3">
        @for (user of suggestedUsers(); track user.id) {
          <div class="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-50">
            <img [src]="user.avatarUrl || '/assets/default-avatar.png'"
                 class="w-12 h-12 rounded-full object-cover">
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-sm">{{ user.fullName || user.username }}</p>
              <p class="text-xs text-gray-400">&#64;{{ user.username }}</p>
            </div>
            <button class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium
                           rounded-xl hover:bg-indigo-700 transition">Follow</button>
          </div>
        }
      </div>
    }
  }

  <!-- Posts Results -->
  @if (activeTab() === 'Posts') {
    @if (posts().length) {
      <div class="grid grid-cols-3 gap-1">
        @for (post of posts(); track post.id) {
          <a [routerLink]="['/post', post.id]"
             class="aspect-square bg-gray-100 overflow-hidden rounded-lg group relative">
            @if (post.mediaUrls.length) {
              <img [src]="post.mediaUrls[0]" class="w-full h-full object-cover">
            } @else {
              <div class="w-full h-full flex items-center justify-center p-2
                          bg-gradient-to-br from-indigo-50 to-purple-50">
                <p class="text-xs text-gray-600 line-clamp-3 text-center">{{ post.content }}</p>
              </div>
            }
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                        transition flex items-center justify-center gap-2 text-white text-xs">
              <span>❤️{{ post.likesCount }}</span>
              <span>💬{{ post.commentsCount }}</span>
            </div>
          </a>
        }
      </div>
    } @else {
      <div class="text-center py-12 text-gray-400">
        <p class="text-3xl mb-2">📝</p>
        <p>{{ query ? 'No posts found' : 'Search for posts' }}</p>
      </div>
    }
  }

  <!-- Hashtags -->
  @if (activeTab() === 'Hashtags') {
    <div class="space-y-3">
      @for (tag of trendingTags(); track tag.name) {
        <a [routerLink]="['/hashtag', tag.name]"
           class="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center
                      text-indigo-600 font-bold text-xl">#</div>
          <div>
            <p class="font-semibold text-gray-900">#{{ tag.name }}</p>
            <p class="text-sm text-gray-400">{{ tag.postsCount | number }} posts</p>
          </div>
        </a>
      }
    </div>
  }
</div>
  `
})
export class ExploreComponent {
  query        = '';
  activeTab    = signal<'People' | 'Posts' | 'Hashtags'>('People');
  tabs         = ['People', 'Posts', 'Hashtags'] as const;
  users        = signal<any[]>([]);
  posts        = signal<Post[]>([]);
  loading      = signal(false);
  suggestedUsers = signal<any[]>([]);
  trendingTags   = signal([
    { name: 'technology', postsCount: 12400 },
    { name: 'design',     postsCount: 8900  },
    { name: 'angular',    postsCount: 5600  },
    { name: 'java',       postsCount: 4200  },
    { name: 'startup',    postsCount: 3100  },
  ]);

  private search$ = new Subject<string>();

  constructor(private userSvc: UserService, private postSvc: PostService) {
    this.search$.pipe(debounceTime(400)).subscribe(q => this.runSearch(q));
  }

  onSearch(q: string) { this.search$.next(q); }

  runSearch(q: string) {
    if (!q.trim()) { this.users.set([]); this.posts.set([]); return; }
    this.loading.set(true);

    if (this.activeTab() === 'People') {
      this.userSvc.search(q).subscribe({
        next: res => { this.users.set(res.content || []); this.loading.set(false); },
        error: ()  => this.loading.set(false)
      });
    } else if (this.activeTab() === 'Posts') {
      this.loading.set(false);
    }
  }
}
