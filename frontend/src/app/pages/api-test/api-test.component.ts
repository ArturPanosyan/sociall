import { Component, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment }       from '../../../environments/environment';

interface TestResult {
  method: string; url: string; status: number;
  ok: boolean; duration: number; body: string;
}

interface EndpointGroup {
  name: string; icon: string; color: string;
  endpoints: Endpoint[];
}

interface Endpoint {
  method: string; path: string; label: string;
  body?: string; requiresAuth?: boolean;
}

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="max-w-4xl mx-auto px-4 py-6">

  <div class="mb-6">
    <h1 style="font-size:22px;font-weight:500;color:var(--text-primary)">API Tester</h1>
    <p style="font-size:13px;color:var(--text-secondary);margin-top:4px">
      Test backend endpoints directly from here
    </p>
  </div>

  <!-- Backend status -->
  <div class="rounded-2xl p-4 mb-6 flex items-center gap-4"
       style="background:var(--bg-primary);border:0.5px solid var(--border)">
    <div>
      <div style="font-size:13px;font-weight:500;color:var(--text-primary)">Backend URL</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;font-family:monospace">
        {{ apiUrl }}
      </div>
    </div>
    <button (click)="checkHealth()"
            style="margin-left:auto;padding:7px 16px;background:#6366f1;color:#fff;
                   border:none;border-radius:8px;font-size:13px;cursor:pointer">
      Check Status
    </button>
    @if (healthStatus()) {
      <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px"
           [style.background]="healthStatus()!.ok ? '#dcfce7' : '#fee2e2'">
        <div style="width:8px;height:8px;border-radius:50%"
             [style.background]="healthStatus()!.ok ? '#16a34a' : '#dc2626'"></div>
        <span style="font-size:12px;font-weight:500"
              [style.color]="healthStatus()!.ok ? '#15803d' : '#b91c1c'">
          {{ healthStatus()!.ok ? 'Online' : 'Offline' }}
        </span>
        <span style="font-size:11px;color:#6b7280">{{ healthStatus()!.duration }}ms</span>
      </div>
    }
  </div>

  <!-- JWT Token -->
  <div class="rounded-2xl p-4 mb-6" style="background:var(--bg-primary);border:0.5px solid var(--border)">
    <div style="font-size:13px;font-weight:500;color:var(--text-primary);margin-bottom:8px">
      🔐 Auth Token (JWT)
    </div>
    <div class="flex gap-2">
      <input [(ngModel)]="token"
             placeholder="Paste JWT token here, or Login below to auto-fill..."
             style="flex:1;padding:7px 12px;border:0.5px solid var(--border);border-radius:8px;
                    font-size:12px;background:var(--bg-secondary);color:var(--text-primary);
                    outline:none;font-family:monospace">
      <button (click)="quickLogin()"
              style="padding:7px 14px;background:#10b981;color:#fff;border:none;
                     border-radius:8px;font-size:12px;cursor:pointer;white-space:nowrap">
        Auto Login
      </button>
      <button (click)="token = ''"
              style="padding:7px 12px;border:0.5px solid var(--border);background:none;
                     border-radius:8px;font-size:12px;cursor:pointer;color:var(--text-secondary)">
        Clear
      </button>
    </div>
    @if (token) {
      <div style="font-size:11px;color:#16a34a;margin-top:6px">✓ Token set — authenticated requests enabled</div>
    }
  </div>

  <!-- Endpoint groups -->
  <div class="grid grid-cols-1 gap-4">
    @for (group of groups; track group.name) {
      <div class="rounded-2xl overflow-hidden" style="background:var(--bg-primary);border:0.5px solid var(--border)">
        <div style="padding:12px 16px;border-bottom:0.5px solid var(--border);
                    display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">{{ group.icon }}</span>
          <span style="font-weight:500;font-size:14px;color:var(--text-primary)">{{ group.name }}</span>
        </div>
        <div>
          @for (ep of group.endpoints; track ep.path) {
            <div style="padding:10px 16px;border-bottom:0.5px solid var(--border);
                        display:flex;align-items:center;gap:10px">
              <span style="font-size:10px;font-weight:600;padding:3px 7px;border-radius:5px;
                           min-width:44px;text-align:center;font-family:monospace"
                    [style.background]="methodBg(ep.method)"
                    [style.color]="methodColor(ep.method)">
                {{ ep.method }}
              </span>
              <span style="font-size:12px;font-family:monospace;color:var(--text-secondary);flex:1">
                {{ ep.path }}
              </span>
              <span style="font-size:12px;color:var(--text-primary);flex:2">{{ ep.label }}</span>
              @if (ep.requiresAuth) {
                <span style="font-size:10px;color:#b45309;background:#fef3c7;
                             padding:2px 6px;border-radius:10px">🔐 Auth</span>
              }
              <button (click)="runEndpoint(ep)"
                      style="padding:5px 12px;background:#6366f1;color:#fff;border:none;
                             border-radius:6px;font-size:12px;cursor:pointer">
                Run
              </button>
            </div>
          }
        </div>
      </div>
    }
  </div>

  <!-- Results panel -->
  @if (results().length) {
    <div class="rounded-2xl overflow-hidden mt-6" style="background:var(--bg-primary);border:0.5px solid var(--border)">
      <div style="padding:12px 16px;border-bottom:0.5px solid var(--border);
                  display:flex;align-items:center;justify-content:space-between">
        <span style="font-weight:500;font-size:14px;color:var(--text-primary)">Results</span>
        <button (click)="results.set([])"
                style="font-size:12px;color:var(--text-secondary);border:none;background:none;cursor:pointer">
          Clear
        </button>
      </div>
      @for (r of results(); track $index) {
        <div style="padding:12px 16px;border-bottom:0.5px solid var(--border)">
          <div class="flex items-center gap-2 mb-2">
            <span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;font-family:monospace"
                  [style.background]="methodBg(r.method)"
                  [style.color]="methodColor(r.method)">{{ r.method }}</span>
            <span style="font-size:12px;font-family:monospace;color:var(--text-secondary)">{{ r.url }}</span>
            <span style="margin-left:auto;font-size:12px;font-weight:500;padding:2px 8px;border-radius:6px"
                  [style.background]="r.ok ? '#dcfce7' : '#fee2e2'"
                  [style.color]="r.ok ? '#15803d' : '#b91c1c'">
              {{ r.status }}
            </span>
            <span style="font-size:11px;color:var(--text-muted)">{{ r.duration }}ms</span>
          </div>
          <pre style="font-size:11px;font-family:monospace;background:var(--bg-secondary);
                      padding:10px;border-radius:8px;overflow-x:auto;white-space:pre-wrap;
                      color:var(--text-primary);max-height:200px;overflow-y:auto">{{ r.body }}</pre>
        </div>
      }
    </div>
  }
</div>
  `
})
export class ApiTestComponent {
  apiUrl      = environment.apiUrl;
  token       = '';
  healthStatus = signal<{ok:boolean;duration:number}|null>(null);
  results      = signal<TestResult[]>([]);

  groups: EndpointGroup[] = [
    {
      name: 'Auth', icon: '🔐', color: '#6366f1',
      endpoints: [
        { method:'POST', path:'/api/auth/login',    label:'Login user',
          body: JSON.stringify({emailOrUsername:'demo@socialnet.com', password:'Demo123!'}, null, 2) },
        { method:'POST', path:'/api/auth/register', label:'Register new user',
          body: JSON.stringify({username:'testuser', email:'test@example.com', password:'Test123!', fullName:'Test User'}, null, 2) },
        { method:'POST', path:'/api/auth/logout',   label:'Logout', requiresAuth: true },
      ]
    },
    {
      name: 'Posts', icon: '📝', color: '#0ea5e9',
      endpoints: [
        { method:'GET',  path:'/api/posts/feed',         label:'Get feed posts',         requiresAuth: true },
        { method:'GET',  path:'/api/posts/user/alice',   label:'Get Alice\'s posts',     requiresAuth: true },
        { method:'POST', path:'/api/posts',              label:'Create post',            requiresAuth: true,
          body: JSON.stringify({content:'Test post from API tester! 🚀', visibility:'PUBLIC'}, null, 2) },
      ]
    },
    {
      name: 'Users', icon: '👤', color: '#10b981',
      endpoints: [
        { method:'GET', path:'/api/users/alice',         label:'Get Alice profile',      requiresAuth: true },
        { method:'GET', path:'/api/users/search?q=alice',label:'Search users',           requiresAuth: true },
        { method:'GET', path:'/api/users/alice/followers',label:'Get followers',         requiresAuth: true },
      ]
    },
    {
      name: 'Analytics', icon: '📈', color: '#f59e0b',
      endpoints: [
        { method:'GET', path:'/api/analytics/profile',   label:'My analytics',          requiresAuth: true },
      ]
    },
    {
      name: 'AI', icon: '🤖', color: '#8b5cf6',
      endpoints: [
        { method:'POST', path:'/api/ai/chat',            label:'Chat with AI',           requiresAuth: true,
          body: JSON.stringify({message:'Give me a post idea about technology'}, null, 2) },
        { method:'POST', path:'/api/ai/suggest-post',    label:'Suggest post content',   requiresAuth: true,
          body: JSON.stringify({topic:'coffee and coding'}, null, 2) },
      ]
    },
    {
      name: 'System', icon: '⚙️', color: '#6b7280',
      endpoints: [
        { method:'GET', path:'/actuator/health',         label:'Health check' },
        { method:'GET', path:'/api-docs',                label:'OpenAPI spec (JSON)' },
      ]
    },
  ];

  constructor(private http: HttpClient) {}

  checkHealth() {
    const t0 = Date.now();
    this.http.get(`${environment.apiUrl.replace('/api','')}/actuator/health`).subscribe({
      next: () => this.healthStatus.set({ ok: true,  duration: Date.now() - t0 }),
      error: () => this.healthStatus.set({ ok: false, duration: Date.now() - t0 }),
    });
  }

  quickLogin() {
    const t0 = Date.now();
    this.http.post<any>(`${environment.apiUrl}/auth/login`, {
      emailOrUsername: 'demo@socialnet.com', password: 'Demo123!'
    }).subscribe({
      next: r => {
        this.token = r.accessToken;
        this.addResult('POST', `${environment.apiUrl}/auth/login`, 200, true, Date.now()-t0,
          JSON.stringify({accessToken: r.accessToken?.substring(0,30)+'...', user: r.user}, null, 2));
      },
      error: e => this.addResult('POST', `${environment.apiUrl}/auth/login`,
        e.status, false, Date.now()-t0, JSON.stringify(e.error, null, 2))
    });
  }

  runEndpoint(ep: Endpoint) {
    const t0 = Date.now();
    const url  = `${environment.apiUrl.replace('/api','')}${ep.path}`;
    let headers: Record<string,string> = {'Content-Type':'application/json'};
    if (ep.requiresAuth && this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const opts = { headers: new HttpHeaders(headers) };
    const body = ep.body ? JSON.parse(ep.body) : undefined;

    const req$ = ep.method === 'GET'
      ? this.http.get(url, opts)
      : ep.method === 'POST'
        ? this.http.post(url, body, opts)
        : this.http.delete(url, opts);

    req$.subscribe({
      next: r  => this.addResult(ep.method, url, 200, true,  Date.now()-t0, JSON.stringify(r, null, 2)),
      error: e => this.addResult(ep.method, url, e.status, false, Date.now()-t0, JSON.stringify(e.error||e.message, null, 2))
    });
  }

  private addResult(method:string, url:string, status:number, ok:boolean, duration:number, body:string) {
    this.results.update(r => [{method, url, status, ok, duration, body}, ...r].slice(0, 20));
  }

  methodBg(m:string) { return {GET:'#dbeafe',POST:'#dcfce7',DELETE:'#fee2e2',PUT:'#fef3c7'}[m] ?? '#f3f4f6'; }
  methodColor(m:string) { return {GET:'#1e40af',POST:'#15803d',DELETE:'#b91c1c',PUT:'#b45309'}[m] ?? '#374151'; }
}
