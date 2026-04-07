import { Injectable, signal }   from '@angular/core';
import { WebSocketService }     from './websocket.service';
import { AuthService }          from './auth.service';

export type CallState = 'idle' | 'calling' | 'incoming' | 'active' | 'ended';

export interface CallInfo {
  callId:       string;
  remoteUser:   string;
  videoEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class WebRtcService {

  callState    = signal<CallState>('idle');
  callInfo     = signal<CallInfo | null>(null);
  localStream  = signal<MediaStream | null>(null);
  remoteStream = signal<MediaStream | null>(null);

  private pc: RTCPeerConnection | null = null;

  private readonly ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
      // Добавить TURN сервер для продакшена:
      // { urls: 'turn:your-turn.server.com', username: 'user', credential: 'pass' }
    ]
  };

  constructor(private ws: WebSocketService, private auth: AuthService) {
    this.listenSignals();
  }

  // ─── Слушать входящие сигналы ─────────────────────────────
  private listenSignals() {
    // Входящий звонок
    this.ws.onMessage('/user/queue/call/incoming', async (data: any) => {
      this.callInfo.set({ callId: data.callId, remoteUser: data.caller, videoEnabled: data.videoEnabled });
      this.callState.set('incoming');
    });

    // Получили SDP offer
    this.ws.onMessage('/user/queue/call/offer', async (data: any) => {
      await this.handleOffer(data.sdp, data.callId);
    });

    // Получили SDP answer
    this.ws.onMessage('/user/queue/call/answer', async (data: any) => {
      await this.pc?.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    // Получили ICE candidate
    this.ws.onMessage('/user/queue/call/ice', async (data: any) => {
      if (this.pc && data.candidate) {
        await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // Звонок завершён
    this.ws.onMessage('/user/queue/call/end', () => this.cleanup());

    // Звонок отклонён
    this.ws.onMessage('/user/queue/call/rejected', () => {
      this.callState.set('ended');
      setTimeout(() => this.cleanup(), 2000);
    });
  }

  // ─── Позвонить ────────────────────────────────────────────
  async call(targetUsername: string, videoEnabled = true) {
    const stream = await this.getMedia(videoEnabled);
    this.localStream.set(stream);

    this.pc = this.createPeerConnection();
    stream.getTracks().forEach(t => this.pc!.addTrack(t, stream));

    const callId = crypto.randomUUID();
    this.callInfo.set({ callId, remoteUser: targetUsername, videoEnabled });
    this.callState.set('calling');

    // Сигнализация: начать звонок
    this.ws.send('/app/call.initiate', { targetUsername, videoEnabled, callId });

    // Создать и отправить offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.ws.send('/app/call.offer', { callId, sdp: offer });
  }

  // ─── Ответить на звонок ───────────────────────────────────
  async answer() {
    const info = this.callInfo();
    if (!info) return;

    const stream = await this.getMedia(info.videoEnabled);
    this.localStream.set(stream);
    this.callState.set('active');

    this.pc = this.createPeerConnection();
    stream.getTracks().forEach(t => this.pc!.addTrack(t, stream));
  }

  // ─── Обработать входящий offer ────────────────────────────
  private async handleOffer(sdp: RTCSessionDescriptionInit, callId: string) {
    if (!this.pc) {
      const stream = await this.getMedia(this.callInfo()?.videoEnabled ?? true);
      this.localStream.set(stream);
      this.pc = this.createPeerConnection();
      stream.getTracks().forEach(t => this.pc!.addTrack(t, stream!));
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.ws.send('/app/call.answer', { callId, sdp: answer });
    this.callState.set('active');
  }

  // ─── Завершить / Отклонить ────────────────────────────────
  endCall() {
    const info = this.callInfo();
    if (info) this.ws.send('/app/call.end', { callId: info.callId });
    this.cleanup();
  }

  rejectCall() {
    const info = this.callInfo();
    if (info) this.ws.send('/app/call.reject', { callId: info.callId });
    this.cleanup();
  }

  // ─── Переключить камеру / микрофон ───────────────────────
  toggleVideo() {
    this.localStream()?.getVideoTracks().forEach(t => t.enabled = !t.enabled);
  }

  toggleAudio() {
    this.localStream()?.getAudioTracks().forEach(t => t.enabled = !t.enabled);
  }

  // ─── Создать PeerConnection ───────────────────────────────
  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.ICE_SERVERS);

    pc.ontrack = e => {
      if (e.streams[0]) this.remoteStream.set(e.streams[0]);
    };

    pc.onicecandidate = e => {
      if (e.candidate && this.callInfo()) {
        this.ws.send('/app/call.ice', {
          callId:    this.callInfo()!.callId,
          candidate: e.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') this.callState.set('active');
      if (['disconnected','failed','closed'].includes(pc.connectionState)) this.cleanup();
    };

    return pc;
  }

  // ─── Получить медиа-поток ─────────────────────────────────
  private async getMedia(video: boolean): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ audio: true, video });
  }

  // ─── Очистить ─────────────────────────────────────────────
  private cleanup() {
    this.pc?.close();
    this.pc = null;
    this.localStream()?.getTracks().forEach(t => t.stop());
    this.localStream.set(null);
    this.remoteStream.set(null);
    this.callState.set('idle');
    this.callInfo.set(null);
  }
}
