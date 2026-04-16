import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../../environments/environment';

interface Reel {
  id: number; caption: string; videoUrl: string;
  username: string; fullName: string; avatarUrl: string;
  likesCount: number; commentsCount: number; isLiked: boolean;
}

@Component({
  selector: 'app-reels', standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [`
    .reels-container { height: calc(100vh - 56px); overflow-y: scroll; scroll-snap-type: y mandatory; scrollbar-width: none; }
    .reels-container::-webkit-scrollbar { display: none; }
    .reel-item { height: calc(100vh - 56px); scroll-snap-align: start; position: relative; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .reel-video { width: 100%; height: 100%; object-fit: cover; }
    .reel-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%); }
    .reel-actions { position: absolute; right: 16px; bottom: 100px; display: flex; flex-direction: column; gap: 20px; align-items: center; }
    .reel-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; color: #fff; }
    .reel-btn-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.15); display: flex; align-items: center; justify-content: center; font-size: 20px; transition: transform .15s; backdrop-filter: blur(4px); }
    .reel-btn-icon:hover { transform: scale(1.1); }
    .reel-btn span { font-size: 12px; font-weight: 500; }
    .reel-info { position: absolute; left: 16px; bottom: 80px; right: 80px; }
    .placeholder-video { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e1b4b, #4c1d95); }
    .upload-btn { position: fixed; top: 70px; right: 16px; z-index: 50; padding: 8px 16px; background: rgba(255,255,255,.15); color: #fff; border: 0.5px solid rgba(255,255,255,.3); border-radius: 20px; font-size: 13px; cursor: pointer; backdrop-filter: blur(8px); }
  `],
  template: `
<div style="background:#000;min-height:calc(100vh - 56px)">

  <button class="upload-btn" (click)="fileInput.click()">+ Upload Reel</button>
  <input #fileInput type="file" accept="video/*" style="display:none" (change)="upload(fileInput.files)">

  @if (uploading()) {
    <div style="position:fixed;top:70px;left:50%;transform:translateX(-50%);
                background:rgba(0,0,0,.8);color:#fff;padding:10px 20px;
                border-radius:20px;font-size:13px;z-index:100">
      Uploading reel... ⏳
    </div>
  }

  <div class="reels-container">
    @for (reel of reels(); track reel.id; let i = $index) {
      <div class="reel-item">

        <!-- Video or placeholder -->
        @if (reel.videoUrl) {
          <video class="reel-video" [src]="reel.videoUrl" loop playsinline
                 (click)="togglePlay($event)" preload="metadata"></video>
        } @else {
          <div class="placeholder-video">
            <div style="text-align:center;color:rgba(255,255,255,.7)">
              <div style="font-size:48px;margin-bottom:8px">🎬</div>
              <div style="font-size:14px">{{ reel.caption || 'Reel' }}</div>
            </div>
          </div>
        }

        <div class="reel-overlay"></div>

        <!-- Right actions -->
        <div class="reel-actions">
          <!-- Like -->
          <button class="reel-btn" (click)="like(reel)">
            <div class="reel-btn-icon" [style.background]="reel.isLiked ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.15)'">
              {{ reel.isLiked ? '❤️' : '🤍' }}
            </div>
            <span>{{ reel.likesCount }}</span>
          </button>

          <!-- Comment -->
          <button class="reel-btn" (click)="commentOpen = reel.id">
            <div class="reel-btn-icon">💬</div>
            <span>{{ reel.commentsCount }}</span>
          </button>

          <!-- Share -->
          <button class="reel-btn" (click)="share(reel)">
            <div class="reel-btn-icon">↗️</div>
            <span>Share</span>
          </button>

          <!-- Author avatar -->
          <a [routerLink]="['/profile', reel.username]" style="text-decoration:none">
            <div style="width:44px;height:44px;border-radius:50%;border:2px solid #fff;overflow:hidden;
                        background:#6366f1;display:flex;align-items:center;justify-content:center;
                        color:#fff;font-size:16px;font-weight:500">
              @if (reel.avatarUrl) { <img [src]="reel.avatarUrl" style="width:100%;height:100%;object-fit:cover"> }
              @else { {{ reel.username.charAt(0).toUpperCase() }} }
            </div>
          </a>
        </div>

        <!-- Bottom info -->
        <div class="reel-info">
          <a [routerLink]="['/profile', reel.username]"
             style="display:flex;align-items:center;gap:8px;text-decoration:none;margin-bottom:8px">
            <span style="font-size:14px;font-weight:600;color:#fff">&#64;{{ reel.username }}</span>
          </a>
          @if (reel.caption) {
            <p style="font-size:13px;color:rgba(255,255,255,.9);line-height:1.5;
                      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
              {{ reel.caption }}
            </p>
          }
          <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
            <span style="font-size:18px;animation:spin 3s linear infinite">🎵</span>
            <span style="font-size:12px;color:rgba(255,255,255,.8)">Original audio</span>
          </div>
        </div>
      </div>
    }

    @if (!reels().length && !loading()) {
      <div style="height:calc(100vh - 56px);display:flex;flex-direction:column;
                  align-items:center;justify-content:center;color:rgba(255,255,255,.7)">
        <div style="font-size:56px;margin-bottom:16px">🎬</div>
        <div style="font-size:18px;font-weight:500;color:#fff;margin-bottom:8px">No Reels yet</div>
        <div style="font-size:14px;text-align:center">Be the first to upload a short video!</div>
        <button (click)="fileInput2.click()"
                style="margin-top:20px;padding:12px 24px;background:#6366f1;color:#fff;
                       border:none;border-radius:12px;font-size:14px;cursor:pointer">
          Upload First Reel
        </button>
        <input #fileInput2 type="file" accept="video/*" style="display:none" (change)="upload(fileInput2.files)">
      </div>
    }
  </div>
</div>

<style>
@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
</style>
  `
})
export class ReelsComponent implements OnInit {
  reels     = signal<Reel[]>([]);
  loading   = signal(true);
  uploading = signal(false);
  commentOpen = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/reels`).subscribe({
      next: r => { this.reels.set(r.content || []); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  like(reel: Reel) {
    this.http.post(`${environment.apiUrl}/posts/${reel.id}/like`, {}).subscribe();
    this.reels.update(list => list.map(r => r.id === reel.id
      ? { ...r, isLiked: !r.isLiked, likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1 }
      : r));
  }

  upload(files: FileList | null) {
    if (!files?.length) return;
    this.uploading.set(true);
    const fd = new FormData();
    fd.append('file', files[0]);
    this.http.post<any>(`${environment.apiUrl}/reels`, fd).subscribe({
      next: r => { this.reels.update(l => [r, ...l]); this.uploading.set(false); },
      error: () => this.uploading.set(false)
    });
  }

  togglePlay(e: Event) {
    const v = e.target as HTMLVideoElement;
    v.paused ? v.play() : v.pause();
  }

  share(reel: Reel) {
    const url = `${location.origin}/posts/${reel.id}`;
    navigator.share ? navigator.share({ url, title: 'Reel' }) : (navigator.clipboard.writeText(url));
  }
}
