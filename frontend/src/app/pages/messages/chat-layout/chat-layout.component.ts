import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule }      from '@angular/forms';
import { HttpClient }       from '@angular/common/http';
import { AuthService }      from '../../../services/auth.service';
import { WebSocketService } from '../../../services/websocket.service';
import { environment }      from '../../../../environments/environment';
import { Subscription }     from 'rxjs';

interface Conversation {
  id: number; type: string; name: string; avatarUrl: string;
  lastMessage: string; lastTime: string; unreadCount: number;
}

interface ChatMessage {
  id?: number; sender: string; senderAvatar?: string;
  content: string; timestamp: string; isOwn: boolean;
  reactions?: {emoji: string; count: number}[];
}

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="chat-app">

  <!-- ── Left icon rail ─────────────────────── -->
  <div class="sidebar-icons">
    <div class="logo-btn">S</div>
    <button class="nav-btn active" title="Messages">💬</button>
    <button class="nav-btn" routerLink="/feed" title="Feed">🏠</button>
    <button class="nav-btn" title="Video calls">📹</button>
    <button class="nav-btn" title="People" routerLink="/explore">👥</button>
    <button class="nav-btn" title="Notifications" routerLink="/notifications">
      🔔
      @if (unreadNotifs > 0) { <span class="nav-badge">{{ unreadNotifs }}</span> }
    </button>
    <div style="flex:1"></div>
    <button class="nav-btn" routerLink="/settings" title="Settings">⚙️</button>
    <div class="av" style="background:#818cf8;color:#fff;cursor:pointer;margin-bottom:4px"
         [routerLink]="['/profile', auth.currentUser()?.username]">
      {{ auth.currentUser()?.username?.charAt(0)?.toUpperCase() }}
    </div>
  </div>

  <!-- ── Conversation list ───────────────────── -->
  <div class="conv-list">
    <div class="conv-head">
      <h2>Messages</h2>
      <p>{{ onlineCount }} online now</p>
    </div>

    <div class="search-wrap" style="position:relative">
      <span style="position:absolute;left:18px;top:16px;font-size:12px;color:var(--color-text-secondary)">🔍</span>
      <input placeholder="Search conversations..." [(ngModel)]="searchQuery" (ngModelChange)="filterConvs()">
    </div>

    <div class="conv-scroll">
      <div class="section-lbl">Conversations</div>

      @for (conv of filteredConvs; track conv.id) {
        <div class="conv-item" [class.active]="activeConvId === conv.id" (click)="openConv(conv)">
          <div class="av online" [style.background]="getAvatarBg(conv.name)" [style.color]="getAvatarColor(conv.name)">
            {{ getInitials(conv.name) }}
          </div>
          <div class="conv-info">
            <div class="conv-name">{{ conv.name }}</div>
            <div class="conv-last">{{ conv.lastMessage || 'Start a conversation' }}</div>
          </div>
          @if (conv.unreadCount > 0) {
            <span class="unread">{{ conv.unreadCount }}</span>
          }
        </div>
      }

      @if (!filteredConvs.length) {
        <div style="padding:16px;text-align:center;font-size:12px;color:var(--color-text-secondary)">
          No conversations yet.<br>
          <a routerLink="/explore" style="color:#6366f1">Find people to message →</a>
        </div>
      }
    </div>

    <!-- New DM button -->
    <div style="padding:10px;border-top:0.5px solid var(--color-border-tertiary)">
      <button (click)="newDM()" style="width:100%;padding:7px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:500">
        + New Message
      </button>
    </div>
  </div>

  <!-- ── Main chat area ─────────────────────── -->
  <div class="chat-main">
    @if (activeConv) {

      <!-- Header -->
      <div class="chat-header">
        <div class="av" [style.background]="getAvatarBg(activeConv.name)" [style.color]="getAvatarColor(activeConv.name)" style="border-radius:8px">
          {{ getInitials(activeConv.name) }}
        </div>
        <div>
          <h3>{{ activeConv.name }}</h3>
          <p>{{ activeConv.type === 'GROUP' ? 'Group chat' : 'Direct message' }}</p>
        </div>
        <div class="header-actions">
          <button class="h-btn" title="Audio call" (click)="startCall(false)">📞</button>
          <button class="h-btn" title="Video call" (click)="startCall(true)">📹</button>
          <button class="h-btn" title="Search in chat">🔍</button>
          <button class="h-btn" title="More options">⋯</button>
        </div>
      </div>

      <!-- Messages -->
      <div class="messages-area" #scrollEl>
        @for (msg of messages(); track $index) {
          <div class="msg-group" [class.own]="msg.isOwn">
            <div class="msg-av" [style.background]="msg.isOwn ? '#818cf8' : getAvatarBg(msg.sender)"
                 [style.color]="msg.isOwn ? '#fff' : getAvatarColor(msg.sender)">
              {{ getInitials(msg.sender) }}
            </div>
            <div class="msg-body">
              <div class="msg-meta">
                <span class="msg-user">{{ msg.isOwn ? 'You' : msg.sender }}</span>
                <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
              </div>
              <div class="bubble">{{ msg.content }}</div>
              @if (msg.reactions?.length) {
                <div class="reactions">
                  @for (r of msg.reactions; track r.emoji) {
                    <span class="r-tag">{{ r.emoji }} {{ r.count }}</span>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (isTyping()) {
          <div class="typing-indicator">
            <div class="av" style="width:24px;height:24px;background:#e0e7ff;color:#4338ca;font-size:10px">
              {{ getInitials(activeConv.name) }}
            </div>
            <div class="dots">
              <span></span><span></span><span></span>
            </div>
            <span>{{ activeConv.name }} is typing...</span>
          </div>
        }
      </div>

      <!-- Composer -->
      <div class="composer">
        <div class="composer-box">
          <div class="composer-tools">
            <button class="tool-btn" title="Bold">B</button>
            <button class="tool-btn" title="Italic">I</button>
            <button class="tool-btn" title="Strikethrough">~</button>
            <div class="divider"></div>
            <button class="tool-btn" title="Link">🔗</button>
            <button class="tool-btn" title="Emoji">😊</button>
            <button class="tool-btn" title="Attach file">📎</button>
            <button class="tool-btn" title="Image" (click)="fileInput.click()">🖼️</button>
            <input #fileInput type="file" accept="image/*" class="hidden" style="display:none">
          </div>
          <div class="input-row">
            <input [(ngModel)]="newMessage"
                   (keydown.enter)="sendMsg()"
                   (input)="onTyping()"
                   [placeholder]="'Message ' + activeConv.name"
                   style="flex:1;border:none;background:none;font-size:13px;color:var(--color-text-primary);outline:none">
            <button class="send-btn" [disabled]="!newMessage.trim()" (click)="sendMsg()">➤</button>
          </div>
        </div>
      </div>

    } @else {
      <div class="empty-state">
        <div class="icon">💬</div>
        <p>Select a conversation to start messaging</p>
        <a routerLink="/explore" style="color:#6366f1;font-size:13px">Find people →</a>
      </div>
    }
  </div>
</div>
  `
})
export class ChatLayoutComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollEl') scrollEl!: ElementRef;

  conversations = signal<Conversation[]>([]);
  messages      = signal<ChatMessage[]>([]);
  isTyping      = signal(false);
  activeConv:   Conversation | null = null;
  activeConvId: number | null = null;
  newMessage    = '';
  searchQuery   = '';
  filteredConvs: Conversation[] = [];
  onlineCount   = 0;
  unreadNotifs  = 3;
  private subs: Subscription[] = [];
  private typingTimer: any;

  constructor(
    public auth: AuthService,
    private ws:  WebSocketService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadConversations();
    this.ws.connect();

    this.subs.push(
      this.ws.message$.subscribe((msg: any) => {
        if (msg.conversationId === this.activeConvId) {
          this.messages.update(m => [...m, {
            sender:    msg.sender,
            content:   msg.content,
            timestamp: msg.timestamp || new Date().toISOString(),
            isOwn:     msg.sender === this.auth.currentUser()?.username
          }]);
        }
        this.updateConvLastMessage(msg);
      }),
      this.ws.typing$.subscribe((e: any) => {
        if (e.username !== this.auth.currentUser()?.username) {
          this.isTyping.set(e.typing);
        }
      })
    );

    // Открыть чат если передан ID в URL
    this.route.params.subscribe(params => {
      if (params['id']) this.activeConvId = +params['id'];
    });
  }

  ngAfterViewChecked() {
    try {
      const el = this.scrollEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  loadConversations() {
    this.http.get<Conversation[]>(`${environment.apiUrl}/conversations`).subscribe({
      next: convs => {
        this.conversations.set(convs);
        this.filteredConvs = convs;
        this.onlineCount = Math.floor(convs.length * 0.6);
      },
      error: () => { this.filteredConvs = []; }
    });
  }

  filterConvs() {
    const q = this.searchQuery.toLowerCase();
    this.filteredConvs = this.conversations().filter(c =>
      c.name.toLowerCase().includes(q)
    );
  }

  openConv(conv: Conversation) {
    this.activeConv   = conv;
    this.activeConvId = conv.id;
    this.messages.set([]);

    this.http.get<any>(`${environment.apiUrl}/conversations/${conv.id}/messages`).subscribe({
      next: res => {
        this.messages.set((res.content || []).reverse().map((m: any) => ({
          sender:    m.sender,
          content:   m.content,
          timestamp: m.createdAt,
          isOwn:     m.sender === this.auth.currentUser()?.username
        })));
      }
    });
  }

  sendMsg() {
    if (!this.newMessage.trim() || !this.activeConvId) return;

    const msg: ChatMessage = {
      sender:    this.auth.currentUser()?.username || '',
      content:   this.newMessage.trim(),
      timestamp: new Date().toISOString(),
      isOwn:     true
    };

    this.ws.send('/app/chat.send', {
      conversationId: this.activeConvId,
      content: msg.content,
      type: 'TEXT'
    });

    this.messages.update(m => [...m, msg]);
    this.newMessage = '';
  }

  onTyping() {
    if (!this.activeConvId) return;
    this.ws.sendTyping(this.activeConvId, true);
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => this.ws.sendTyping(this.activeConvId!, false), 2000);
  }

  newDM() { alert('Search for a user to start a conversation'); }

  startCall(video: boolean) {
    if (!this.activeConv) return;
    alert(`Starting ${video ? 'video' : 'audio'} call with ${this.activeConv.name}`);
  }

  private updateConvLastMessage(msg: any) {
    this.conversations.update(convs => convs.map(c =>
      c.id === msg.conversationId
        ? { ...c, lastMessage: msg.content, unreadCount: c.id === this.activeConvId ? 0 : c.unreadCount + 1 }
        : c
    ));
    this.filteredConvs = this.conversations();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  getAvatarBg(name: string): string {
    const colors = ['#e0e7ff','#dcfce7','#fce7f3','#fef3c7','#fee2e2','#f0fdf4'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }

  getAvatarColor(name: string): string {
    const colors = ['#4338ca','#16a34a','#be185d','#b45309','#dc2626','#15803d'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    clearTimeout(this.typingTimer);
  }
}
