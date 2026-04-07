import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  template: `
@if (showPrompt()) {
  <div class="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80
              bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-40
              flex items-center gap-3">
    <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center
                text-white text-xl font-bold flex-shrink-0">S</div>
    <div class="flex-1">
      <p class="font-semibold text-gray-900 text-sm">Install SocialNet</p>
      <p class="text-xs text-gray-500 mt-0.5">Add to home screen for the best experience</p>
    </div>
    <div class="flex flex-col gap-1">
      <button (click)="install()"
              class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium
                     px-3 py-1.5 rounded-lg transition">
        Install
      </button>
      <button (click)="dismiss()"
              class="text-gray-400 hover:text-gray-500 text-xs px-3 py-1">
        Later
      </button>
    </div>
  </div>
}
  `
})
export class PwaInstallComponent implements OnInit {
  showPrompt  = signal(false);
  private deferredPrompt: any;

  ngOnInit() {
    // Проверить что уже не установлено
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      this.deferredPrompt = e;

      // Показать через 30 секунд после захода
      setTimeout(() => this.showPrompt.set(true), 30_000);
    });
  }

  async install() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.showPrompt.set(false);
      this.deferredPrompt = null;
    }
  }

  dismiss() {
    this.showPrompt.set(false);
    // Не показывать снова 7 дней
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  }
}
