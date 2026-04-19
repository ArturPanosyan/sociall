import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Story { id: number; mediaUrl: string; username: string; avatarUrl?: string; type?: string; }

@Component({
  selector: 'app-story-viewer', standalone: true,
  imports: [CommonModule],
  template: `
<div style="position:fixed;inset:0;background:#000;z-index:200;display:flex;align-items:center;justify-content:center">

  <!-- Close -->
  <button (click)="close.emit()" style="position:absolute;top:16px;right:16px;z-index:10;
          background:none;border:none;color:#fff;font-size:28px;cursor:pointer;
          width:36px;height:36px;display:flex;align-items:center;justify-content:center">×</button>

  <!-- Progress bars -->
  <div style="position:absolute;top:12px;left:16px;right:52px;display:flex;gap:4px;z-index:10">
    @for (s of stories; track s.id; let i = $index) {
      <div style="flex:1;height:2px;background:rgba(255,255,255,.3);border-radius:2px;overflow:hidden">
        <div style="height:100%;background:#fff;transition:width .1s linear"
             [style.width]="i < current() ? '100%' : i === current() ? progress()+'%' : '0%'"></div>
      </div>
    }
  </div>

  <!-- Author -->
  <div style="position:absolute;top:28px;left:16px;display:flex;align-items:center;gap:8px;z-index:10">
    <div style="width:36px;height:36px;border-radius:50%;background:#6366f1;
                border:2px solid #fff;display:flex;align-items:center;justify-content:center;
                color:#fff;font-size:13px;font-weight:500;overflow:hidden">
      {{ currentStory()?.username?.charAt(0)?.toUpperCase() }}
    </div>
    <div>
      <div style="color:#fff;font-size:13px;font-weight:500">{{ currentStory()?.username }}</div>
      <div style="color:rgba(255,255,255,.6);font-size:11px">just now</div>
    </div>
  </div>

  <!-- Story media -->
  <div style="width:100%;max-width:400px;height:100%;max-height:700px;position:relative">
    @if (currentStory()?.type === 'VIDEO') {
      <video [src]="currentStory()!.mediaUrl" style="width:100%;height:100%;object-fit:cover" autoplay muted loop></video>
    } @else {
      <img [src]="currentStory()!.mediaUrl" style="width:100%;height:100%;object-fit:cover">
    }

    <!-- Tap zones -->
    <div style="position:absolute;inset:0;display:flex">
      <div style="flex:1;cursor:pointer" (click)="prev()"></div>
      <div style="flex:1;cursor:pointer" (click)="next()"></div>
    </div>
  </div>

  <!-- Reactions -->
  <div style="position:absolute;bottom:24px;left:0;right:0;display:flex;justify-content:center;gap:12px;z-index:10">
    @for (r of reactions; track r) {
      <button (click)="react(r)"
              style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);
                     border:none;cursor:pointer;font-size:22px;transition:transform .15s;
                     backdrop-filter:blur(4px)"
              class="react-btn">
        {{ r }}
      </button>
    }
  </div>
</div>
<style>.react-btn:hover{transform:scale(1.2) translateY(-4px)}</style>
  `
})
export class StoryViewerComponent implements OnInit, OnDestroy {
  @Input()  stories: Story[] = [];
  @Input()  startIndex = 0;
  @Output() close = new EventEmitter<void>();

  current  = signal(0);
  progress = signal(0);
  reactions = ['❤️','😂','😮','😢','🔥','👏'];
  private timer: any;
  private interval: any;

  ngOnInit() {
    this.current.set(this.startIndex);
    this.startTimer();
  }

  currentStory() { return this.stories[this.current()]; }

  startTimer() {
    clearInterval(this.interval);
    this.progress.set(0);
    this.interval = setInterval(() => {
      this.progress.update(p => {
        if (p >= 100) { this.next(); return 0; }
        return p + (100 / 50); // 5s duration
      });
    }, 100);
  }

  next() {
    if (this.current() < this.stories.length - 1) {
      this.current.update(c => c + 1);
      this.startTimer();
    } else {
      this.close.emit();
    }
  }

  prev() {
    if (this.current() > 0) {
      this.current.update(c => c - 1);
      this.startTimer();
    }
  }

  react(emoji: string) {
    // Float emoji animation could go here
    console.log('Reacted:', emoji);
  }

  ngOnDestroy() { clearInterval(this.interval); }
}
