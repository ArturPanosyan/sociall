import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { ReactiveFormsModule,
         FormBuilder, Validators }   from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient }                from '@angular/common/http';
import { environment }               from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <span class="text-3xl">🔒</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Set new password</h1>
    </div>

    @if (!done()) {
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input formControlName="password" type="password" placeholder="Min 8 characters"
                 class="w-full px-4 py-3 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-indigo-500 outline-none transition">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input formControlName="confirm" type="password" placeholder="Repeat password"
                 class="w-full px-4 py-3 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-indigo-500 outline-none transition">
          @if (form.errors?.['mismatch'] && form.get('confirm')?.dirty) {
            <p class="text-red-500 text-xs mt-1">Passwords don't match</p>
          }
        </div>

        @if (error()) {
          <div class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{{ error() }}</div>
        }

        <button type="submit" [disabled]="loading() || form.invalid"
                class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60
                       text-white font-semibold py-3 rounded-xl transition">
          @if (loading()) { Updating... } @else { Update Password }
        </button>
      </form>
    } @else {
      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
        <p class="text-gray-700 font-medium">Password updated successfully!</p>
        <a routerLink="/login"
           class="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition">
          Sign In
        </a>
      </div>
    }
  </div>
</div>
  `
})
export class ResetPasswordComponent implements OnInit {
  form    = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm:  ['', Validators.required]
  }, { validators: c => c.get('password')?.value === c.get('confirm')?.value ? null : { mismatch: true } });

  loading = signal(false);
  error   = signal('');
  done    = signal(false);
  token   = '';

  constructor(
    private fb:    FormBuilder,
    private route: ActivatedRoute,
    private http:  HttpClient
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) this.error.set('Invalid reset link');
  }

  submit() {
    if (this.form.invalid || !this.token) return;
    this.loading.set(true);
    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      newPassword: this.form.value.password
    }).subscribe({
      next:  () => { this.done.set(true); this.loading.set(false); },
      error: e  => { this.error.set(e.error?.message || 'Reset failed'); this.loading.set(false); }
    });
  }
}
