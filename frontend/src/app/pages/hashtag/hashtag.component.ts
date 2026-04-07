import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService, Post }         from '../../services/post.service';

@Component({
  selector: 'app-hashtag',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="max-w-2xl mx-auto px-4 py-6">

  <!-- Header -->
  <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
    <p class="text-4xl font-bold mb-1">#{{ tag() }}</p>
    <p class="text-indigo-100 text-sm">{{ totalPosts() | number }} posts</p>
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
    @for (t of ['Top', 'Recent']; track t) {
      <button (click)="activeTab.set(t)"
              class="flex-1 py-2 text-sm font-medium rounded-lg transition"
              [class.bg-white]="activeTab() === t"
              [class.shadow-sm]="activeTab() === t"
              [class.text-gray-900]="activeTab() === t"
              [class.text-gray-500]="activeTab() !== t">
        {{ t }}
      </button>
    }
  </div>

  <!-- Posts Grid -->
  @if (loading()) {
    <div class="grid grid-cols-3 gap-1">
      @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
        <div class="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
      }
    </div>
  } @else if (posts().length) {
    <div class="grid grid-cols-3 gap-1">
      @for (post of posts(); track post.id) {
        <a [routerLink]="['/profile', post.username]"
           class="aspect-square bg-gray-100 overflow-hidden rounded-lg group relative">
          @if (post.mediaUrls.length) {
            <img [src]="post.mediaUrls[0]" class="w-full h-full object-cover
                        group-hover:scale-105 transition duration-300">
          } @else {
            <div class="w-full h-full flex items-center justify-center p-2
                        bg-gradient-to-br from-indigo-50 to-purple-50">
              <p class="text-xs text-gray-600 line-clamp-4 text-center">{{ post.content }}</p>
            </div>
          }
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                      transition flex items-center justify-center gap-3 text-white text-xs font-medium">
            <span>❤️ {{ post.likesCount }}</span>
            <span>💬 {{ post.commentsCount }}</span>
          </div>
        </a>
      }
    </div>

    @if (!lastPage()) {
      <button (click)="loadMore()"
              class="w-full mt-4 py-3 text-sm text-indigo-600 font-medium
                     hover:bg-indigo-50 rounded-2xl transition">
        Load more
      </button>
    }
  } @else {
    <div class="text-center py-16 text-gray-400">
      <p class="text-5xl mb-4">#️⃣</p>
      <p class="font-medium">No posts with #{{ tag() }} yet</p>
      <p class="text-sm mt-1">Be the first to post!</p>
    </div>
  }
</div>
  `
})
export class HashtagComponent implements OnInit {
  tag        = signal('');
  posts      = signal<Post[]>([]);
  loading    = signal(true);
  lastPage   = signal(false);
  totalPosts = signal(0);
  activeTab  = signal('Top');
  page       = 0;

  constructor(private route: ActivatedRoute, private postSvc: PostService) {}

  ngOnInit() {
    this.route.params.subscribe(({ tag }) => {
      this.tag.set(tag);
      this.posts.set([]);
      this.page = 0;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.postSvc.getByHashtag(this.tag(), this.page).subscribe({
      next: res => {
        this.posts.update(p => [...p, ...res.content]);
        this.lastPage.set(res.last);
        this.totalPosts.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMore() { this.page++; this.load(); }
}
