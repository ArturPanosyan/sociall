import { Component, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService }       from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-50">

  <!-- Left panel — hidden on mobile -->
  <div class="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 flex-col justify-center items-center p-12 text-white">
    <div class="max-w-md">
      <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-8">
        🌐
      </div>
      <h1 class="text-4xl font-bold mb-4">Welcome to SocialNet</h1>
      <p class="text-indigo-200 text-lg leading-relaxed mb-8">
        Connect with friends, share your moments, and discover amazing content in real-time.
      </p>
      <div class="space-y-4">
        @for (feat of features; track feat.icon) {
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              {{ feat.icon }}
            </div>
            <div>
              <p class="font-medium">{{ feat.title }}</p>
              <p class="text-indigo-200 text-sm">{{ feat.desc }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  </div>

  <!-- Right panel — login form -->
  <div class="flex-1 flex items-center justify-center p-6">
    <div class="w-full max-w-md">

      <!-- Mobile logo -->
      <div class="lg:hidden text-center mb-8">
        <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🌐</div>
        <h1 class="text-2xl font-bold text-gray-900">SocialNet</h1>
      </div>

      <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
        <p class="text-gray-500 text-sm mb-6">Welcome back! Enter your details below.</p>

        <!-- Demo hint -->
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-6 text-sm">
          <p class="font-medium text-indigo-700 mb-1">🎉 Demo account</p>
          <p class="text-indigo-600">Email: <strong>demo&#64;socialnet.com</strong></p>
          <p class="text-indigo-600">Password: <strong>Demo123!</strong></p>
          <button (click)="fillDemo()" class="mt-2 text-xs underline text-indigo-500 hover:text-indigo-700">
            Auto-fill →
          </button>
        </div>

        @if (error()) {
          <div class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
            <span>⚠️</span> {{ error() }}
          </div>
        }

        <form (ngSubmit)="login()">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email or Username</label>
              <input [(ngModel)]="email" name="email" type="text"
                     placeholder="you@example.com"
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-sm font-medium text-gray-700">Password</label>
                <a routerLink="/forgot-password" class="text-xs text-indigo-600 hover:text-indigo-700">Forgot password?</a>
              </div>
              <div class="relative">
                <input [(ngModel)]="password" name="password" [type]="showPwd ? 'text' : 'password'"
                       placeholder="••••••••"
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-11">
                <button type="button" (click)="showPwd = !showPwd"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base">
                  {{ showPwd ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" [disabled]="loading() || !email || !password"
                  class="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2">
            @if (loading()) { <span class="animate-spin">⟳</span> Signing in... }
            @else { Sign In }
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <a routerLink="/register" class="text-indigo-600 hover:text-indigo-700 font-medium">Create one →</a>
        </p>
      </div>
    </div>
  </div>
</div>
  `
})
export class LoginComponent {
  email    = '';
  password = '';
  showPwd  = false;
  loading  = signal(false);
  error    = signal('');

  features = [
    { icon: '💬', title: 'Real-time Chat',     desc: 'Message anyone instantly' },
    { icon: '📸', title: 'Share Moments',       desc: 'Photos, videos and stories' },
    { icon: '📹', title: 'Video Calls',         desc: 'HD calls with WebRTC' },
    { icon: '🔔', title: 'Live Notifications',  desc: 'Never miss a thing' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  fillDemo() { this.email = 'demo@socialnet.com'; this.password = 'Demo123!'; }

  login() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next:  () => this.router.navigate([this.auth.isFirstLogin() ? '/onboarding' : '/feed']),
      error: e  => { this.error.set(e.error?.message || 'Invalid credentials'); this.loading.set(false); }
    });
  }
}
