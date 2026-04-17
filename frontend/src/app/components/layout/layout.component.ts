import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService }  from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { AiChatComponent } from '../ai-chat/ai-chat.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AiChatComponent],
  template: `
<div style="min-height:100vh;background:var(--bg-secondary)">

  <!-- Top Nav -->
  <nav style="background:var(--bg-primary);border-bottom:0.5px solid var(--border);
              position:sticky;top:0;z-index:50;height:56px">
    <div class="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">

      <!-- Logo -->
      <a routerLink="/feed" class="flex items-center gap-2">
        <div style="width:32px;height:32px;background:#6366f1;border-radius:8px;
                    display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px">🌐</div>
        <span style="font-weight:500;font-size:16px;color:var(--text-primary)" class="hidden sm:block">SocialNet</span>
      </a>

      <!-- Desktop Nav links -->
      <div class="hidden md:flex items-center gap-1">
        @for (link of navLinks; track link.path) {
          <a [routerLink]="link.path" routerLinkActive="active-nav"
             style="display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;
                    font-size:13px;font-weight:500;color:var(--text-secondary);
                    text-decoration:none;transition:all .15s"
             class="hover:bg-theme-hover">
            <span style="font-size:15px">{{ link.icon }}</span>
            {{ link.label }}
          </a>
        }
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-2">
        <!-- Dark mode toggle -->
        <button (click)="theme.toggle()"
                style="width:36px;height:36px;border-radius:8px;border:0.5px solid var(--border);
                       background:none;cursor:pointer;font-size:16px;
                       display:flex;align-items:center;justify-content:center;color:var(--text-secondary)">
          {{ theme.isDark() ? '☀️' : '🌙' }}
        </button>

        <!-- Notifications -->
        <a routerLink="/notifications"
           style="width:36px;height:36px;border-radius:8px;border:0.5px solid var(--border);
                  display:flex;align-items:center;justify-content:center;font-size:16px;
                  text-decoration:none;position:relative">
          🔔
        </a>

        <!-- Profile + Analytics dropdown -->
        <div style="position:relative" (click)="dropOpen = !dropOpen">
          <div style="width:36px;height:36px;border-radius:50%;background:#6366f1;
                      display:flex;align-items:center;justify-content:center;
                      color:#fff;font-weight:500;font-size:14px;cursor:pointer">
            {{ auth.currentUser()?.username?.charAt(0)?.toUpperCase() }}
          </div>

          @if (dropOpen) {
            <div style="position:absolute;right:0;top:44px;background:var(--bg-primary);
                        border:0.5px solid var(--border);border-radius:12px;
                        overflow:hidden;min-width:180px;z-index:100">
              <a [routerLink]="['/profile', auth.currentUser()?.username]"
                 (click)="dropOpen=false"
                 style="display:flex;align-items:center;gap:8px;padding:10px 14px;
                        text-decoration:none;font-size:13px;color:var(--text-primary)">
                👤 My Profile
              </a>
              <a routerLink="/analytics" (click)="dropOpen=false"
                 style="display:flex;align-items:center;gap:8px;padding:10px 14px;
                        text-decoration:none;font-size:13px;color:var(--text-primary)">
                📈 Analytics
              </a>
              <a routerLink="/saved" (click)="dropOpen=false"
                 style="display:flex;align-items:center;gap:8px;padding:10px 14px;
                        text-decoration:none;font-size:13px;color:var(--text-primary)">
                🔖 Saved
              </a>
              <a routerLink="/marketplace" (click)="dropOpen=false"
                 style="display:flex;align-items:center;gap:8px;padding:10px 14px;
                        text-decoration:none;font-size:13px;color:var(--text-primary)">
                🛒 Marketplace
              </a>
              <a routerLink="/settings" (click)="dropOpen=false"
                 style="display:flex;align-items:center;gap:8px;padding:10px 14px;
                        text-decoration:none;font-size:13px;color:var(--text-primary)">
                ⚙️ Settings
              </a>
              <a routerLink="/api-test" (click)="dropOpen=false"
                 style="display:flex;align-items:center;gap:8px;padding:10px 14px;
                        text-decoration:none;font-size:13px;color:var(--text-primary)">
                🔧 API Tester
              </a>
              <div style="height:0.5px;background:var(--border)"></div>
              <button (click)="logout()"
                      style="display:flex;align-items:center;gap:8px;padding:10px 14px;
                             width:100%;border:none;background:none;cursor:pointer;
                             font-size:13px;color:#ef4444;text-align:left">
                🚪 Sign out
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  </nav>

  <!-- Content -->
  <main>
    <router-outlet />
  </main>

  <!-- Mobile bottom nav -->
  <div class="md:hidden" style="position:fixed;bottom:0;left:0;right:0;
               background:var(--bg-primary);border-top:0.5px solid var(--border);
               display:flex;z-index:50">
    @for (link of mobileLinks; track link.path) {
      <a [routerLink]="link.path" routerLinkActive="active-mobile"
         style="flex:1;display:flex;flex-direction:column;align-items:center;
                padding:8px 4px 10px;text-decoration:none;
                font-size:10px;color:var(--text-muted)">
        <span style="font-size:20px;margin-bottom:2px">{{ link.icon }}</span>
        {{ link.label }}
      </a>
    }
  </div>

  <!-- AI Chat floating button (везде) -->
  <app-ai-chat />
</div>

<style>
.active-nav { background: var(--accent-light) !important; color: var(--accent-text) !important; }
.active-mobile { color: #6366f1 !important; }
</style>
  `
})
export class LayoutComponent {
  dropOpen = false;

  navLinks = [
    { path: '/feed',        icon: '🏠', label: 'Feed' },
    { path: '/reels',       icon: '🎬', label: 'Reels' },
    { path: '/explore',     icon: '🔍', label: 'Explore' },
    { path: '/communities', icon: '👥', label: 'Groups' },
    { path: '/events',      icon: '📅', label: 'Events' },
    { path: '/messages',    icon: '💬', label: 'Messages' },
  ];
  _navLinks = [
    { path: '/feed',          icon: '🏠', label: 'Feed' },
    { path: '/explore',       icon: '🔍', label: 'Explore' },
    { path: '/messages',      icon: '💬', label: 'Messages' },
  ];

  mobileLinks = [
    { path: '/feed',        icon: '🏠', label: 'Feed' },
    { path: '/reels',       icon: '🎬', label: 'Reels' },
    { path: '/explore',     icon: '🔍', label: 'Explore' },
    { path: '/communities', icon: '👥', label: 'Groups' },
    { path: '/messages',    icon: '💬', label: 'Chat' },
  ];
  _mobileLinks = [
    { path: '/feed',          icon: '🏠', label: 'Feed' },
    { path: '/explore',       icon: '🔍', label: 'Explore' },
    { path: '/messages',      icon: '💬', label: 'Chat' },
    { path: '/notifications', icon: '🔔', label: 'Notifs' },
    { path: '/settings',      icon: '⚙️',  label: 'More' },
  ];

  constructor(public auth: AuthService, public theme: ThemeService) {}

  logout() { this.auth.logout(); location.href = "/login"; }
}
