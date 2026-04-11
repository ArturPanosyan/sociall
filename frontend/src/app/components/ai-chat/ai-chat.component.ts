import { Component, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClient }        from '@angular/common/http';
import { environment }       from '../../../environments/environment';

interface Msg { role: 'user' | 'bot'; text: string; }

@Component({
  selector: 'app-ai-chat', standalone: true, imports: [CommonModule, FormsModule],
  template: `
@if (open()) {
  <div style="position:fixed;bottom:84px;right:20px;width:320px;z-index:100;
              background:var(--bg-primary);border:0.5px solid var(--border);
              border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.12)">

    <div style="padding:12px 14px;background:#6366f1;display:flex;align-items:center;gap:8px">
      <span style="font-size:18px">🤖</span>
      <span style="color:#fff;font-weight:500;font-size:14px">AI Assistant</span>
      <button (click)="open.set(false)"
              style="margin-left:auto;color:#fff;background:none;border:none;cursor:pointer;font-size:18px;line-height:1">×</button>
    </div>

    <div style="height:260px;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px" #msgs>
      @if (!messages().length) {
        <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px">
          <div style="font-size:32px;margin-bottom:8px">👋</div>
          Ask me anything about SocialNet!
        </div>
      }
      @for (m of messages(); track $index) {
        <div style="display:flex;justify-content:{{m.role==='user'?'flex-end':'flex-start'}}">
          <div style="max-width:85%;padding:8px 12px;border-radius:{{m.role==='user'?'10px 2px 10px 10px':'2px 10px 10px 10px'}};
                      font-size:13px;line-height:1.5;
                      background:{{m.role==='user'?'#6366f1':'var(--bg-secondary)'}};
                      color:{{m.role==='user'?'#fff':'var(--text-primary)'}}">
            {{ m.text }}
          </div>
        </div>
      }
      @if (thinking()) {
        <div style="display:flex;gap:4px;padding:8px 12px;background:var(--bg-secondary);
                    border-radius:2px 10px 10px 10px;width:fit-content">
          <span style="width:6px;height:6px;border-radius:50%;background:#6366f1;
                       display:inline-block;animation:bounce .8s infinite"></span>
          <span style="width:6px;height:6px;border-radius:50%;background:#6366f1;
                       display:inline-block;animation:bounce .8s .15s infinite"></span>
          <span style="width:6px;height:6px;border-radius:50%;background:#6366f1;
                       display:inline-block;animation:bounce .8s .3s infinite"></span>
        </div>
      }
    </div>

    <div style="padding:10px;border-top:0.5px solid var(--border);display:flex;gap:8px">
      <input [(ngModel)]="text" (keydown.enter)="send()"
             placeholder="Ask something..."
             style="flex:1;padding:7px 12px;border:0.5px solid var(--border);border-radius:8px;
                    font-size:13px;background:var(--bg-secondary);color:var(--text-primary);outline:none">
      <button (click)="send()" [disabled]="!text.trim() || thinking()"
              style="width:34px;height:34px;background:#6366f1;border:none;border-radius:8px;
                     cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center">
        ➤
      </button>
    </div>

    <!-- Quick prompts -->
    <div style="padding:0 10px 10px;display:flex;flex-wrap:wrap;gap:4px">
      @for (q of quickPrompts; track q) {
        <button (click)="text=q; send()"
                style="font-size:11px;padding:3px 8px;border:0.5px solid var(--border);
                       border-radius:10px;background:none;cursor:pointer;color:var(--text-secondary)">
          {{ q }}
        </button>
      }
    </div>
  </div>
}

<!-- FAB button -->
<button (click)="open.set(!open())"
        style="position:fixed;bottom:24px;right:20px;width:52px;height:52px;
               background:#6366f1;border:none;border-radius:50%;cursor:pointer;
               color:#fff;font-size:22px;z-index:100;
               box-shadow:0 4px 16px rgba(99,102,241,.4);transition:transform .15s"
        [style.transform]="open() ? 'scale(0.9)' : 'scale(1)'">
  {{ open() ? '×' : '🤖' }}
</button>
  `
})
export class AiChatComponent {
  open     = signal(false);
  messages = signal<Msg[]>([]);
  thinking = signal(false);
  text     = '';

  quickPrompts = ['Write a post idea', 'How to get more followers?', 'What should I post today?'];

  constructor(private http: HttpClient) {}

  send() {
    if (!this.text.trim() || this.thinking()) return;
    const msg = this.text.trim();
    this.text = '';
    this.messages.update(m => [...m, { role: 'user', text: msg }]);
    this.thinking.set(true);

    this.http.post<{ reply: string }>(`${environment.apiUrl}/ai/chat`, { message: msg }).subscribe({
      next: r => {
        this.messages.update(m => [...m, { role: 'bot', text: r.reply }]);
        this.thinking.set(false);
      },
      error: () => {
        this.messages.update(m => [...m, { role: 'bot', text: 'Sorry, AI is unavailable. Set OPENAI_API_KEY to enable it.' }]);
        this.thinking.set(false);
      }
    });
  }
}
