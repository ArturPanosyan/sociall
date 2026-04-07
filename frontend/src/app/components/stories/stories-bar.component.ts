import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { HttpClient }                from '@angular/common/http';
import { AuthService }               from '../../services/auth.service';
import { environment }               from '../../../environments/environment';

interface StoryGroup {
  username:  string;
  fullName:  string;
  avatarUrl: string;
  stories:   any[];
  seen:      boolean;
}

@Component({
  selector: 'app-stories-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
  <div class="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">

    <!-- Add My Story -->
    <div class="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
         (click)="storyInput.click()">
      <div class="relative">
        <div class="w-16 h-16 rounded-full border-2 border-dashed border-indigo-300
                    flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 transition">
          <span class="text-2xl text-indigo-400">+</span>
        </div>
        <input #storyInput type="file" accept="image/*,video/*"
               class="hidden" (change)="uploadStory($event)">
      </div>
      <span class="text-xs text-gray-500 w-16 text-center truncate">Your Story</span>
    </div>

    <!-- Friend Stories -->
    @for (group of storyGroups(); track group.username) {
      <div class="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
           (click)="openStory(group)">
        <div class="p-0.5 rounded-full"
             [class.bg-gradient-to-tr]="!group.seen"
             [class.from-yellow-400]="!group.seen"
             [class.to-pink-600]="!group.seen"
             [class.bg-gray-200]="group.seen">
          <img [src]="group.avatarUrl || '/assets/default-avatar.png'"
               class="w-14 h-14 rounded-full object-cover border-2 border-white">
        </div>
        <span class="text-xs text-gray-600 w-16 text-center truncate font-medium">
          {{ group.username }}
        </span>
      </div>
    }

    @if (!loading() && storyGroups().length === 0) {
      <div class="flex items-center text-sm text-gray-400 py-4 px-2">
        No stories yet — follow people to see their stories
      </div>
    }

    @if (loading()) {
      @for (i of [1,2,3,4]; track i) {
        <div class="flex flex-col items-center gap-1.5 flex-shrink-0 animate-pulse">
          <div class="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div class="w-12 h-2 bg-gray-100 rounded"></div>
        </div>
      }
    }
  </div>
</div>

<!-- Story Viewer Modal -->
@if (activeGroup()) {
  <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
       (click)="closeStory()">
    <div class="relative max-w-sm w-full mx-4" (click)="$event.stopPropagation()">

      <!-- Progress bars -->
      <div class="flex gap-1 mb-3 px-2">
        @for (story of activeGroup()!.stories; track story.id; let i = $index) {
          <div class="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div class="h-full bg-white rounded-full transition-all duration-5000"
                 [style.width]="i < activeIndex() ? '100%' : i === activeIndex() ? '100%' : '0%'">
            </div>
          </div>
        }
      </div>

      <!-- Header -->
      <div class="flex items-center gap-2 mb-3 px-2">
        <img [src]="activeGroup()!.avatarUrl || '/assets/default-avatar.png'"
             class="w-9 h-9 rounded-full object-cover border-2 border-white">
        <span class="text-white font-semibold text-sm">{{ activeGroup()!.username }}</span>
        <span class="text-white/50 text-xs ml-auto">
          {{ activeIndex() + 1 }} / {{ activeGroup()!.stories.length }}
        </span>
        <button (click)="closeStory()" class="text-white text-xl ml-2">×</button>
      </div>

      <!-- Media -->
      <div class="aspect-[9/16] rounded-2xl overflow-hidden bg-black relative">
        @if (currentStory()?.type === 'VIDEO') {
          <video [src]="currentStory()?.mediaUrl" autoplay muted loop
                 class="w-full h-full object-contain"></video>
        } @else {
          <img [src]="currentStory()?.mediaUrl" class="w-full h-full object-contain">
        }

        <!-- Tap zones -->
        <div class="absolute inset-0 flex">
          <div class="w-1/3 h-full" (click)="prevStory()"></div>
          <div class="w-2/3 h-full" (click)="nextStory()"></div>
        </div>
      </div>
    </div>
  </div>
}
  `
})
export class StoriesBarComponent implements OnInit {
  storyGroups  = signal<StoryGroup[]>([]);
  loading      = signal(true);
  activeGroup  = signal<StoryGroup | null>(null);
  activeIndex  = signal(0);

  get currentStory() {
    return () => this.activeGroup()?.stories[this.activeIndex()];
  }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.loadStories(); }

  loadStories() {
    this.http.get<any>(`${environment.apiUrl}/stories/feed`).subscribe({
      next: data => {
        const groups = Object.entries(data).map(([username, stories]: [string, any]) => ({
          username,
          fullName:  stories[0]?.user?.fullName || username,
          avatarUrl: stories[0]?.user?.avatarUrl,
          stories:   stories,
          seen:      false
        }));
        this.storyGroups.set(groups);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  uploadStory(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    this.http.post(`${environment.apiUrl}/stories`, form).subscribe(() => this.loadStories());
  }

  openStory(group: StoryGroup) {
    this.activeGroup.set(group);
    this.activeIndex.set(0);
    this.http.post(`${environment.apiUrl}/stories/${group.stories[0].id}/view`, {}).subscribe();
  }

  nextStory() {
    const g = this.activeGroup();
    if (!g) return;
    if (this.activeIndex() < g.stories.length - 1) {
      this.activeIndex.update(i => i + 1);
    } else { this.closeStory(); }
  }

  prevStory() {
    if (this.activeIndex() > 0) this.activeIndex.update(i => i - 1);
  }

  closeStory() { this.activeGroup.set(null); }
}
