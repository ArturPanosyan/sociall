import { Component, OnInit, signal }   from '@angular/core';
import { CommonModule }                from '@angular/common';
import { RouterLink }                  from '@angular/router';
import { FormsModule }                 from '@angular/forms';
import { PostService, Post }           from '../../services/post.service';
import { AuthService }                 from '../../services/auth.service';
import { StoriesBarComponent }         from '../../components/stories/stories-bar.component';
import { CommentsComponent }           from '../../components/comments/comments.component';
import { ReportModalComponent }        from '../../components/report/report-modal.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StoriesBarComponent, CommentsComponent, ReportModalComponent],
  template: `
<div class="max-w-2xl mx-auto px-3 py-4">

  <!-- Stories -->
  <app-stories-bar class="mb-4 block" />

  <!-- Create Post -->
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
    <div class="flex gap-3">
      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
           style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
        {{ me?.username?.charAt(0)?.toUpperCase() }}
      </div>
      <div class="flex-1">
        <div (click)="showComposer = true"
             class="w-full px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-400 cursor-text hover:bg-gray-200 transition">
          What's on your mind, {{ me?.fullName || me?.username }}?
        </div>

        @if (showComposer) {
          <div class="mt-3">
            <textarea [(ngModel)]="newPostContent"
                      placeholder="Share something..."
                      rows="3"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
            <div class="flex items-center justify-between mt-2">
              <div class="flex gap-2">
                <button class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition">
                  📷 Photo
                </button>
                <button class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition">
                  😊 Emoji
                </button>
              </div>
              <div class="flex gap-2">
                <button (click)="showComposer = false; newPostContent = ''"
                        class="px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button (click)="createPost()"
                        [disabled]="!newPostContent.trim() || posting()"
                        class="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm rounded-lg transition font-medium">
                  {{ posting() ? 'Posting...' : 'Post' }}
                </button>
              </div>
            </div>
          </div>
        } @else {
          <div class="flex gap-4 mt-3">
            <button class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition">
              📷 <span>Photo</span>
            </button>
            <button class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition">
              🎬 <span>Video</span>
            </button>
            <button class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition">
              😊 <span>Feeling</span>
            </button>
          </div>
        }
      </div>
    </div>
  </div>

  <!-- Feed Toggle -->
  <div class="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-4 gap-1">
    <button (click)="tab = 'all'"
            class="flex-1 py-1.5 text-sm rounded-lg font-medium transition"
            [class.bg-indigo-600]="tab === 'all'" [class.text-white]="tab === 'all'"
            [class.text-gray-500]="tab !== 'all'">For You</button>
    <button (click)="tab = 'following'"
            class="flex-1 py-1.5 text-sm rounded-lg font-medium transition"
            [class.bg-indigo-600]="tab === 'following'" [class.text-white]="tab === 'following'"
            [class.text-gray-500]="tab !== 'following'">Following</button>
  </div>

  <!-- Posts -->
  @if (loading()) {
    @for (i of [1,2,3]; track i) {
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-3 animate-pulse">
        <div class="flex gap-3 mb-4">
          <div class="w-11 h-11 bg-gray-200 rounded-full"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="h-3.5 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
        </div>
        <div class="space-y-2 mb-4">
          <div class="h-3 bg-gray-100 rounded"></div>
          <div class="h-3 bg-gray-100 rounded w-4/5"></div>
        </div>
      </div>
    }
  }

  @for (post of posts(); track post.id) {
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 overflow-hidden">

      <!-- Header -->
      <div class="flex items-start gap-3 p-4 pb-2">
        <a [routerLink]="['/profile', post.username]">
          @if (post.avatarUrl) {
            <img [src]="post.avatarUrl" class="w-11 h-11 rounded-full object-cover">
          } @else {
            <div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                 [style.background]="avatarGradient(post.username)">
              {{ post.username.charAt(0).toUpperCase() }}
            </div>
          }
        </a>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <a [routerLink]="['/profile', post.username]"
               class="font-semibold text-gray-900 text-sm hover:text-indigo-600 transition">
              {{ post.fullName || post.username }}
            </a>
            <span class="text-gray-300 text-xs">·</span>
            <span class="text-gray-400 text-xs">{{ post.createdAt | date:'MMM d' }}</span>
          </div>
          <p class="text-xs text-gray-400">&#64;{{ post.username }}</p>
        </div>
        <button (click)="toggleMenu(post.id)"
                class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 text-base transition">
          ⋯
        </button>
      </div>

      <!-- Content -->
      @if (post.content) {
        <p class="px-4 py-2 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
      }

      <!-- Media -->
      @if (post.mediaUrls?.length) {
        <div class="mt-1" [class.grid]="post.mediaUrls.length > 1" [class.grid-cols-2]="post.mediaUrls.length > 1">
          @for (url of post.mediaUrls.slice(0, 4); track url; let i = $index) {
            <div class="relative" [class.col-span-2]="post.mediaUrls.length === 1">
              <img [src]="url" class="w-full object-cover" [class.max-h-80]="post.mediaUrls.length === 1" [class.h-48]="post.mediaUrls.length > 1">
              @if (i === 3 && post.mediaUrls.length > 4) {
                <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span class="text-white text-2xl font-bold">+{{ post.mediaUrls.length - 4 }}</span>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Stats -->
      <div class="flex items-center justify-between px-4 py-2 text-xs text-gray-400 border-b border-gray-50">
        <span>{{ post.likesCount }} likes</span>
        <div class="flex gap-3">
          <span>{{ post.commentsCount }} comments</span>
          <span>{{ post.viewsCount }} views</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex border-b border-gray-50">
        <button (click)="toggleLike(post)"
                class="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition"
                [class.text-red-500]="post.isLiked" [class.text-gray-500]="!post.isLiked"
                [class.hover:bg-red-50]="!post.isLiked" [class.hover:bg-gray-50]="post.isLiked">
          <span class="text-base">{{ post.isLiked ? '❤️' : '🤍' }}</span>
          Like
        </button>
        <button (click)="toggleComments(post.id)"
                class="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition border-x border-gray-50">
          <span class="text-base">💬</span>
          Comment
        </button>
        <button (click)="share(post)"
                class="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition">
          <span class="text-base">↗️</span>
          Share
        </button>
      </div>

      <!-- Comments -->
      @if (openComments.has(post.id)) {
        <app-comments [postId]="post.id" [currentAvatarUrl]="me?.avatarUrl" />
      }
    </div>
  }

  <!-- Load more -->
  @if (!loading() && !lastPage()) {
    <button (click)="loadMore()"
            class="w-full py-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
      Load more posts
    </button>
  }

  @if (!loading() && !posts().length) {
    <div class="text-center py-16 text-gray-400">
      <div class="text-5xl mb-3">🌱</div>
      <p class="font-medium text-lg text-gray-600">Your feed is empty</p>
      <p class="text-sm mt-1 mb-4">Follow people to see their posts here</p>
      <a routerLink="/explore" class="inline-block px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
        Discover People
      </a>
    </div>
  }

  <!-- Report modal -->
  @if (reportPostId) {
    <app-report-modal entityType="POST" [entityId]="reportPostId" (closed)="reportPostId = 0" />
  }
</div>
  `
})
export class FeedComponent implements OnInit {
  posts    = signal<Post[]>([]);
  loading  = signal(true);
  posting  = signal(false);
  lastPage = signal(false);

  newPostContent = '';
  showComposer   = false;
  tab            = 'all';
  page           = 0;
  openComments   = new Set<number>();
  reportPostId   = 0;
  openMenuId     = 0;
  me             = this.auth.currentUser();

  gradients = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#0ea5e9,#06b6d4)',
    'linear-gradient(135deg,#f43f5e,#ec4899)',
    'linear-gradient(135deg,#f59e0b,#f97316)',
    'linear-gradient(135deg,#10b981,#22c55e)',
    'linear-gradient(135deg,#8b5cf6,#d946ef)',
  ];

  constructor(private postSvc: PostService, public auth: AuthService) {}

  ngOnInit() { this.loadFeed(); }

  loadFeed() {
    this.loading.set(true);
    this.postSvc.getFeed(this.page, 20).subscribe({
      next: res => {
        this.posts.update(p => [...p, ...res.content]);
        this.lastPage.set(res.last);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMore() { this.page++; this.loadFeed(); }

  createPost() {
    if (!this.newPostContent.trim()) return;
    this.posting.set(true);
    this.postSvc.createPost({ content: this.newPostContent, visibility: 'PUBLIC' }).subscribe({
      next: post => {
        this.posts.update(p => [post as any, ...p]);
        this.newPostContent = '';
        this.showComposer   = false;
        this.posting.set(false);
      },
      error: () => this.posting.set(false)
    });
  }

  toggleLike(post: Post) {
    this.postSvc.toggleLike(post.id).subscribe();
    this.posts.update(list => list.map(p => p.id === post.id
      ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
      : p
    ));
  }

  toggleComments(id: number) {
    this.openComments.has(id) ? this.openComments.delete(id) : this.openComments.add(id);
  }

  toggleMenu(id: number) { this.openMenuId = this.openMenuId === id ? 0 : id; }

  share(post: Post) {
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.share ? navigator.share({ url, title: 'SocialNet Post' })
                    : (navigator.clipboard.writeText(url), alert('Link copied!'));
  }

  avatarGradient(username: string): string {
    return this.gradients[username.charCodeAt(0) % this.gradients.length];
  }
}
