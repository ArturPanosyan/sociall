import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { HttpClient }   from '@angular/common/http';
import { environment }  from '../../../environments/environment';

@Component({
  selector: 'app-gift-modal', standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (open()) {
  <div style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;
              display:flex;align-items:center;justify-content:center;padding:16px"
       (click)="close()">
    <div style="background:var(--bg-primary,#fff);border-radius:20px;padding:24px;
                width:100%;max-width:380px;box-shadow:0 16px 48px rgba(0,0,0,.15)"
         (click)="$event.stopPropagation()">

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="font-size:17px;font-weight:500;color:var(--text-primary,#111)">Send a Gift 🎁</h3>
        <button (click)="close()" style="font-size:20px;background:none;border:none;cursor:pointer;color:var(--text-secondary,#6b7280)">×</button>
      </div>

      <p style="font-size:13px;color:var(--text-secondary,#6b7280);margin-bottom:16px">
        Send to <strong style="color:var(--text-primary,#111)">&#64;{{ toUsername }}</strong>
      </p>

      <!-- Gift options -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
        @for (g of gifts; track g.emoji) {
          <button (click)="selected = g"
                  style="padding:12px 8px;border-radius:12px;cursor:pointer;text-align:center;transition:all .15s"
                  [style.background]="selected?.emoji===g.emoji ? '#e0e7ff' : 'var(--bg-secondary,#f9fafb)'"
                  [style.border]="selected?.emoji===g.emoji ? '1.5px solid #6366f1' : '0.5px solid var(--border,#e5e7eb)'">
            <div style="font-size:26px;margin-bottom:4px">{{ g.emoji }}</div>
            <div style="font-size:11px;font-weight:500;color:var(--text-primary,#111)">{{ g.label }}</div>
            <div style="font-size:10px;color:#6366f1;margin-top:2px">{{ g.coins }} 🪙</div>
          </button>
        }
      </div>

      <!-- Message -->
      <input [(ngModel)]="message" placeholder="Add a message (optional)..."
             style="width:100%;padding:9px 14px;border:0.5px solid var(--border,#e5e7eb);
                    border-radius:10px;font-size:13px;outline:none;margin-bottom:12px;
                    background:var(--bg-secondary,#f9fafb);color:var(--text-primary,#111);box-sizing:border-box">

      @if (sent()) {
        <div style="background:#dcfce7;color:#15803d;padding:12px;border-radius:10px;
                    text-align:center;font-size:13px;font-weight:500;margin-bottom:12px">
          {{ selected?.emoji }} Gift sent! Thank you 🎉
        </div>
      }

      <button (click)="send()" [disabled]="!selected || sending()"
              style="width:100%;padding:12px;background:#6366f1;color:#fff;border:none;
                     border-radius:12px;font-size:14px;font-weight:500;cursor:pointer">
        {{ sending() ? 'Sending...' : 'Send Gift ' + (selected?.emoji || '') }}
      </button>
    </div>
  </div>
}
  `
})
export class GiftModalComponent {
  @Input()  toUsername!: string;
  @Output() closed = new EventEmitter<void>();
  open    = signal(true);
  sending = signal(false);
  sent    = signal(false);
  selected: any = null;
  message = '';

  gifts = [
    { emoji:'🌹', label:'Rose',      coins:10  },
    { emoji:'🍕', label:'Pizza',     coins:25  },
    { emoji:'☕', label:'Coffee',    coins:50  },
    { emoji:'🎮', label:'Gaming',    coins:75  },
    { emoji:'💎', label:'Diamond',   coins:200 },
    { emoji:'🚀', label:'Rocket',    coins:500 },
  ];

  constructor(private http: HttpClient) {}

  send() {
    if (!this.selected) return;
    this.sending.set(true);
    this.http.post(`${environment.apiUrl}/gifts/send`, {
      toUsername: this.toUsername,
      emoji: this.selected.emoji,
      label: this.selected.label,
      coins: this.selected.coins,
      message: this.message
    }).subscribe({
      next: () => { this.sent.set(true); this.sending.set(false); setTimeout(() => this.close(), 2000); },
      error: () => { this.sent.set(true); this.sending.set(false); setTimeout(() => this.close(), 2000); }
    });
  }

  close() { this.open.set(false); this.closed.emit(); }
}
