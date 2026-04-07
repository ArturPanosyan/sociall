import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient }                from '@angular/common/http';
import { AuthService }               from '../../services/auth.service';
import { PostService, Post }         from '../../services/post.service';
import { CommentsComponent }         from '../../components/comments/comments.component';
import { ReportModalComponent }      from '../../components/report/report-modal.component';
import { CallButtonComponent }       from '../../components/call/call-button.component';
import { environment }               from '../../../environments/environment';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CommentsComponent, ReportModalComponent, CallButtonComponent],
  template: `
<div class="max-w-2xl mx-auto px-4 py-6">

  <!-- Back -->
  <button onclick="history.back()"
          class="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-5 transition">
    <span class="text-xl">←</span> Back
  </button>

  @if (loading()) {
    <div class="bg-white rounded-2xl p-8 text-center animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-3"></div>
      <div class="h-32 bg-gray-100 rounded"></div>
    </div>
  }

  @if (post()) {
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      <!-- Author header -->
      <div class="flex items-center justify-between px-5 pt-5 pb-3">
        <a [routerLink]="['/profile', post()!.username]" class="flex items-center gap-3">
          <img [src]="post()!.avatarUrl || '/assets/default-avatar.png'"
               class="w-12 h-12 rounded-full object-cover">
          <div>
            <p class="font-semibold text-gray-900 hover:text-indigo-600">
              {{ post()!.fullName || post()!.username }}
            </p>
            <p class="text-xs text-gray-400">
              &#64;{{ post()!.username }} · {{ post()!.createdAt | date:'MMM d, y · HH:mm' }}
            </p>
          </div>
        </a>

        <div class="flex items-center gap-2">
          <!-- Call buttons (если не свой пост) -->
          @if (post()!.username !== auth.currentUser()?.username) {
            <app-call-button [username]="post()!.username" />
          }

          <!-- More menu -->
          <div class="relative">
            <button (click)="showMenu.set(!showMenu())"
                    class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center
                           justify-center text-gray-400 transition text-lg">⋯</button>
            @if (showMenu()) {
              <div class="absolute right-0 top-10 bg-white rounded-xl shadow-lg border
                          border-gray-100 overflow-hidden z-10 w-40">
                @if (post()!.username === auth.currentUser()?.username) {
                  <button (click)="deletePost()"
                          class="w-full text-left px-4 py-2.5 text-sm text-red-500
                                 hover:bg-red-50 transition">🗑 Delete Post</button>
                } @else {
                  <button (click)="showReport.set(true); showMenu.set(false)"
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700
                                 hover:bg-gray-50 transition">🚩 Report</button>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Content -->
      @if (post()!.content) {
        <p class="px-5 pb-4 text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
          {{ post()!.content }}
        </p>
      }

      <!-- Media grid -->
      @if (post()!.mediaUrls.length) {
        <div class="grid gap-0.5"
             [class.grid-cols-1]="post()!.mediaUrls.length === 1"
             [class.grid-cols-2]="post()!.mediaUrls.length > 1">
          @for (url of post()!.mediaUrls; track url) {
            <img [src]="url" class="w-full aspect-square object-cover">
          }
        </div>
      }

      <!-- Hashtags -->
      @if (post()!.hashtags.length) {
        <div class="flex flex-wrap gap-2 px-5 py-3">
          @for (tag of post()!.hashtags; track tag) {
            <a [routerLink]="['/hashtag', tag]"
               class="text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
              #{{ tag }}
            </a>
          }
        </div>
      }

      <!-- Stats bar -->
      <div class="flex items-center gap-6 px-5 py-3 border-t border-gray-50 text-sm text-gray-400">
        <span>❤️ {{ post()!.likesCount }} likes</span>
        <span>💬 {{ post()!.commentsCount }} comments</span>
        <span>👁 {{ post()!.viewsCount }} views</span>
      </div>

      <!-- Action buttons -->
      <div class="flex border-t border-gray-100">
        <button (click)="toggleLike()"
                class="flex-1 flex items-center justify-center gap-2 py-3 text-sm
                       font-medium transition hover:bg-gray-50"
                [class.text-red-500]="post()!.isLiked"
                [class.text-gray-500]="!post()!.isLiked">
          {{ post()!.isLiked ? '❤️' : '🤍' }} Like
        </button>
        <button class="flex-1 flex items-center justify-center gap-2 py-3 text-sm
                       font-medium text-gray-500 hover:bg-gray-50 transition border-l border-gray-100">
          💬 Comment
        </button>
        <button (click)="share()"
                class="flex-1 flex items-center justify-center gap-2 py-3 text-sm
                       font-medium text-gray-500 hover:bg-gray-50 transition border-l border-gray-100">
          🔁 Share
        </button>
      </div>

      <!-- Comments section -->
      <app-comments [postId]="post()!.id"
                    [currentAvatarUrl]="auth.currentUser()?.avatarUrl" />
    </div>
  }

  <!-- Report Modal -->
  @if (showReport() && post()) {
    <app-report-modal
      entityType="POST"
      [entityId]="post()!.id"
      (closed)="showReport.set(false)" />
  }
</div>
  `
})
export class PostDetailComponent implements OnInit {
  post     = signal<Post | null>(null);
  loading  = signal(true);
  showMenu = signal(false);
  showReport = signal(false);

  constructor(
    private route:   ActivatedRoute,
    private postSvc: PostService,
    private http:    HttpClient,
    public  auth:    AuthService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.postSvc.getPost(id).subscribe({
      next: p  => { this.post.set(p as any); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleLike() {
    const p = this.post();
    if (!p) return;
    this.postSvc.toggleLike(p.id).subscribe();
    this.post.update(x => x ? {
      ...x,
      isLiked:    !x.isLiked,
      likesCount: x.isLiked ? x.likesCount - 1 : x.likesCount + 1
    } : x);
  }

  deletePost() {
    const p = this.post();
    if (!p) return;
    if (!confirm('Delete this post?')) return;
    this.postSvc.deletePost(p.id).subscribe(() => history.back());
  }

  share() {
    if (navigator.share) {
      navigator.share({ url: window.location.href, title: 'SocialNet Post' });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  }
}
