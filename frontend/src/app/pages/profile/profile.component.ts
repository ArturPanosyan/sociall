import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService, Post }         from '../../services/post.service';
import { UserService }               from '../../services/user.service';
import { AuthService }               from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="max-w-2xl mx-auto">

  @if (loading()) {
    <div class="flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  }

  @if (user()) {
    <!-- Cover -->
    <div class="h-40 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 relative">
      @if (user()!.coverUrl) {
        <img [src]="user()!.coverUrl" class="w-full h-full object-cover absolute inset-0">
      }
    </div>

    <!-- Profile Info -->
    <div class="bg-white border-b border-gray-100 px-4 pb-4">
      <div class="flex items-end justify-between -mt-12 mb-3">
        <div class="relative">
          <img [src]="user()!.avatarUrl || '/assets/default-avatar.png'"
               class="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-md">
          @if (user()!.isVerified) {
            <span class="absolute -bottom-1 -right-1 text-lg">✅</span>
          }
        </div>

        <!-- Actions -->
        @if (isOwnProfile()) {
          <button class="px-5 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium
                         hover:bg-gray-50 transition">Edit Profile</button>
        } @else {
          <button (click)="toggleFollow()"
                  class="px-5 py-2 rounded-xl text-sm font-semibold transition"
                  [class.bg-indigo-600]="!isFollowing()"
                  [class.text-white]="!isFollowing()"
                  [class.hover:bg-indigo-700]="!isFollowing()"
                  [class.border-2]="isFollowing()"
                  [class.border-gray-200]="isFollowing()"
                  [class.hover:border-red-300]="isFollowing()"
                  [class.hover:text-red-500]="isFollowing()">
            {{ isFollowing() ? 'Following' : 'Follow' }}
          </button>
        }
      </div>

      <h1 class="text-xl font-bold text-gray-900">{{ user()!.fullName || user()!.username }}</h1>
      <p class="text-gray-500 text-sm">&#64;{{ user()!.username }}</p>

      @if (user()!.bio) {
        <p class="text-gray-700 text-sm mt-2">{{ user()!.bio }}</p>
      }

      <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
        @if (user()!.location) {
          <span>📍 {{ user()!.location }}</span>
        }
        @if (user()!.website) {
          <a [href]="user()!.website" target="_blank" class="text-indigo-600 hover:underline">
            🔗 {{ user()!.website }}
          </a>
        }
      </div>

      <!-- Stats -->
      <div class="flex gap-6 mt-4 text-sm">
        <div class="text-center">
          <p class="font-bold text-gray-900">{{ user()!.postsCount }}</p>
          <p class="text-gray-500">Posts</p>
        </div>
        <button class="text-center hover:opacity-70 transition">
          <p class="font-bold text-gray-900">{{ user()!.followersCount }}</p>
          <p class="text-gray-500">Followers</p>
        </button>
        <button class="text-center hover:opacity-70 transition">
          <p class="font-bold text-gray-900">{{ user()!.followingCount }}</p>
          <p class="text-gray-500">Following</p>
        </button>
      </div>
    </div>

    <!-- Posts Grid -->
    <div class="grid grid-cols-3 gap-0.5 bg-gray-100">
      @for (post of posts(); track post.id) {
        <div class="aspect-square bg-gray-200 relative group cursor-pointer overflow-hidden">
          @if (post.mediaUrls.length) {
            <img [src]="post.mediaUrls[0]" class="w-full h-full object-cover">
          } @else {
            <div class="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100
                        flex items-center justify-center p-2">
              <p class="text-xs text-gray-600 line-clamp-4 text-center">{{ post.content }}</p>
            </div>
          }
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                      transition flex items-center justify-center gap-3 text-white text-sm">
            <span>❤️ {{ post.likesCount }}</span>
            <span>💬 {{ post.commentsCount }}</span>
          </div>
        </div>
      }
    </div>

    @if (!loading() && posts().length === 0) {
      <div class="text-center py-16 text-gray-400 bg-white">
        <p class="text-4xl mb-3">📷</p>
        <p class="font-medium">No posts yet</p>
      </div>
    }
  }
</div>
  `
})
export class ProfileComponent implements OnInit {
  user        = signal<any>(null);
  posts       = signal<Post[]>([]);
  loading     = signal(true);
  isFollowing = signal(false);

  constructor(
    private route:   ActivatedRoute,
    private userSvc: UserService,
    private postSvc: PostService,
    public  auth:    AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(({ username }) => {
      this.loadProfile(username);
      this.loadPosts(username);
    });
  }

  get isOwnProfile() {
    return () => this.user()?.username === this.auth.currentUser()?.username;
  }

  loadProfile(username: string) {
    this.userSvc.getProfile(username).subscribe({
      next:  u  => { this.user.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadPosts(username: string) {
    this.postSvc.getUserPosts(username).subscribe({
      next: res => this.posts.set(res.content)
    });
  }

  toggleFollow() {
    const username = this.user()?.username;
    if (!username) return;
    this.userSvc.toggleFollow(username).subscribe();
    this.isFollowing.update(v => !v);
    this.user.update(u => ({
      ...u,
      followersCount: u.followersCount + (this.isFollowing() ? 1 : -1)
    }));
  }
}
