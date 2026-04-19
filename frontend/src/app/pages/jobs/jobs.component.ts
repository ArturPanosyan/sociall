import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { HttpClient }   from '@angular/common/http';
import { environment }  from '../../../environments/environment';

@Component({
  selector: 'app-jobs', standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="max-width:900px;margin:0 auto;padding:20px 16px">

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div>
      <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">💼 Jobs</h1>
      <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Find your next opportunity</p>
    </div>
    <button (click)="postMode=!postMode"
            style="padding:9px 20px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
      + Post a Job
    </button>
  </div>

  <!-- Post Job form -->
  @if (postMode) {
    <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:16px;padding:20px;margin-bottom:20px">
      <h3 style="font-size:15px;font-weight:500;margin-bottom:16px;color:var(--text-primary,#111)">Post a Job</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <input [(ngModel)]="f.title"       placeholder="Job title *" [style]="iS" style="grid-column:span 2">
        <input [(ngModel)]="f.company"     placeholder="Company name" [style]="iS">
        <input [(ngModel)]="f.location"    placeholder="📍 Location or Remote" [style]="iS">
        <input [(ngModel)]="f.salary"      placeholder="💰 Salary range" [style]="iS">
        <select [(ngModel)]="f.jobType"    [style]="iS">
          @for (t of jobTypes; track t.id) { <option [value]="t.id">{{ t.label }}</option> }
        </select>
        <input [(ngModel)]="f.category"    placeholder="Category (Tech, Design...)" [style]="iS">
        <input [(ngModel)]="f.applyUrl"    placeholder="🔗 Apply URL" [style]="iS">
        <textarea [(ngModel)]="f.description" placeholder="Job description..." rows="3"
                  [style]="iS+'resize:none'" style="grid-column:span 2"></textarea>
        <div style="grid-column:span 2;display:flex;gap:10px">
          <button (click)="postMode=false" style="flex:1;padding:10px;border:0.5px solid var(--border,#e5e7eb);background:none;border-radius:10px;font-size:13px;cursor:pointer;color:var(--text-secondary,#6b7280)">Cancel</button>
          <button (click)="postJob()" [disabled]="!f.title||submitting()"
                  style="flex:2;padding:10px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
            {{ submitting() ? 'Posting...' : 'Post Job' }}
          </button>
        </div>
      </div>
    </div>
  }

  <!-- Filters -->
  <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <div style="position:relative;flex:1;min-width:200px">
      <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px">🔍</span>
      <input [(ngModel)]="q" (ngModelChange)="load()" placeholder="Search jobs, companies..."
             style="width:100%;padding:10px 14px 10px 36px;border:0.5px solid var(--border,#e5e7eb);border-radius:10px;font-size:13px;outline:none;background:var(--bg-primary,#fff);color:var(--text-primary,#111);box-sizing:border-box">
    </div>
    <div style="display:flex;gap:6px;overflow-x:auto">
      <button (click)="filterType='';load()" style="padding:8px 14px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap"
              [style.background]="!filterType?'#6366f1':'var(--bg-primary,#fff)'"
              [style.color]="!filterType?'#fff':'var(--text-primary,#111)'"
              [style.border]="!filterType?'none':'0.5px solid var(--border,#e5e7eb)'">All</button>
      @for (t of jobTypes; track t.id) {
        <button (click)="filterType=t.id;load()" style="padding:8px 14px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap"
                [style.background]="filterType===t.id?'#6366f1':'var(--bg-primary,#fff)'"
                [style.color]="filterType===t.id?'#fff':'var(--text-primary,#111)'"
                [style.border]="filterType===t.id?'none':'0.5px solid var(--border,#e5e7eb)'">
          {{ t.label }}
        </button>
      }
    </div>
  </div>

  <!-- Jobs list -->
  @if (loading()) {
    @for (i of [1,2,3,4]; track i) {
      <div style="height:130px;border-radius:14px;background:var(--bg-secondary,#f9fafb);margin-bottom:10px;animation:pulse 1.5s infinite"></div>
    }
  } @else {
    <div style="display:flex;flex-direction:column;gap:10px">
      @for (job of jobs(); track job.id) {
        <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);border-radius:14px;padding:18px;transition:transform .12s" class="job-card">
          <div style="display:flex;align-items:flex-start;gap:14px">

            <!-- Company logo -->
            <div style="width:48px;height:48px;border-radius:10px;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;
                        font-size:20px;font-weight:500;color:#fff"
                 [style.background]="companyColor(job.company)">
              {{ job.company ? job.company.charAt(0).toUpperCase() : '🏢' }}
            </div>

            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap">
                <div>
                  <div style="font-size:16px;font-weight:500;color:var(--text-primary,#111);margin-bottom:3px">{{ job.title }}</div>
                  <div style="font-size:13px;color:var(--text-secondary,#6b7280);margin-bottom:6px">
                    {{ job.company }} {{ job.location ? '· 📍 '+job.location : '' }}
                  </div>
                </div>
                @if (job.applyUrl) {
                  <a [href]="job.applyUrl" target="_blank"
                     style="flex-shrink:0;padding:8px 18px;background:#6366f1;color:#fff;
                            border-radius:9px;font-size:13px;font-weight:500;text-decoration:none">
                    Apply →
                  </a>
                }
              </div>

              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
                <span style="padding:4px 10px;background:#e0e7ff;color:#4338ca;border-radius:20px;font-size:11px;font-weight:500">
                  {{ jobTypeLabel(job.jobType) }}
                </span>
                @if (job.category) {
                  <span style="padding:4px 10px;background:var(--bg-secondary,#f9fafb);color:var(--text-secondary,#6b7280);border-radius:20px;font-size:11px;border:0.5px solid var(--border,#e5e7eb)">
                    {{ job.category }}
                  </span>
                }
                @if (job.salary) {
                  <span style="padding:4px 10px;background:#dcfce7;color:#15803d;border-radius:20px;font-size:11px;font-weight:500">
                    💰 {{ job.salary }}
                  </span>
                }
              </div>

              @if (job.description) {
                <p style="font-size:13px;color:var(--text-secondary,#6b7280);line-height:1.5;
                           display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                  {{ job.description }}
                </p>
              }

              <div style="margin-top:8px;font-size:11px;color:var(--text-muted,#9ca3af)">
                Posted by &#64;{{ job.posterUsername }} · {{ timeAgo(job.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      }

      @if (!jobs().length) {
        <div style="text-align:center;padding:60px 20px">
          <div style="font-size:52px;margin-bottom:14px">💼</div>
          <p style="font-size:16px;font-weight:500;color:var(--text-primary,#111)">No jobs found</p>
          <p style="font-size:14px;color:var(--text-secondary,#6b7280);margin-top:4px">Try different keywords or post one!</p>
        </div>
      }
    </div>
  }
</div>
<style>
.job-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.06); }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
</style>
  `
})
export class JobsComponent implements OnInit {
  jobs      = signal<any[]>([]);
  loading   = signal(true);
  submitting = signal(false);
  postMode  = false;
  q = ''; filterType = '';
  f = { title:'', description:'', company:'', location:'', salary:'', jobType:'FULL_TIME', category:'', applyUrl:'' };
  iS = 'width:100%;padding:9px 14px;border:0.5px solid var(--border,#e5e7eb);border-radius:9px;font-size:13px;background:var(--bg-secondary,#f9fafb);color:var(--text-primary,#111);outline:none;box-sizing:border-box;';
  jobTypes = [
    {id:'FULL_TIME',label:'Full-time'},{id:'PART_TIME',label:'Part-time'},
    {id:'REMOTE',label:'Remote'},{id:'FREELANCE',label:'Freelance'}
  ];
  colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9'];

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const p = this.q ? `?q=${encodeURIComponent(this.q)}` : this.filterType ? `?type=${this.filterType}` : '';
    this.http.get<any>(`${environment.apiUrl}/jobs${p}`).subscribe({
      next: r => { this.jobs.set(r.content||[]); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  postJob() {
    if (!this.f.title) return;
    this.submitting.set(true);
    this.http.post<any>(`${environment.apiUrl}/jobs`, this.f).subscribe({
      next: j => {
        this.jobs.update(l => [j,...l]);
        this.postMode = false;
        this.f = {title:'',description:'',company:'',location:'',salary:'',jobType:'FULL_TIME',category:'',applyUrl:''};
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }

  companyColor(c: string) { return this.colors[(c||'?').charCodeAt(0)%this.colors.length]; }
  jobTypeLabel(t: string) { return this.jobTypes.find(x=>x.id===t)?.label || t; }
  timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff/86400000);
    if (days < 1) return 'today'; if (days < 7) return `${days}d ago`;
    return `${Math.floor(days/7)}w ago`;
  }
}
