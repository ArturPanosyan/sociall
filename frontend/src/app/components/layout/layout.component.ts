import { Component, signal }  from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterLink,
         RouterLinkActive }   from '@angular/router';
import { AuthService }        from '../../services/auth.service';
import { FormsModule }        from '@angular/forms';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
<div class="flex min-h-screen bg-gray-50">

  <!-- ── Sidebar Desktop ─────────────────────────────────────── -->
  <aside class="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-20 px-4 py-6">

    <!-- Logo -->
    <a routerLink="/feed" class="flex items-center gap-2 mb-8 px-2">
      <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
        <span class="text-white font-bold">S</span>
      </div>
      <span class="text-xl font-bold text-gray-900">SocialNet</span>
    </a>

    <!-- Nav Links -->
    <nav class="flex-1 space-y-1">
      @for (item of navItems; track item.label) {
        <a [routerLink]="item.path"
           routerLinkActive="bg-indigo-50 text-indigo-600 font-semibold"
           [routerLinkActiveOptions]="{exact: item.path === '/'}"
           class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600
                  hover:bg-gray-50 hover:text-gray-900 transition text-sm">
          <span class="text-xl w-6 text-center">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          @if (item.badge && item.badge > 0) {
            <span class="ml-auto bg-red-500 text-white text-xs font-bold
                         w-5 h-5 rounded-full flex items-center justify-center">
              {{ item.badge > 9 ? '9+' : item.badge }}
            </span>
          }
        </a>
      }
    </nav>

    <!-- User -->
    <div class="border-t border-gray-100 pt-4">
      <a [routerLink]="['/profile', auth.currentUser()?.username]"
         class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition">
        <img [src]="auth.currentUser()?.avatarUrl || '/assets/default-avatar.png'"
             class="w-9 h-9 rounded-full object-cover">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ auth.currentUser()?.fullName || auth.currentUser()?.username }}
          </p>
          <p class="text-xs text-gray-400 truncate">&#64;{{ auth.currentUser()?.username }}</p>
        </div>
      </a>
      <button (click)="auth.logout()"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400
                     hover:bg-red-50 hover:text-red-500 transition text-sm mt-1">
        <span class="text-xl">🚪</span> Sign out
      </button>
    </div>
  </aside>

  <!-- ── Main Content ─────────────────────────────────────────── -->
  <main class="flex-1 md:ml-64 pb-20 md:pb-0">
    <ng-content></ng-content>
  </main>

  <!-- ── Mobile Bottom Nav ────────────────────────────────────── -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100
              flex justify-around items-center h-16 px-2 z-20">
    @for (item of mobileNav; track item.label) {
      <a [routerLink]="item.path"
         routerLinkActive="text-indigo-600"
         class="flex flex-col items-center gap-0.5 text-gray-400 hover:text-indigo-600 transition px-3">
        <span class="text-2xl">{{ item.icon }}</span>
        <span class="text-xs">{{ item.label }}</span>
      </a>
    }
  </nav>
</div>
  `
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}

  navItems = [
    { icon: '🏠', label: 'Feed',          path: '/feed',          badge: 0 },
    { icon: '🔍', label: 'Explore',       path: '/explore',       badge: 0 },
    { icon: '💬', label: 'Messages',      path: '/messages',      badge: 3 },
    { icon: '🔔', label: 'Notifications', path: '/notifications', badge: 5 },
    { icon: '👤', label: 'Profile',       path: '/profile/' + (this.auth.currentUser()?.username ?? ''), badge: 0 },
    { icon: '⚙️',  label: 'Settings',     path: '/settings',      badge: 0 },
  ];

  mobileNav = [
    { icon: '🏠', label: 'Home',    path: '/feed' },
    { icon: '🔍', label: 'Explore', path: '/explore' },
    { icon: '💬', label: 'Chat',    path: '/messages' },
    { icon: '🔔', label: 'Alerts',  path: '/notifications' },
    { icon: '👤', label: 'Profile', path: '/profile/' + (this.auth.currentUser()?.username ?? '') },
  ];
}
