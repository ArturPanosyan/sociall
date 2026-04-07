import { Component }  from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50
            flex items-center justify-center p-4">
  <div class="text-center">
    <div class="text-9xl font-black text-indigo-200 mb-2 select-none">404</div>
    <h1 class="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
    <p class="text-gray-500 mb-8 max-w-sm mx-auto">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div class="flex gap-3 justify-center">
      <a routerLink="/feed"
         class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold
                px-6 py-3 rounded-xl transition">
        Go to Feed
      </a>
      <button onclick="history.back()"
              class="border-2 border-gray-200 hover:bg-gray-50 text-gray-700
                     font-semibold px-6 py-3 rounded-xl transition">
        Go Back
      </button>
    </div>
  </div>
</div>
  `
})
export class NotFoundComponent {}
