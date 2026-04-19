import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { HttpClient }   from '@angular/common/http';
import { AuthService }  from '../../services/auth.service';
import { environment }  from '../../../environments/environment';

@Component({
  selector: 'app-mentor', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div style="max-width:900px;margin:0 auto;padding:20px 16px">

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div>
      <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">🎓 Mentorship</h1>
      <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Learn from experienced professionals</p>
    </div>
    <button (click)="tab='offer'" style="padding:8px 18px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
      Offer Mentorship
    </button>
  </div>

  <!-- Tabs -->
  <div style="display:flex;border-bottom:0.5px solid var(--border,#e5e7eb);margin-bottom:20px">
    @for (t of tabs; track t.id) {
      <button (click)="tab=t.id"
              style="padding:10px 20px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:500;border-bottom:2px solid transparent;transition:all .15s"
              [style.borderBottomColor]="tab===t.id?'#6366f1':'transparent'"
              [style.color]="tab===t.id?'#6366f1':'var(--text-secondary,#6b7280)'">
        {{ t.label }}
      </button>
    }
  </div>

  <!-- Find mentors -->
  @if (tab === 'find') {
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
      @for (m of mentors; track m.name) {
        <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:20px">
          <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px">
            <div style="width:52px;height:52px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:500"
                 [style.background]="m.color">
              {{ m.name.charAt(0) }}
            </div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111)">{{ m.name }}</div>
              <div style="font-size:12px;color:var(--text-secondary,#6b7280)">{{ m.role }}</div>
              <div style="display:flex;align-items:center;gap:4px;margin-top:3px">
                <span style="color:#f59e0b;font-size:12px">★★★★★</span>
                <span style="font-size:11px;color:var(--text-secondary,#6b7280)">({{ m.reviews }})</span>
              </div>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">
            @for (skill of m.skills; track skill) {
              <span style="font-size:10px;padding:3px 8px;background:#e0e7ff;color:#4338ca;border-radius:10px">{{ skill }}</span>
            }
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <span style="font-size:13px;font-weight:600;color:#6366f1">{{ m.price }}</span>
            <span style="font-size:11px;color:var(--text-secondary,#6b7280)">{{ m.duration }} session</span>
          </div>
          <button (click)="bookSession(m)"
                  style="width:100%;padding:9px;background:#6366f1;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer">
            Book Session
          </button>
        </div>
      }
    </div>
  }

  <!-- Book form -->
  @if (tab === 'offer' || (tab === 'find' && bookingMentor)) {
    <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:20px;margin-bottom:20px">
      <h3 style="font-size:15px;font-weight:500;margin-bottom:14px;color:var(--text-primary,#111)">
        {{ tab === 'offer' ? 'Offer Your Mentorship' : 'Book Session with ' + bookingMentor?.name }}
      </h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        <input [(ngModel)]="form.topic" placeholder="Session topic" [style]="iS">
        <textarea [(ngModel)]="form.description" placeholder="What do you want to learn/teach?" rows="3" [style]="iS+'resize:none'"></textarea>
        <div style="display:flex;gap:10px">
          <input [(ngModel)]="form.price" placeholder="Price (e.g. Free, $50/hr)" [style]="iS">
          <select [(ngModel)]="form.durationMin" [style]="iS">
            <option value="30">30 min</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        <div style="display:flex;gap:10px">
          <button (click)="tab='find';bookingMentor=null"
                  style="flex:1;padding:10px;border:0.5px solid var(--border,#e5e7eb);background:none;border-radius:10px;font-size:13px;cursor:pointer;color:var(--text-secondary,#6b7280)">
            Cancel
          </button>
          <button (click)="submitBooking()"
                  style="flex:2;padding:10px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
            {{ tab === 'offer' ? 'Post Offer' : 'Request Session' }}
          </button>
        </div>
      </div>
    </div>
  }

  <!-- My sessions -->
  @if (tab === 'my') {
    @if (!mySessions.length) {
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:52px;margin-bottom:14px">🎓</div>
        <p style="font-size:16px;font-weight:500;color:var(--text-primary,#111)">No sessions yet</p>
        <button (click)="tab='find'" style="margin-top:14px;padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer">
          Find a Mentor
        </button>
      </div>
    } @else {
      <div style="display:flex;flex-direction:column;gap:10px">
        @for (s of mySessions; track s.id) {
          <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:14px;padding:16px">
            <div style="font-size:15px;font-weight:500;color:var(--text-primary,#111);margin-bottom:4px">{{ s.topic }}</div>
            <div style="font-size:13px;color:var(--text-secondary,#6b7280)">with &#64;{{ s.mentorUsername }}</div>
            <div style="display:flex;gap:10px;margin-top:8px;font-size:12px;color:var(--text-muted,#9ca3af)">
              <span>⏱ {{ s.durationMin }} min</span>
              <span>💰 {{ s.price }}</span>
              <span style="padding:2px 8px;border-radius:10px;font-size:11px"
                    [style.background]="s.status==='CONFIRMED'?'#dcfce7':'#fef3c7'"
                    [style.color]="s.status==='CONFIRMED'?'#15803d':'#b45309'">
                {{ s.status }}
              </span>
            </div>
          </div>
        }
      </div>
    }
  }
</div>
  `
})
export class MentorComponent implements OnInit {
  tab          = 'find';
  bookingMentor: any = null;
  mySessions: any[] = [];
  form = { topic:'', description:'', price:'Free', durationMin:'60' };
  iS = 'width:100%;padding:9px 14px;border:0.5px solid var(--border,#e5e7eb);border-radius:9px;font-size:13px;background:var(--bg-secondary,#f9fafb);color:var(--text-primary,#111);outline:none;box-sizing:border-box;';

  tabs = [
    { id:'find', label:'Find Mentors' },
    { id:'my',   label:'My Sessions' },
  ];

  mentors = [
    { name:'Sarah Chen',  role:'Senior Frontend Dev @ Google',   skills:['Angular','React','TypeScript'],  price:'$80/hr',  duration:'1h', reviews:47,  color:'#6366f1' },
    { name:'Mike Ross',   role:'Backend Architect @ Amazon',      skills:['Java','Spring','AWS'],           price:'$100/hr', duration:'1h', reviews:32,  color:'#10b981' },
    { name:'Lisa Park',   role:'UX Lead @ Spotify',               skills:['Figma','Design Systems','UX'],   price:'Free',    duration:'45min',reviews:28, color:'#f59e0b' },
    { name:'Alex Kumar',  role:'Full Stack @ Stripe',             skills:['Node.js','React','PostgreSQL'],  price:'$60/hr',  duration:'1h', reviews:19,  color:'#ef4444' },
    { name:'Emma Wilson', role:'AI Engineer @ OpenAI',            skills:['Python','ML','LLMs'],            price:'$120/hr', duration:'1h', reviews:55,  color:'#8b5cf6' },
    { name:'David Lee',   role:'DevOps @ Netflix',                skills:['Docker','K8s','CI/CD'],          price:'$90/hr',  duration:'1h', reviews:41,  color:'#0ea5e9' },
  ];

  constructor(private http: HttpClient, public auth: AuthService) {}
  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/mentor/my`).subscribe({
      next: r => this.mySessions = [...(r.asMentee?.content||[]), ...(r.asMentor?.content||[])],
      error: () => {}
    });
  }

  bookSession(m: any) { this.bookingMentor = m; this.form.topic = `Session with ${m.name}`; }

  submitBooking() {
    const mentorUsername = this.bookingMentor ? 'alice' : this.auth.currentUser()?.username || 'admin';
    this.http.post<any>(`${environment.apiUrl}/mentor/book`, {
      mentorUsername, ...this.form
    }).subscribe({
      next: s => { this.mySessions = [s, ...this.mySessions]; this.tab = 'my'; this.bookingMentor = null; },
      error: () => { this.tab = 'my'; this.bookingMentor = null; }
    });
  }
}
