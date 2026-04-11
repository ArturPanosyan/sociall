import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../../environments/environment';

interface PollOption { id: number; text: string; votes: number; pct: number; }
interface PollData {
  id: number; question: string; options: PollOption[];
  totalVotes: number; votedOptionId: number | null; endsAt: string; ended: boolean;
}

@Component({
  selector: 'app-poll', standalone: true, imports: [CommonModule],
  template: `
@if (poll()) {
  <div class="mt-3 border rounded-xl overflow-hidden" style="border-color:var(--border)">
    <div class="px-4 pt-3 pb-2" style="background:var(--bg-secondary)">
      <div class="flex items-center gap-2 mb-1">
        <span style="font-size:14px">📊</span>
        <span style="font-size:13px;font-weight:500;color:var(--text-primary)">{{ poll()!.question }}</span>
      </div>
      <span style="font-size:11px;color:var(--text-muted)">{{ poll()!.totalVotes }} votes</span>
      @if (poll()!.ended) { <span style="font-size:11px;color:#ef4444;margin-left:6px">· Ended</span> }
    </div>
    <div class="p-3" style="background:var(--bg-primary)">
      @for (opt of poll()!.options; track opt.id) {
        <div class="poll-option"
             [class.voted]="poll()!.votedOptionId !== null || poll()!.ended"
             [class.winner]="(poll()!.votedOptionId !== null) && opt.id === bestId()"
             (click)="vote(opt.id)">
          @if (poll()!.votedOptionId !== null || poll()!.ended) {
            <div class="poll-bar" [style.width]="opt.pct + '%'"></div>
          }
          <div class="poll-content">
            <span style="font-size:13px;color:var(--text-primary)">{{ opt.text }}</span>
            @if (poll()!.votedOptionId === opt.id) { <span>✓</span> }
            @if (poll()!.votedOptionId !== null || poll()!.ended) {
              <span class="poll-pct">{{ opt.pct }}%</span>
            }
          </div>
        </div>
      }
    </div>
  </div>
}
`
})
export class PollComponent implements OnInit {
  @Input() postId!: number;
  poll = signal<PollData | null>(null);
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<PollData>(`${environment.apiUrl}/polls/post/${this.postId}`).subscribe({
      next: p => this.poll.set(p), error: () => {}
    });
  }
  vote(optionId: number) {
    const p = this.poll();
    if (!p || p.votedOptionId !== null || p.ended) return;
    this.http.post<PollData>(`${environment.apiUrl}/polls/${p.id}/vote/${optionId}`, {}).subscribe({
      next: u => this.poll.set(u)
    });
  }
  bestId(): number {
    const p = this.poll();
    if (!p?.options.length) return 0;
    return [...p.options].sort((a,b) => b.votes - a.votes)[0].id;
  }
}
