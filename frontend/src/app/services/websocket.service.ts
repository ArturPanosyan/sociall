import { Injectable }    from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS             from 'sockjs-client';
import { Subject }        from 'rxjs';
import { environment }    from '../../environments/environment';
import { AuthService }    from './auth.service';

export interface ChatMessage {
  conversationId: number;
  sender:         string;
  content:        string;
  type:           string;
  timestamp:      string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {

  private client!: Client;
  message$ = new Subject<ChatMessage>();
  typing$  = new Subject<{ username: string; typing: boolean }>();
  connected = false;

  private pendingSubs = new Map<string, (data: any) => void>();

  constructor(private auth: AuthService) {}

  connect(): void {
    if (this.connected) return;
    const token = this.auth.getToken();
    this.client = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        this.connected = true;
        this.client.subscribe('/user/queue/messages', (msg: IMessage) => {
          this.message$.next(JSON.parse(msg.body));
        });
        this.client.subscribe('/topic/typing', (msg: IMessage) => {
          this.typing$.next(JSON.parse(msg.body));
        });
        this.pendingSubs.forEach((cb, dest) => {
          this.client.subscribe(dest, (m: IMessage) => cb(JSON.parse(m.body)));
        });
      },
      onDisconnect: () => { this.connected = false; }
    });
    this.client.activate();
  }

  onMessage(destination: string, callback: (data: any) => void): void {
    this.pendingSubs.set(destination, callback);
    if (this.connected) {
      this.client.subscribe(destination, (m: IMessage) => callback(JSON.parse(m.body)));
    }
  }

  send(destination: string, body: object): void {
    if (!this.client?.connected) return;
    this.client.publish({ destination, body: JSON.stringify(body) });
  }

  sendMessage(msg: Omit<ChatMessage, 'sender' | 'timestamp'>): void {
    this.send('/app/chat.send', msg);
  }

  sendTyping(conversationId: number, typing: boolean): void {
    this.send('/app/chat.typing', { conversationId, typing });
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected = false;
  }
}
