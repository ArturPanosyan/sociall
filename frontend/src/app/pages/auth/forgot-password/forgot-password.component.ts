import { Component, signal }     from '@angular/core';
import { CommonModule }          from '@angular/common';
import { ReactiveFormsModule,
         FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient }            from '@angular/common/http';
import { environment }           from '../../../../environments/environment';

// ── Forgot Password Page ──────────────────────────────────────
import { Component as ForgotComp, signal as s1 } from '@angular/core';

@ForgotComp({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <span class="text-3xl">🔑</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Forgot password?</h1>
      <p class="text-gray-500 mt-1">We'll send a reset link to your email</p>
    </div>

    @if (!sent()) {
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input formControlName="email" type="email" placeholder="you@example.com"
                 class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2
                        focus:ring-indigo-500 outline-none transition">
        </div>

        @if (error()) {
          <div class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{{ error() }}</div>
        }

        <button type="submit" [disabled]="loading() || form.invalid"
                class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60
                       text-white font-semibold py-3 rounded-xl transition">
          @if (loading()) { Sending... } @else { Send Reset Link }
        </button>
      </form>
    } @else {
      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
        <p class="text-gray-700">Check your inbox! A reset link has been sent.</p>
        <p class="text-sm text-gray-400">Didn't receive it? Check spam or try again.</p>
      </div>
    }

    <p class="text-center text-sm text-gray-500 mt-6">
      <a routerLink="/login" class="text-indigo-600 font-semibold hover:underline">← Back to Login</a>
    </p>
  </div>
</div>
  `
})
export class ForgotPasswordComponent {
  form    = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading = s1(false);
  error   = s1('');
  sent    = s1(false);

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.http.post(`${environment.apiUrl}/auth/forgot-password`,
      { email: this.form.value.email }).subscribe({
      next:  () => { this.sent.set(true); this.loading.set(false); },
      error: e  => { this.error.set(e.error?.message || 'Something went wrong'); this.loading.set(false); }
    });
  }
}
