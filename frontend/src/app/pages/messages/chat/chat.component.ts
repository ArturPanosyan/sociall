import { Component, OnInit, OnDestroy,
         ViewChild, ElementRef,
         AfterViewChecked, signal }    from '@angular/core';
import { CommonModule }                from '@angular/common';
import { FormsModule }                 from '@angular/forms';
import { ActivatedRoute }              from '@angular/router';
import { WebSocketService }            from '../../../services/websocket.service';
import { AuthService }                 from '../../../services/auth.service';
import { Subscription }                from 'rxjs';

interface ChatMessage {
  conversationId: number;
  sender:         string;
  content:        string;
  type:           string;
  timestamp:      string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="flex flex-col h-screen bg-gray-50">

  <!-- Header -->
  <div class="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
    <button onclick="history.back()" class="text-gray-400 hover:text-gray-600 text-xl">←</button>
    <div class="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
    <div>
      <p class="font-semibold text-gray-900 text-sm">Chat</p>
      <p class="text-xs" [class.text-green-500]="ws.connected" [class.text-gray-400]="!ws.connected">
        {{ ws.connected ? '● Online' : '● Connecting...' }}
      </p>
    </div>
  </div>

  <!-- Messages -->
  <div #scrollContainer class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
    @for (msg of messages(); track $index) {
      <div class="flex" [class.justify-end]="msg.sender === auth.currentUser()?.username">
        <div class="max-w-xs lg:max-w-md">
          @if (msg.sender !== auth.currentUser()?.username) {
            <p class="text-xs text-gray-400 mb-1 ml-2">{{ msg.sender }}</p>
          }
          <div class="px-4 py-2.5 rounded-2xl text-sm"
               [class.bg-indigo-600]="msg.sender === auth.currentUser()?.username"
               [class.text-white]="msg.sender === auth.currentUser()?.username"
               [class.bg-white]="msg.sender !== auth.currentUser()?.username"
               [class.text-gray-800]="msg.sender !== auth.currentUser()?.username"
               [class.shadow-sm]="msg.sender !== auth.currentUser()?.username">
            {{ msg.content }}
          </div>
          <p class="text-xs text-gray-300 mt-1"
             [class.text-right]="msg.sender === auth.currentUser()?.username">
            {{ msg.timestamp | date:'HH:mm' }}
          </p>
        </div>
      </div>
    }

    @if (isTyping()) {
      <div class="flex items-center gap-2">
        <div class="bg-white rounded-2xl px-4 py-3 shadow-sm flex gap-1">
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
        </div>
      </div>
    }
  </div>

  <!-- Input -->
  <div class="bg-white border-t border-gray-100 px-4 py-3">
    <div class="flex gap-3 items-end">
      <div class="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-end gap-2">
        <textarea [(ngModel)]="messageText"
                  (keydown.enter)="sendMessage($event)"
                  (input)="onTyping()"
                  placeholder="Write a message..."
                  rows="1"
                  class="flex-1 bg-transparent outline-none resize-none text-sm text-gray-800
                         placeholder-gray-400 max-h-32"></textarea>
      </div>
      <button (click)="sendMessage()"
              [disabled]="!messageText.trim()"
              class="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40
                     rounded-full flex items-center justify-center transition flex-shrink-0">
        <span class="text-white text-lg">➤</span>
      </button>
    </div>
  </div>
</div>
  `
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollEl!: ElementRef;

  messages       = signal<ChatMessage[]>([]);
  isTyping       = signal(false);
  messageText    = '';
  conversationId = 0;
  private subs: Subscription[] = [];
  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public  ws:    WebSocketService,
    public  auth:  AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.conversationId = +this.route.snapshot.params['id'];
    this.ws.connect();

    this.subs.push(
      this.ws.message$.subscribe((msg: ChatMessage) => {
        if (msg.conversationId === this.conversationId) {
          this.messages.update(m => [...m, msg]);
        }
      }),
      this.ws.typing$.subscribe((e: { username: string; typing: boolean }) => {
        if (e.username !== this.auth.currentUser()?.username) {
          this.isTyping.set(e.typing);
        }
      })
    );
  }

  ngAfterViewChecked() { this.scrollToBottom(); }

  sendMessage(event?: Event) {
    if (event) {
      const ke = event as KeyboardEvent;
      if (ke.shiftKey) return;
      ke.preventDefault();
    }
    if (!this.messageText.trim()) return;

    const msg: ChatMessage = {
      conversationId: this.conversationId,
      sender:    this.auth.currentUser()?.username || '',
      content:   this.messageText.trim(),
      type:      'TEXT',
      timestamp: new Date().toISOString()
    };

    this.ws.send('/app/chat.send', msg);
    this.messages.update(m => [...m, msg]);
    this.messageText = '';
  }

  onTyping() {
    this.ws.sendTyping(this.conversationId, true);
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.ws.sendTyping(this.conversationId, false);
    }, 2000);
  }

  private scrollToBottom() {
    try { this.scrollEl.nativeElement.scrollTop = this.scrollEl.nativeElement.scrollHeight; }
    catch {}
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.ws.disconnect();
  }
}
