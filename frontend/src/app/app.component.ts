import { Component, OnInit }   from '@angular/core';
import { CommonModule }        from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter }              from 'rxjs';
import { AuthService }         from './services/auth.service';
import { LayoutComponent }     from './components/layout/layout.component';
import { WebSocketService }    from './services/websocket.service';
import { CallOverlayComponent } from './components/call/call-overlay.component';
import { PwaInstallComponent }  from './components/pwa/pwa-install.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LayoutComponent, CallOverlayComponent, PwaInstallComponent],
  template: `
    <app-call-overlay />
    <app-pwa-install />
    @if (showLayout) {
      <app-layout><router-outlet /></app-layout>
    } @else {
      <router-outlet />
    }
  `
})
export class AppComponent implements OnInit {
  showLayout = false;
  private noLayout = ['/login', '/register'];

  constructor(private router: Router, private auth: AuthService, private ws: WebSocketService) {}

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.showLayout = !this.noLayout.some(p => e.url.startsWith(p));
    });
    if (this.auth.isLoggedIn()) this.ws.connect();
  }
}
