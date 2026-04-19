import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { HttpClient }    from '@angular/common/http';
import { AuthService }   from '../../services/auth.service';
import { environment }   from '../../../environments/environment';

@Component({
  selector: 'app-rooms', standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="max-width:900px;margin:0 auto;padding:20px 16px">

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div>
      <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">🎙️ Audio Rooms</h1>
      <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Live audio spaces like Twitter Spaces</p>
    </div>
    <button (click)="createMode=!createMode"
            style="padding:8px 18px;background:#ef4444;color:#fff;border:none;
                   border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
      🔴 Go Live
    </button>
  </div>

  <!-- Active room panel -->
  @if (activeRoom()) {
    <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:20px;
                padding:24px;margin-bottom:20px;color:#fff">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="width:8px;height:8px;border-radius:50%;background:#ef4444;animation:pulse 1.2s infinite"></div>
            <span style="font-size:11px;font-weight:600;letter-spacing:.5px;color:#fca5a5">LIVE</span>
            <span style="font-size:11px;color:#a5b4fc">{{ activeRoom()!.type === 'VIDEO' ? '📹 Video' : '🎙️ Audio' }}</span>
          </div>
          <div style="font-size:18px;font-weight:500;margin-bottom:4px">{{ activeRoom()!.title }}</div>
          <div style="font-size:13px;color:#c7d2fe">{{ activeRoom()!.listenersCount }} listening</div>
        </div>
        @if (isHost()) {
          <button (click)="endRoom()"
                  style="padding:6px 14px;background:rgba(239,68,68,.3);color:#fca5a5;
                         border:0.5px solid rgba(239,68,68,.4);border-radius:8px;
                         font-size:12px;cursor:pointer">
            End Room
          </button>
        } @else {
          <button (click)="leaveRoom()"
                  style="padding:6px 14px;background:rgba(255,255,255,.1);color:#e0e7ff;
                         border:0.5px solid rgba(255,255,255,.2);border-radius:8px;
                         font-size:12px;cursor:pointer">
            Leave
          </button>
        }
      </div>

      <!-- Speakers row -->
      <div style="display:flex;gap:16px;margin-bottom:16px">
        @for (speaker of speakers; track speaker.name) {
          <div style="text-align:center">
            <div style="width:56px;height:56px;border-radius:50%;background:#4338ca;
                        display:flex;align-items:center;justify-content:center;
                        font-size:20px;font-weight:500;margin:0 auto 6px;position:relative;
                        border:2px solid"
                 [style.borderColor]="speaker.speaking ? '#818cf8' : 'transparent'">
              {{ speaker.name.charAt(0).toUpperCase() }}
              @if (speaker.speaking) {
                <div style="position:absolute;inset:-4px;border-radius:50%;
                            border:2px solid #818cf8;animation:ping 1s infinite"></div>
              }
              @if (speaker.muted) {
                <div style="position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;
                            background:#ef4444;border-radius:50%;display:flex;
                            align-items:center;justify-content:center;font-size:10px">🔇</div>
              }
            </div>
            <div style="font-size:11px;color:#c7d2fe">{{ speaker.name }}</div>
            @if (speaker.isHost) {
              <div style="font-size:9px;color:#818cf8;margin-top:1px">Host</div>
            }
          </div>
        }
      </div>

      <!-- Room controls -->
      <div style="display:flex;justify-content:center;gap:16px">
        <button (click)="muted=!muted"
                style="width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;
                       font-size:18px;transition:all .15s"
                [style.background]="muted ? '#ef4444' : 'rgba(255,255,255,.15)'">
          {{ muted ? '🔇' : '🎙️' }}
        </button>
        <button style="width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;
                       font-size:18px;background:rgba(255,255,255,.15)">
          🙋
        </button>
        <button style="width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;
                       font-size:18px;background:rgba(255,255,255,.15)">
          👥
        </button>
        <button style="width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;
                       font-size:18px;background:rgba(255,255,255,.15)">
          💬
        </button>
      </div>
    </div>
  }

  <!-- Create form -->
  @if (createMode) {
    <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                border-radius:16px;padding:20px;margin-bottom:20px">
      <h3 style="font-size:15px;font-weight:500;margin-bottom:14px;color:var(--text-primary,#111)">Start a Room</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        <input [(ngModel)]="form.title" placeholder="Room topic (e.g. 'Web Dev Q&A')" [style]="iS">
        <textarea [(ngModel)]="form.description" placeholder="Description (optional)" rows="2"
                  [style]="iS+'resize:none'"></textarea>
        <div style="display:flex;gap:10px">
          <button (click)="form.type='AUDIO'"
                  style="flex:1;padding:10px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:500"
                  [style.background]="form.type==='AUDIO' ? '#6366f1' : 'var(--bg-secondary,#f9fafb)'"
                  [style.color]="form.type==='AUDIO' ? '#fff' : 'var(--text-primary,#111)'"
                  [style.border]="form.type==='AUDIO' ? 'none' : '0.5px solid var(--border,#e5e7eb)'">
            🎙️ Audio Room
          </button>
          <button (click)="form.type='VIDEO'"
                  style="flex:1;padding:10px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:500"
                  [style.background]="form.type==='VIDEO' ? '#6366f1' : 'var(--bg-secondary,#f9fafb)'"
                  [style.color]="form.type==='VIDEO' ? '#fff' : 'var(--text-primary,#111)'"
                  [style.border]="form.type==='VIDEO' ? 'none' : '0.5px solid var(--border,#e5e7eb)'">
            📹 Video Room
          </button>
        </div>
        <div style="display:flex;gap:10px">
          <button (click)="createMode=false"
                  style="flex:1;padding:10px;border:0.5px solid var(--border,#e5e7eb);background:none;
                         border-radius:9px;font-size:13px;cursor:pointer;color:var(--text-secondary,#6b7280)">
            Cancel
          </button>
          <button (click)="startRoom()"
                  style="flex:2;padding:10px;background:#ef4444;color:#fff;border:none;
                         border-radius:9px;font-size:13px;font-weight:500;cursor:pointer">
            🔴 Start Now
          </button>
        </div>
      </div>
    </div>
  }

  <!-- Live rooms list -->
  @if (!rooms().length && !loading()) {
    <div style="text-align:center;padding:60px 20px">
      <div style="font-size:56px;margin-bottom:14px">🎙️</div>
      <div style="font-size:16px;font-weight:500;color:var(--text-primary,#111);margin-bottom:6px">No live rooms right now</div>
      <p style="font-size:14px;color:var(--text-secondary,#6b7280)">Be the first to start one!</p>
    </div>
  } @else {
    <div style="display:flex;flex-direction:column;gap:10px">
      @for (room of rooms(); track room.id) {
        <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                    border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px">
          <!-- Host avatar -->
          <div style="width:48px;height:48px;border-radius:50%;background:#6366f1;flex-shrink:0;
                      display:flex;align-items:center;justify-content:center;
                      color:#fff;font-size:17px;font-weight:500;overflow:hidden">
            @if (room.hostAvatar) { <img [src]="room.hostAvatar" style="width:100%;height:100%;object-fit:cover"> }
            @else { {{ room.hostUsername.charAt(0).toUpperCase() }} }
          </div>

          <!-- Info -->
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <div style="width:7px;height:7px;border-radius:50%;background:#ef4444;animation:pulse 1.2s infinite"></div>
              <span style="font-size:10px;font-weight:600;color:#ef4444;letter-spacing:.5px">LIVE</span>
              <span style="font-size:10px;color:var(--text-muted,#9ca3af)">{{ room.type === 'VIDEO' ? '📹 Video' : '🎙️ Audio' }}</span>
            </div>
            <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:2px;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ room.title }}
            </div>
            <div style="font-size:12px;color:var(--text-secondary,#6b7280)">
              by &#64;{{ room.hostUsername }} · 👥 {{ room.listenersCount }} listening
            </div>
          </div>

          <!-- Join button -->
          <button (click)="joinRoom(room)"
                  style="flex-shrink:0;padding:8px 18px;background:#6366f1;color:#fff;border:none;
                         border-radius:9px;font-size:13px;font-weight:500;cursor:pointer">
            Join
          </button>
        </div>
      }
    </div>
  }
</div>

<style>
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes ping  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.3);opacity:0} }
</style>
  `
})
export class RoomsComponent implements OnInit {
  rooms      = signal<any[]>([]);
  activeRoom = signal<any | null>(null);
  loading    = signal(true);
  createMode = false;
  muted      = false;
  isHostFlag = false;
  form = { title:'', description:'', type:'AUDIO' };
  iS = 'width:100%;padding:9px 14px;border:0.5px solid var(--border,#e5e7eb);border-radius:9px;font-size:13px;background:var(--bg-secondary,#f9fafb);color:var(--text-primary,#111);outline:none;box-sizing:border-box;';

  speakers = [
    { name: 'You', isHost: true, speaking: true, muted: false },
    { name: 'Alice', isHost: false, speaking: false, muted: false },
    { name: 'Bob',   isHost: false, speaking: false, muted: true },
  ];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/rooms`).subscribe({
      next: r => { this.rooms.set(r.content || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  isHost() { return this.activeRoom()?.hostUsername === this.auth.currentUser()?.username; }

  startRoom() {
    if (!this.form.title) return;
    this.http.post<any>(`${environment.apiUrl}/rooms`, this.form).subscribe({
      next: r => {
        this.activeRoom.set(r);
        this.isHostFlag = true;
        this.rooms.update(l => [r, ...l]);
        this.createMode = false;
      }
    });
  }

  joinRoom(room: any) {
    this.http.post<any>(`${environment.apiUrl}/rooms/${room.roomKey}/join`, {}).subscribe({
      next: r => this.activeRoom.set(r)
    });
  }

  leaveRoom() { this.activeRoom.set(null); }

  endRoom() {
    const r = this.activeRoom();
    if (!r) return;
    this.http.post(`${environment.apiUrl}/rooms/${r.roomKey}/end`, {}).subscribe(() => {
      this.activeRoom.set(null);
      this.rooms.update(l => l.filter(x => x.id !== r.id));
    });
  }
}
