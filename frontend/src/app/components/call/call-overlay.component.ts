import { Component, OnDestroy,
         ViewChild, ElementRef,
         AfterViewInit, effect, signal } from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { WebRtcService }                 from '../../services/webrtc.service';
import { AuthService }                   from '../../services/auth.service';

@Component({
  selector: 'app-call-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
<!-- ── Incoming Call Banner ─────────────────────────────────── -->
@if (rtc.callState() === 'incoming') {
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50
              bg-white rounded-2xl shadow-2xl border border-gray-100 p-5
              flex items-center gap-4 w-80 animate-bounce-in">
    <div class="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full
                flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
      {{ rtc.callInfo()?.remoteUser?.charAt(0)?.toUpperCase() }}
    </div>
    <div class="flex-1">
      <p class="font-semibold text-gray-900">{{ rtc.callInfo()?.remoteUser }}</p>
      <p class="text-sm text-gray-500">
        Incoming {{ rtc.callInfo()?.videoEnabled ? '📹 Video' : '📞 Audio' }} call...
      </p>
    </div>
    <div class="flex gap-2">
      <button (click)="rtc.rejectCall()"
              class="w-11 h-11 bg-red-500 hover:bg-red-600 text-white rounded-full
                     flex items-center justify-center text-xl transition shadow-md">
        📵
      </button>
      <button (click)="rtc.answer()"
              class="w-11 h-11 bg-green-500 hover:bg-green-600 text-white rounded-full
                     flex items-center justify-center text-xl transition shadow-md">
        📞
      </button>
    </div>
  </div>
}

<!-- ── Calling / Active Call Screen ─────────────────────────── -->
@if (rtc.callState() === 'calling' || rtc.callState() === 'active') {
  <div class="fixed inset-0 bg-gray-900 z-50 flex flex-col">

    <!-- Remote video (full screen) -->
    <div class="flex-1 relative bg-gray-800 flex items-center justify-center">
      @if (rtc.remoteStream() && rtc.callInfo()?.videoEnabled) {
        <video #remoteVideo autoplay playsinline
               class="w-full h-full object-cover"></video>
      } @else {
        <!-- Audio call / waiting -->
        <div class="flex flex-col items-center gap-4 text-white">
          <div class="w-28 h-28 bg-gradient-to-br from-indigo-400 to-purple-500
                      rounded-full flex items-center justify-center text-5xl font-bold
                      animate-pulse shadow-2xl">
            {{ rtc.callInfo()?.remoteUser?.charAt(0)?.toUpperCase() }}
          </div>
          <p class="text-2xl font-semibold">{{ rtc.callInfo()?.remoteUser }}</p>
          <p class="text-gray-400">
            @if (rtc.callState() === 'calling') { Calling... }
            @else { {{ callDuration() }} }
          </p>
        </div>
      }

      <!-- Local video (PiP corner) -->
      @if (rtc.localStream() && rtc.callInfo()?.videoEnabled) {
        <video #localVideo autoplay playsinline muted
               class="absolute bottom-4 right-4 w-32 h-44 rounded-2xl object-cover
                      border-2 border-white shadow-xl cursor-pointer"></video>
      }
    </div>

    <!-- Controls bar -->
    <div class="bg-gray-900/95 backdrop-blur px-6 py-6">
      <div class="flex items-center justify-center gap-5">

        <!-- Mute audio -->
        <button (click)="toggleAudio()"
                class="w-14 h-14 rounded-full flex items-center justify-center text-2xl
                       transition shadow-lg"
                [class.bg-gray-700]="!audioMuted()"
                [class.hover:bg-gray-600]="!audioMuted()"
                [class.bg-red-500]="audioMuted()">
          {{ audioMuted() ? '🔇' : '🎤' }}
        </button>

        <!-- End call -->
        <button (click)="rtc.endCall()"
                class="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full
                       flex items-center justify-center text-3xl transition shadow-xl">
          📵
        </button>

        <!-- Toggle video -->
        @if (rtc.callInfo()?.videoEnabled) {
          <button (click)="toggleVideo()"
                  class="w-14 h-14 rounded-full flex items-center justify-center text-2xl
                         transition shadow-lg"
                  [class.bg-gray-700]="!videoOff()"
                  [class.bg-red-500]="videoOff()">
            {{ videoOff() ? '📷' : '📹' }}
          </button>
        } @else {
          <div class="w-14 h-14"></div>
        }
      </div>
    </div>
  </div>
}

<!-- ── Call Ended Toast ───────────────────────────────────────── -->
@if (rtc.callState() === 'ended') {
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50
              bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-xl">
    Call ended
  </div>
}
  `
})
export class CallOverlayComponent implements AfterViewInit, OnDestroy {
  @ViewChild('localVideo')  localVideoEl!:  ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoEl!: ElementRef<HTMLVideoElement>;

  audioMuted = signal(false);
  videoOff   = signal(false);
  callDuration = signal('00:00');
  private timer: any;

  constructor(public rtc: WebRtcService, public auth: AuthService) {
    // Привязать потоки к video элементам
    effect(() => {
      const local = this.rtc.localStream();
      if (local && this.localVideoEl?.nativeElement) {
        this.localVideoEl.nativeElement.srcObject = local;
      }
    });

    effect(() => {
      const remote = this.rtc.remoteStream();
      if (remote && this.remoteVideoEl?.nativeElement) {
        this.remoteVideoEl.nativeElement.srcObject = remote;
      }
    });

    // Таймер длительности звонка
    effect(() => {
      if (this.rtc.callState() === 'active') {
        let sec = 0;
        this.timer = setInterval(() => {
          sec++;
          const m = Math.floor(sec / 60).toString().padStart(2, '0');
          const s = (sec % 60).toString().padStart(2, '0');
          this.callDuration.set(`${m}:${s}`);
        }, 1000);
      } else {
        clearInterval(this.timer);
        this.callDuration.set('00:00');
      }
    });
  }

  ngAfterViewInit() {}

  toggleAudio() {
    this.rtc.toggleAudio();
    this.audioMuted.update(v => !v);
  }

  toggleVideo() {
    this.rtc.toggleVideo();
    this.videoOff.update(v => !v);
  }

  ngOnDestroy() { clearInterval(this.timer); }
}
