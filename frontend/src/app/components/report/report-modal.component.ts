import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { environment }    from '../../../environments/environment';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (open()) {
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
       (click)="close()">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
         (click)="$event.stopPropagation()">

      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-bold text-gray-900">Report Content</h3>
        <button (click)="close()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
      </div>

      <!-- Reasons -->
      <div class="space-y-2 mb-5">
        @for (r of reasons; track r.value) {
          <label class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50
                        cursor-pointer transition border border-transparent"
                 [class.border-indigo-300]="selected === r.value"
                 [class.bg-indigo-50]="selected === r.value">
            <input type="radio" [(ngModel)]="selected" [value]="r.value"
                   class="text-indigo-600">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ r.label }}</p>
              <p class="text-xs text-gray-400">{{ r.desc }}</p>
            </div>
          </label>
        }
      </div>

      <!-- Details -->
      <textarea [(ngModel)]="details" placeholder="Additional details (optional)"
                rows="3"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                       outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4">
      </textarea>

      @if (submitted()) {
        <div class="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm text-center mb-4">
          ✅ Report submitted. Thank you!
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{{ error() }}</div>
      }

      <div class="flex gap-3">
        <button (click)="close()"
                class="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                       font-medium hover:bg-gray-50 transition">Cancel</button>
        <button (click)="submit()"
                [disabled]="!selected || loading() || submitted()"
                class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40
                       text-white rounded-xl text-sm font-semibold transition">
          {{ loading() ? 'Submitting...' : 'Submit Report' }}
        </button>
      </div>
    </div>
  </div>
}
  `
})
export class ReportModalComponent {
  @Input()  entityType!: string;   // POST | USER | COMMENT
  @Input()  entityId!:   number;
  @Output() closed = new EventEmitter<void>();

  open      = signal(true);
  selected  = '';
  details   = '';
  loading   = signal(false);
  submitted = signal(false);
  error     = signal('');

  reasons = [
    { value: 'SPAM',          label: 'Spam',           desc: 'Unwanted or repetitive content' },
    { value: 'HARASSMENT',    label: 'Harassment',     desc: 'Bullying or targeted abuse' },
    { value: 'HATE_SPEECH',   label: 'Hate Speech',    desc: 'Promotes hatred or discrimination' },
    { value: 'VIOLENCE',      label: 'Violence',       desc: 'Graphic or threatening content' },
    { value: 'NUDITY',        label: 'Nudity',         desc: 'Explicit sexual content' },
    { value: 'MISINFORMATION',label: 'Misinformation', desc: 'False or misleading information' },
    { value: 'COPYRIGHT',     label: 'Copyright',      desc: 'Stolen or copyrighted material' },
    { value: 'OTHER',         label: 'Other',          desc: 'Something not listed above' },
  ];

  constructor(private http: HttpClient) {}

  submit() {
    if (!this.selected) return;
    this.loading.set(true);
    this.http.post(`${environment.apiUrl}/reports`, {
      entityType: this.entityType,
      entityId:   this.entityId,
      reason:     this.selected,
      details:    this.details
    }).subscribe({
      next:  () => { this.submitted.set(true); this.loading.set(false); },
      error: e  => { this.error.set(e.error?.message || 'Report failed'); this.loading.set(false); }
    });
  }

  close() { this.open.set(false); this.closed.emit(); }
}
