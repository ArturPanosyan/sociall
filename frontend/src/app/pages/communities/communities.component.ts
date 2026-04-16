import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../../environments/environment';

@Component({
  selector: 'app-communities', standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div style="max-width:900px;margin:0 auto;padding:20px 16px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
    <div>
      <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">Communities</h1>
      <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Join groups that share your interests</p>
    </div>
    <button (click)="createMode=!createMode"
            style="padding:8px 18px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
      + Create
    </button>
  </div>

  @if (createMode) {
    <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:20px;margin-bottom:20px">
      <h3 style="font-size:15px;font-weight:500;margin-bottom:14px;color:var(--text-primary,#111)">New Community</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        <input [(ngModel)]="newName" placeholder="Community name" [style]="iS">
        <textarea [(ngModel)]="newDesc" placeholder="What is this about?" rows="2" [style]="iS+'resize:none'"></textarea>
        <div style="display:flex;gap:10px">
          <select [(ngModel)]="newPrivate" [style]="iS+'flex:1'">
            <option [ngValue]="false">🌐 Public</option>
            <option [ngValue]="true">🔒 Private</option>
          </select>
          <button (click)="create()" style="flex:1;padding:9px;background:#6366f1;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer">
            Create
          </button>
        </div>
      </div>
    </div>
  }

  <div style="position:relative;margin-bottom:16px">
    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px">🔍</span>
    <input [(ngModel)]="q" (ngModelChange)="load()" placeholder="Search communities..."
           style="width:100%;padding:10px 14px 10px 36px;border:0.5px solid var(--border,#e5e7eb);border-radius:10px;font-size:13px;outline:none;background:var(--bg-primary,#fff);color:var(--text-primary,#111)">
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
    @for (c of communities(); track c.id) {
      <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:14px;overflow:hidden">
        <div style="height:72px;display:flex;align-items:center;justify-content:center;font-size:28px;position:relative"
             [style.background]="gradient(c.name)">
          {{ emoji(c.name) }}
          @if (c.type==='PRIVATE') {
            <span style="position:absolute;top:8px;right:8px;font-size:10px;background:rgba(0,0,0,.4);color:#fff;padding:2px 7px;border-radius:10px">🔒</span>
          }
        </div>
        <div style="padding:14px">
          <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:3px">{{ c.name }}</div>
          <div style="font-size:12px;color:var(--text-secondary,#6b7280);margin-bottom:10px;min-height:32px;
                      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
            {{ c.description || 'No description' }}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:11px;color:var(--text-secondary,#6b7280)">👥 {{ c.membersCount }} members</span>
            <button (click)="join(c)"
                    style="padding:5px 14px;font-size:12px;font-weight:500;border-radius:8px;cursor:pointer"
                    [style.background]="c.joined ? 'var(--bg-secondary,#f9fafb)' : '#6366f1'"
                    [style.color]="c.joined ? 'var(--text-primary,#111)' : '#fff'"
                    [style.border]="c.joined ? '0.5px solid var(--border,#e5e7eb)' : 'none'">
              {{ c.joined ? 'Leave' : 'Join' }}
            </button>
          </div>
        </div>
      </div>
    }
  </div>

  @if (!communities().length && !loading()) {
    <div style="text-align:center;padding:60px 20px">
      <div style="font-size:48px;margin-bottom:12px">🏘️</div>
      <p style="font-size:16px;font-weight:500;color:var(--text-primary,#111)">No communities yet</p>
      <p style="font-size:14px;color:var(--text-secondary,#6b7280)">Create the first one!</p>
    </div>
  }
</div>
  `
})
export class CommunitiesComponent implements OnInit {
  communities = signal<any[]>([]); loading = signal(true);
  createMode = false; q=''; newName=''; newDesc=''; newPrivate: any = false;
  iS = 'width:100%;padding:9px 14px;border:0.5px solid var(--border,#e5e7eb);border-radius:9px;font-size:13px;background:var(--bg-secondary,#f9fafb);color:var(--text-primary,#111);outline:none;box-sizing:border-box;';
  emojis = ['🚀','💻','🎨','📸','🎵','✈️','🍕','🏋️','📚','🎮','🌿','🎬'];
  gradients = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#0ea5e9,#06b6d4)',
    'linear-gradient(135deg,#f43f5e,#ec4899)','linear-gradient(135deg,#f59e0b,#f97316)',
    'linear-gradient(135deg,#10b981,#22c55e)','linear-gradient(135deg,#8b5cf6,#d946ef)'];
  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/communities${this.q ? '?q='+this.q : ''}`).subscribe({
      next: r => { this.communities.set((r.content||[]).map((c:any) => ({...c,joined:false}))); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
  create() {
    if (!this.newName.trim()) return;
    this.http.post<any>(`${environment.apiUrl}/communities`,
      { name:this.newName, description:this.newDesc, isPrivate:!!this.newPrivate }).subscribe({
      next: c => { this.communities.update(l => [{...c,joined:true},...l]); this.createMode=false; this.newName=''; this.newDesc=''; }
    });
  }
  join(c: any) {
    if (c.joined) this.http.delete(`${environment.apiUrl}/communities/${c.slug}/leave`).subscribe();
    else this.http.post(`${environment.apiUrl}/communities/${c.slug}/join`,{}).subscribe();
    this.communities.update(l => l.map(x => x.id===c.id ? {...x,joined:!x.joined,membersCount:x.membersCount+(x.joined?-1:1)} : x));
  }
  emoji(n:string) { return this.emojis[n.charCodeAt(0)%this.emojis.length]; }
  gradient(n:string) { return this.gradients[n.charCodeAt(0)%this.gradients.length]; }
}
