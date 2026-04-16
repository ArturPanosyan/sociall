import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { HttpClient }   from '@angular/common/http';
import { environment }  from '../../../environments/environment';

@Component({
  selector: 'app-events', standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="max-width:900px;margin:0 auto;padding:20px 16px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div>
      <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">Events</h1>
      <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Discover upcoming events</p>
    </div>
    <button (click)="createMode=!createMode"
            style="padding:8px 18px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
      + Create Event
    </button>
  </div>

  @if (createMode) {
    <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:20px;margin-bottom:20px">
      <h3 style="font-size:15px;font-weight:500;margin-bottom:14px;color:var(--text-primary,#111)">New Event</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <input [(ngModel)]="ev.title" placeholder="Event title" [style]="iS" style="grid-column:span 2">
        <textarea [(ngModel)]="ev.description" placeholder="Description" rows="2" [style]="iS+'resize:none'" style="grid-column:span 2"></textarea>
        <input [(ngModel)]="ev.location" placeholder="📍 Location" [style]="iS">
        <select [(ngModel)]="ev.type" [style]="iS">
          <option value="PUBLIC">🌐 Public</option>
          <option value="ONLINE">💻 Online</option>
          <option value="PRIVATE">🔒 Private</option>
        </select>
        <div>
          <label style="font-size:11px;color:var(--text-secondary,#6b7280);display:block;margin-bottom:4px">Start</label>
          <input [(ngModel)]="ev.startAt" type="datetime-local" [style]="iS">
        </div>
        <div>
          <label style="font-size:11px;color:var(--text-secondary,#6b7280);display:block;margin-bottom:4px">End</label>
          <input [(ngModel)]="ev.endAt" type="datetime-local" [style]="iS">
        </div>
        <button (click)="createMode=false" style="padding:9px;border:0.5px solid var(--border,#e5e7eb);background:none;border-radius:9px;font-size:13px;cursor:pointer;color:var(--text-secondary,#6b7280)">Cancel</button>
        <button (click)="create()" style="padding:9px;background:#6366f1;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer">Create</button>
      </div>
    </div>
  }

  <div style="display:flex;flex-direction:column;gap:12px">
    @for (e of events(); track e.id) {
      <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:14px;overflow:hidden;display:flex">
        <div style="width:72px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:12px;text-align:center"
             [style.background]="e.type==='ONLINE'?'linear-gradient(135deg,#10b981,#059669)':'linear-gradient(135deg,#6366f1,#8b5cf6)'">
          <div style="font-size:10px;text-transform:uppercase;opacity:.8;letter-spacing:.5px">{{ month(e.startAt) }}</div>
          <div style="font-size:26px;font-weight:500;line-height:1.1">{{ day(e.startAt) }}</div>
        </div>
        <div style="flex:1;padding:14px 16px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
            <div style="flex:1">
              <div style="font-size:15px;font-weight:500;color:var(--text-primary,#111);margin-bottom:4px">{{ e.title }}</div>
              @if (e.description) {
                <p style="font-size:13px;color:var(--text-secondary,#6b7280);line-height:1.4;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{{ e.description }}</p>
              }
              <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--text-muted,#9ca3af)">
                @if (e.location) { <span>📍 {{ e.location }}</span> }
                <span>🕐 {{ time(e.startAt) }}</span>
                <span>👥 {{ e.attendeesCount }} going</span>
                <span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:500"
                      [style.background]="e.type==='ONLINE'?'#dcfce7':e.type==='PRIVATE'?'#fee2e2':'#e0e7ff'"
                      [style.color]="e.type==='ONLINE'?'#15803d':e.type==='PRIVATE'?'#b91c1c':'#4338ca'">
                  {{ e.type==='ONLINE'?'💻 Online':e.type==='PRIVATE'?'🔒 Private':'🌐 Public' }}
                </span>
              </div>
            </div>
            <button (click)="rsvp(e)"
                    style="flex-shrink:0;padding:7px 16px;font-size:13px;font-weight:500;border-radius:8px;cursor:pointer;white-space:nowrap"
                    [style.background]="e.going?'#dcfce7':'#6366f1'"
                    [style.color]="e.going?'#15803d':'#fff'"
                    [style.border]="e.going?'0.5px solid #16a34a':'none'">
              {{ e.going ? '✓ Going' : 'RSVP' }}
            </button>
          </div>
        </div>
      </div>
    }
    @if (!events().length && !loading()) {
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:48px;margin-bottom:12px">📅</div>
        <p style="font-size:16px;font-weight:500;color:var(--text-primary,#111)">No upcoming events</p>
        <p style="font-size:14px;color:var(--text-secondary,#6b7280)">Create the first one!</p>
      </div>
    }
  </div>
</div>
  `
})
export class EventsComponent implements OnInit {
  events  = signal<any[]>([]); loading = signal(true); createMode = false;
  ev = { title:'', description:'', location:'', type:'PUBLIC', startAt:'', endAt:'' };
  iS = 'width:100%;padding:9px 14px;border:0.5px solid var(--border,#e5e7eb);border-radius:9px;font-size:13px;background:var(--bg-secondary,#f9fafb);color:var(--text-primary,#111);outline:none;box-sizing:border-box;';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/events`).subscribe({
      next: r => { this.events.set((r.content||[]).map((e:any) => ({...e,going:false}))); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
  create() {
    if (!this.ev.title) return;
    this.http.post<any>(`${environment.apiUrl}/events`, this.ev).subscribe({
      next: e => { this.events.update(l => [{...e,going:true},...l]); this.createMode=false; this.ev={title:'',description:'',location:'',type:'PUBLIC',startAt:'',endAt:''}; }
    });
  }
  rsvp(e: any) {
    this.http.post(`${environment.apiUrl}/events/${e.id}/rsvp`,{}).subscribe();
    this.events.update(l => l.map(x => x.id===e.id ? {...x,going:!x.going,attendeesCount:x.attendeesCount+(x.going?-1:1)} : x));
  }
  month(d:string) { return d ? new Date(d).toLocaleDateString('en',{month:'short'}) : ''; }
  day(d:string)   { return d ? new Date(d).getDate() : ''; }
  time(d:string)  { return d ? new Date(d).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) : ''; }
}
