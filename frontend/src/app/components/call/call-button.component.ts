import { Component, Input }  from '@angular/core';
import { CommonModule }      from '@angular/common';
import { WebRtcService }     from '../../services/webrtc.service';

@Component({
  selector: 'app-call-button',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="flex gap-2">
  <!-- Аудио звонок -->
  <button (click)="call(false)"
          [disabled]="rtc.callState() !== 'idle'"
          title="Audio call"
          class="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100
                 hover:text-green-600 text-gray-500 flex items-center justify-center
                 transition disabled:opacity-40 text-lg">
    📞
  </button>

  <!-- Видео звонок -->
  <button (click)="call(true)"
          [disabled]="rtc.callState() !== 'idle'"
          title="Video call"
          class="w-10 h-10 rounded-full bg-gray-100 hover:bg-indigo-100
                 hover:text-indigo-600 text-gray-500 flex items-center justify-center
                 transition disabled:opacity-40 text-lg">
    📹
  </button>
</div>
  `
})
export class CallButtonComponent {
  @Input() username!: string;
  constructor(public rtc: WebRtcService) {}
  call(video: boolean) { this.rtc.call(this.username, video); }
}
