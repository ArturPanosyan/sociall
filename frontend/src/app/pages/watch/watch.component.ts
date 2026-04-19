import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

@Component({
  selector: 'app-watch', standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="max-width:1000px;margin:0 auto;padding:20px 16px">
  <div style="margin-bottom:20px">
    <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">🎬 Watch Together</h1>
    <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Watch videos in sync with friends</p>
  </div>

  <div style="display:grid;grid-template-columns:1fr 320px;gap:16px">

    <!-- Video area -->
    <div>
      @if (!videoUrl()) {
        <div style="aspect-ratio:16/9;background:linear-gradient(135deg,#1e1b4b,#0f172a);
                    border-radius:16px;display:flex;flex-direction:column;
                    align-items:center;justify-content:center;gap:16px;padding:24px">
          <div style="font-size:48px">🎬</div>
          <div style="font-size:16px;font-weight:500;color:#e0e7ff">Paste a video URL to start</div>
          <div style="display:flex;gap:8px;width:100%;max-width:400px">
            <input [(ngModel)]="urlInput" placeholder="YouTube / video URL..."
                   style="flex:1;padding:10px 14px;border-radius:10px;border:none;
                          font-size:13px;outline:none;background:rgba(255,255,255,.1);color:#fff">
            <button (click)="loadVideo()"
                    style="padding:10px 18px;background:#6366f1;color:#fff;border:none;
                           border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
              Watch
            </button>
          </div>
          <div style="font-size:12px;color:#6366f1;cursor:pointer" (click)="loadSample()">
            Load sample video
          </div>
        </div>
      } @else {
        <div style="aspect-ratio:16/9;background:#000;border-radius:16px;overflow:hidden;position:relative">
          <video [src]="videoUrl()!" controls style="width:100%;height:100%" autoplay></video>
          <div style="position:absolute;top:10px;left:10px;display:flex;align-items:center;gap:6px;
                      background:rgba(0,0,0,.6);padding:5px 10px;border-radius:20px;backdrop-filter:blur(4px)">
            <div style="width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite"></div>
            <span style="color:#fff;font-size:11px;font-weight:500">{{ watchers.length }} watching</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <input [(ngModel)]="urlInput" placeholder="Load new video URL..."
                 style="flex:1;padding:8px 14px;border:0.5px solid var(--border,#e5e7eb);
                        border-radius:9px;font-size:13px;outline:none;
                        background:var(--bg-primary,#fff);color:var(--text-primary,#111)">
          <button (click)="loadVideo()" style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:9px;font-size:13px;cursor:pointer">Change</button>
          <button (click)="videoUrl.set('')" style="padding:8px 14px;border:0.5px solid var(--border,#e5e7eb);background:none;border-radius:9px;font-size:13px;cursor:pointer;color:var(--text-secondary,#6b7280)">Stop</button>
        </div>
      }
    </div>

    <!-- Sidebar: watchers + chat -->
    <div style="display:flex;flex-direction:column;gap:10px">

      <!-- Watchers -->
      <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                  border-radius:14px;padding:14px">
        <div style="font-size:12px;font-weight:500;color:var(--text-secondary,#6b7280);
                     margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">
          👥 Watching ({{ watchers.length }})
        </div>
        @for (w of watchers; track w.name) {
          <div style="display:flex;align-items:center;gap:8px;padding:5px 0">
            <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;
                        color:#fff;font-size:11px;font-weight:500"
                 [style.background]="w.color">
              {{ w.name.charAt(0).toUpperCase() }}
            </div>
            <div style="font-size:13px;color:var(--text-primary,#111)">{{ w.name }}</div>
            @if (w.isYou) { <span style="font-size:10px;color:#6366f1;margin-left:auto">You</span> }
          </div>
        }
        <button (click)="inviteMode=!inviteMode"
                style="width:100%;margin-top:8px;padding:7px;border:0.5px dashed var(--border,#e5e7eb);
                       background:none;border-radius:8px;font-size:12px;cursor:pointer;
                       color:var(--text-secondary,#6b7280)">
          + Invite friend
        </button>
        @if (inviteMode) {
          <div style="margin-top:8px;padding:10px;background:var(--bg-secondary,#f9fafb);
                      border-radius:8px;font-size:12px;color:var(--text-secondary,#6b7280)">
            Share link: <strong style="color:#6366f1">socialnet.app/watch/room-abc123</strong>
          </div>
        }
      </div>

      <!-- Live chat -->
      <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                  border-radius:14px;padding:14px;flex:1;display:flex;flex-direction:column">
        <div style="font-size:12px;font-weight:500;color:var(--text-secondary,#6b7280);
                     margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">💬 Chat</div>
        <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;max-height:260px">
          @for (msg of chatMessages(); track $index) {
            <div style="display:flex;align-items:flex-start;gap:7px">
              <div style="width:24px;height:24px;border-radius:50%;flex-shrink:0;
                          display:flex;align-items:center;justify-content:center;
                          color:#fff;font-size:9px;font-weight:500"
                   [style.background]="msg.color">
                {{ msg.sender.charAt(0).toUpperCase() }}
              </div>
              <div>
                <span style="font-size:11px;font-weight:500;color:var(--text-secondary,#6b7280)">{{ msg.sender }}</span>
                <p style="font-size:13px;color:var(--text-primary,#111);margin:1px 0 0;line-height:1.4">{{ msg.text }}</p>
              </div>
            </div>
          }
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <input [(ngModel)]="chatInput" (keydown.enter)="sendChat()" placeholder="Say something..."
                 style="flex:1;padding:7px 10px;border:0.5px solid var(--border,#e5e7eb);
                        border-radius:8px;font-size:13px;outline:none;
                        background:var(--bg-secondary,#f9fafb);color:var(--text-primary,#111)">
          <button (click)="sendChat()"
                  style="padding:7px 12px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer">
            ➤
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
<style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}</style>
  `
})
export class WatchComponent {
  videoUrl  = signal('');
  urlInput  = '';
  chatInput = '';
  inviteMode = false;
  chatMessages = signal([
    { sender:'Alice', text:'This is so good! 😍', color:'#6366f1' },
    { sender:'Bob',   text:'Agreed! Favorite part coming up', color:'#10b981' },
  ]);
  watchers = [
    { name:'You',   isYou:true,  color:'#6366f1' },
    { name:'Alice', isYou:false, color:'#10b981' },
    { name:'Bob',   isYou:false, color:'#f59e0b' },
  ];
  colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9'];

  loadVideo() {
    if (this.urlInput.trim()) { this.videoUrl.set(this.urlInput.trim()); this.urlInput = ''; }
  }
  loadSample() {
    this.videoUrl.set('https://www.w3schools.com/html/mov_bbb.mp4');
  }
  sendChat() {
    if (!this.chatInput.trim()) return;
    this.chatMessages.update(m => [...m, {
      sender: 'You', text: this.chatInput.trim(),
      color: this.colors[0]
    }]);
    this.chatInput = '';
  }
}
