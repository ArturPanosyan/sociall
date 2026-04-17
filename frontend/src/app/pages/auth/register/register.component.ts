import { Component, signal }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { ReactiveFormsModule,
         FormBuilder, Validators,
         AbstractControl }        from '@angular/forms';
import { Router, RouterLink }     from '@angular/router';
import { AuthService }            from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <span class="text-white text-2xl font-bold">S</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Create account</h1>
      <p class="text-gray-500 mt-1">Join SocialNet today</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input formControlName="fullName" type="text" placeholder="John Doe"
                 class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2
                        focus:ring-indigo-500 outline-none transition text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input formControlName="username" type="text" placeholder="johndoe"
                 class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2
                        focus:ring-indigo-500 outline-none transition text-sm"
                 [class.border-red-400]="f['username'].invalid && submitted()">
          @if (f['username'].errors?.['minlength'] && submitted()) {
            <p class="text-red-500 text-xs mt-1">Min 3 characters</p>
          }
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input formControlName="email" type="email" placeholder="you@example.com"
               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2
                      focus:ring-indigo-500 outline-none transition"
               [class.border-red-400]="f['email'].invalid && submitted()">
        @if (f['email'].errors?.['email'] && submitted()) {
          <p class="text-red-500 text-xs mt-1">Invalid email</p>
        }
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input formControlName="password" type="password" placeholder="Min 8 characters"
               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2
                      focus:ring-indigo-500 outline-none transition"
               [class.border-red-400]="f['password'].invalid && submitted()">
        @if (f['password'].errors?.['minlength'] && submitted()) {
          <p class="text-red-500 text-xs mt-1">Min 8 characters</p>
        }
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input formControlName="confirmPassword" type="password" placeholder="Repeat password"
               class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2
                      focus:ring-indigo-500 outline-none transition"
               [class.border-red-400]="form.errors?.['mismatch'] && submitted()">
        @if (form.errors?.['mismatch'] && submitted()) {
          <p class="text-red-500 text-xs mt-1">Passwords don't match</p>
        }
      </div>

      @if (error()) {
        <div class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{{ error() }}</div>
      }

      <button type="submit" [disabled]="loading()"
              class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60
                     text-white font-semibold py-3 rounded-xl transition">
        @if (loading()) {
          <span class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Creating account...
          </span>
        } @else { Create Account }
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-6">
      Already have an account?
      <a routerLink="/login" class="text-indigo-600 font-semibold hover:underline">Sign in</a>
    </p>
  </div>
</div>
  `
})
export class RegisterComponent {
  form = this.fb.group({
    fullName:        [''],
    username:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatch });

  loading   = signal(false);
  error     = signal('');
  submitted = signal(false);

  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  passwordMatch(ctrl: AbstractControl) {
    return ctrl.get('password')?.value === ctrl.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  submit() {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    const { fullName, username, email, password } = this.form.value;

    this.auth.register({ fullName: fullName!, username: username!, email: email!, password: password! })
      .subscribe({
        next:  ()  => this.router.navigate(['/onboarding']),
        error: err => {
          this.error.set(err.error?.message || 'Registration failed');
          this.loading.set(false);
        }
      });
  }
}
