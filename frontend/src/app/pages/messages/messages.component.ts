import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { RouterLink }                from '@angular/router';
import { HttpClient }                from '@angular/common/http';
import { environment }               from '../../../environments/environment';

interface Conversation {
  id:           number;
  type:         string;
  name:         string;
  avatarUrl:    string;
  lastMessage:  string;
  lastTime:     string;
  unreadCount:  number;
  members:      any[];
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="max-w-2xl mx-auto px-4 py-6">

  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Messages</h1>
    <button (click)="newChat()"
            class="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl
                   flex items-center justify-center text-xl transition">✏️</button>
  </div>

  <!-- Search -->
  <div class="relative mb-4">
    <span class="absolute left-4 top-3 text-gray-400">🔍</span>
    <input type="text" placeholder="Search messages..."
           class="w-full pl-11 pr-4 py-2.5 bg-gray-100 rounded-xl outline-none
                  focus:ring-2 focus:ring-indigo-400 transition text-sm">
  </div>

  <!-- Conversations -->
  @if (loading()) {
    <div class="space-y-3">
      @for (i of [1,2,3,4,5]; track i) {
        <div class="flex gap-3 p-3 animate-pulse">
          <div class="w-14 h-14 bg-gray-200 rounded-2xl flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        </div>
      }
    </div>
  } @else if (conversations().length) {
    <div class="space-y-1">
      @for (conv of conversations(); track conv.id) {
        <a [routerLink]="['/messages', conv.id]"
           class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white
                  hover:shadow-sm transition cursor-pointer">

          <!-- Avatar -->
          <div class="relative flex-shrink-0">
            <img [src]="conv.avatarUrl || '/assets/default-avatar.png'"
                 class="w-14 h-14 rounded-2xl object-cover">
            <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500
                        border-2 border-white rounded-full"></div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="font-semibold text-gray-900 truncate">{{ conv.name }}</p>
              <span class="text-xs text-gray-400 flex-shrink-0 ml-2">
                {{ timeAgo(conv.lastTime) }}
              </span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <p class="text-sm text-gray-500 truncate">{{ conv.lastMessage || 'Start a conversation' }}</p>
              @if (conv.unreadCount > 0) {
                <span class="ml-2 bg-indigo-600 text-white text-xs font-bold
                             w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}
                </span>
              }
            </div>
          </div>
        </a>
      }
    </div>
  } @else {
    <div class="text-center py-20 text-gray-400">
      <p class="text-5xl mb-4">💬</p>
      <p class="font-medium text-lg">No messages yet</p>
      <p class="text-sm mt-1">Start a conversation with someone</p>
      <button (click)="newChat()"
              class="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-xl
                     text-sm font-medium hover:bg-indigo-700 transition">
        New Message
      </button>
    </div>
  }
</div>
  `
})
export class MessagesComponent implements OnInit {
  conversations = signal<Conversation[]>([]);
  loading       = signal(true);
  private api   = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(this.api).subscribe({
      next: list => { this.conversations.set(list); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  newChat() {
    // TODO: open user search dialog to start new conversation
    alert('Select a user to start a conversation');
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const min  = Math.floor(diff / 60000);
    if (min < 1)   return 'now';
    if (min < 60)  return `${min}m`;
    if (min < 1440) return `${Math.floor(min / 60)}h`;
    return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }
}
