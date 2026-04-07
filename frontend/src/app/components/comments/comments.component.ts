import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { FormsModule }                      from '@angular/forms';
import { RouterLink }                       from '@angular/router';
import { HttpClient }                       from '@angular/common/http';
import { environment }                      from '../../../environments/environment';

interface Comment {
  id:         number;
  userId:     number;
  username:   string;
  fullName:   string;
  avatarUrl:  string;
  content:    string;
  likesCount: number;
  replies:    Comment[];
  createdAt:  string;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="border-t border-gray-50 px-4 py-3">

  <!-- Input -->
  <div class="flex gap-2 mb-4">
    <div class="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 overflow-hidden">
      <img [src]="currentAvatarUrl || '/assets/default-avatar.png'"
           class="w-full h-full object-cover">
    </div>
    <div class="flex-1 flex gap-2">
      <input [(ngModel)]="newComment"
             (keydown.enter)="submit()"
             placeholder="Write a comment..."
             class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none
                    focus:ring-2 focus:ring-indigo-400 transition">
      <button (click)="submit()"
              [disabled]="!newComment.trim() || submitting()"
              class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white
                     text-xs font-medium px-4 rounded-full transition">
        Post
      </button>
    </div>
  </div>

  <!-- Comments list -->
  @if (loading()) {
    <div class="space-y-3">
      @for (i of [1,2]; track i) {
        <div class="flex gap-2 animate-pulse">
          <div class="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            <div class="h-3 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      }
    </div>
  }

  <div class="space-y-3">
    @for (comment of comments(); track comment.id) {
      <!-- Top-level comment -->
      <div class="flex gap-2">
        <a [routerLink]="['/profile', comment.username]">
          <img [src]="comment.avatarUrl || '/assets/default-avatar.png'"
               class="w-8 h-8 rounded-full object-cover flex-shrink-0">
        </a>
        <div class="flex-1">
          <div class="bg-gray-100 rounded-2xl px-3 py-2">
            <a [routerLink]="['/profile', comment.username]"
               class="text-xs font-semibold text-gray-900 hover:text-indigo-600">
              {{ comment.fullName || comment.username }}
            </a>
            <p class="text-sm text-gray-800 mt-0.5">{{ comment.content }}</p>
          </div>

          <div class="flex items-center gap-4 mt-1 px-2">
            <span class="text-xs text-gray-400">{{ timeAgo(comment.createdAt) }}</span>
            <button (click)="likeComment(comment)"
                    class="text-xs text-gray-400 hover:text-red-500 transition">
              ❤️ {{ comment.likesCount }}
            </button>
            <button (click)="replyingTo.set(replyingTo() === comment.id ? null : comment.id)"
                    class="text-xs text-gray-400 hover:text-indigo-600 transition">
              Reply
            </button>
          </div>

          <!-- Reply input -->
          @if (replyingTo() === comment.id) {
            <div class="flex gap-2 mt-2 ml-2">
              <input [(ngModel)]="replyText"
                     (keydown.enter)="submitReply(comment.id)"
                     placeholder="Reply..."
                     class="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs outline-none
                            focus:ring-2 focus:ring-indigo-400">
              <button (click)="submitReply(comment.id)"
                      class="text-xs text-indigo-600 font-medium hover:text-indigo-700">
                Send
              </button>
            </div>
          }

          <!-- Replies -->
          @if (comment.replies.length) {
            <div class="mt-2 ml-4 space-y-2">
              @for (reply of comment.replies; track reply.id) {
                <div class="flex gap-2">
                  <img [src]="reply.avatarUrl || '/assets/default-avatar.png'"
                       class="w-6 h-6 rounded-full object-cover flex-shrink-0">
                  <div class="bg-gray-100 rounded-2xl px-3 py-1.5">
                    <span class="text-xs font-semibold text-gray-900">{{ reply.username }}</span>
                    <p class="text-xs text-gray-800">{{ reply.content }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  </div>

  <!-- Load more -->
  @if (!loading() && hasMore()) {
    <button (click)="loadMore()"
            class="w-full text-xs text-indigo-600 hover:text-indigo-700 mt-3 py-1">
      Load more comments
    </button>
  }
</div>
  `
})
export class CommentsComponent implements OnInit {
  @Input() postId!:         number;
  @Input() currentAvatarUrl?: string;

  comments    = signal<Comment[]>([]);
  loading     = signal(false);
  submitting  = signal(false);
  replyingTo  = signal<number | null>(null);
  hasMore     = signal(false);
  newComment  = '';
  replyText   = '';
  page        = 0;

  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${this.api}/posts/${this.postId}/comments?page=${this.page}`).subscribe({
      next: res => {
        this.comments.update(c => [...c, ...res.content]);
        this.hasMore.set(!res.last);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMore() { this.page++; this.load(); }

  submit() {
    if (!this.newComment.trim()) return;
    this.submitting.set(true);
    this.http.post<Comment>(`${this.api}/posts/${this.postId}/comments`,
      { content: this.newComment }).subscribe({
      next: c => {
        this.comments.update(list => [c, ...list]);
        this.newComment = '';
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }

  submitReply(parentId: number) {
    if (!this.replyText.trim()) return;
    this.http.post<Comment>(`${this.api}/posts/${this.postId}/comments`,
      { content: this.replyText, parentId }).subscribe({
      next: reply => {
        this.comments.update(list => list.map(c =>
          c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c
        ));
        this.replyText   = '';
        this.replyingTo.set(null);
      }
    });
  }

  likeComment(c: Comment) {
    this.http.post(`${this.api}/comments/${c.id}/like`, {}).subscribe();
    this.comments.update(list => list.map(x =>
      x.id === c.id ? { ...x, likesCount: x.likesCount + 1 } : x
    ));
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min  = Math.floor(diff / 60000);
    if (min < 1)  return 'just now';
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24)  return `${hr}h`;
    return `${Math.floor(hr / 24)}d`;
  }
}
