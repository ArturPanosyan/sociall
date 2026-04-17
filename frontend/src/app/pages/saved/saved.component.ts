import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { HttpClient }    from '@angular/common/http';
import { PostService, Post } from '../../services/post.service';
import { AuthService }       from '../../services/auth.service';
import { environment }       from '../../../environments/environment';

@Component({
  selector: 'app-saved', standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div style="max-width:900px;margin:0 auto;padding:20px 16px">
  <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111);margin-bottom:6px">🔖 Saved Posts</h1>
  <p style="font-size:13px;color:var(--text-secondary,#6b7280);margin-bottom:20px">Your personal collection</p>

  <!-- Collections -->
  <div style="display:flex;gap:10px;margin-bottom:20px;overflow-x:auto;padding-bottom:4px">
    @for (col of collections; track col.name) {
      <div (click)="activeCol=col.name"
           style="flex-shrink:0;padding:8px 16px;border-radius:20px;font-size:13px;
                  font-weight:500;cursor:pointer;transition:all .15s"
           [style.background]="activeCol===col.name ? '#6366f1' : 'var(--bg-primary,#fff)'"
           [style.color]="activeCol===col.name ? '#fff' : 'var(--text-primary,#111)'"
           [style.border]="activeCol===col.name ? 'none' : '0.5px solid var(--border,#e5e7eb)'">
        {{ col.icon }} {{ col.name }}
      </div>
    }
    <button (click)="newCol()"
            style="flex-shrink:0;padding:8px 16px;border:0.5px dashed var(--border,#e5e7eb);
                   border-radius:20px;font-size:13px;background:none;cursor:pointer;
                   color:var(--text-secondary,#6b7280)">
      + Collection
    </button>
  </div>

  @if (!posts().length) {
    <div style="text-align:center;padding:80px 20px">
      <div style="font-size:56px;margin-bottom:16px">🔖</div>
      <div style="font-size:18px;font-weight:500;color:var(--text-primary,#111);margin-bottom:8px">Nothing saved yet</div>
      <p style="font-size:14px;color:var(--text-secondary,#6b7280);line-height:1.5">
        Tap the bookmark icon on any post<br>to save it here
      </p>
      <a routerLink="/feed"
         style="display:inline-block;margin-top:20px;padding:10px 24px;background:#6366f1;
                color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:500">
        Browse Feed
      </a>
    </div>
  } @else {
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">
      @for (p of posts(); track p.id) {
        <a [routerLink]="['/posts', p.id]"
           style="aspect-ratio:1;display:block;position:relative;overflow:hidden;
                  background:linear-gradient(135deg,#6366f1,#8b5cf6);text-decoration:none">
          @if (p.mediaUrls?.length) {
            <img [src]="p.mediaUrls[0]" style="width:100%;height:100%;object-fit:cover">
          } @else {
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:10px">
              <p style="font-size:12px;color:rgba(255,255,255,.9);text-align:center;line-height:1.4;
                         display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">
                {{ p.content }}
              </p>
            </div>
          }
        </a>
      }
    </div>
  }
</div>
  `
})
export class SavedComponent implements OnInit {
  posts      = signal<Post[]>([]);
  activeCol  = 'All';
  collections = [
    { name:'All', icon:'🔖' }, { name:'Design', icon:'🎨' },
    { name:'Code', icon:'💻' }, { name:'Travel', icon:'✈️' }, { name:'Food', icon:'🍕' }
  ];

  constructor(private postSvc: PostService) {}
  ngOnInit() {
    // Загружаем liked posts как saved (в реальности нужна отдельная таблица)
    this.postSvc.getFeed(0, 12).subscribe({
      next: r => this.posts.set(r.content.filter(p => p.isLiked))
    });
  }
  newCol() { const n = prompt('Collection name:'); if (n) this.collections.push({ name: n, icon: '📁' }); }
}
