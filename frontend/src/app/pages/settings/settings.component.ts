import { Component, signal }       from '@angular/core';
import { CommonModule }            from '@angular/common';
import { FormsModule,
         ReactiveFormsModule,
         FormBuilder, Validators } from '@angular/forms';
import { UserService }             from '../../services/user.service';
import { AuthService }             from '../../services/auth.service';
import { HttpClient }              from '@angular/common/http';
import { environment }             from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<div class="max-w-2xl mx-auto px-4 py-6">
  <h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

  <!-- Tabs -->
  <div class="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
    @for (tab of tabs; track tab) {
      <button (click)="activeTab.set(tab)"
              class="flex-1 py-2 text-sm font-medium rounded-lg transition"
              [class.bg-white]="activeTab() === tab"
              [class.shadow-sm]="activeTab() === tab"
              [class.text-gray-900]="activeTab() === tab"
              [class.text-gray-500]="activeTab() !== tab">
        {{ tab }}
      </button>
    }
  </div>

  <!-- ── Profile Tab ────────────────────────────────────────── -->
  @if (activeTab() === 'Profile') {
    <div class="bg-white rounded-2xl shadow-sm p-6 space-y-5">

      <!-- Avatar upload -->
      <div class="flex items-center gap-4">
        <img [src]="auth.currentUser()?.avatarUrl || '/assets/default-avatar.png'"
             class="w-20 h-20 rounded-2xl object-cover">
        <div>
          <label class="cursor-pointer bg-indigo-50 text-indigo-600 hover:bg-indigo-100
                        px-4 py-2 rounded-xl text-sm font-medium transition">
            <input type="file" accept="image/*" class="hidden" (change)="uploadAvatar($event)">
            Change Photo
          </label>
          <p class="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
        </div>
      </div>

      <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input formControlName="fullName" type="text"
                   class="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                          focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input formControlName="location" type="text"
                   class="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                          focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea formControlName="bio" rows="3"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                    placeholder="Tell something about yourself..."></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input formControlName="website" type="url"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                 placeholder="https://yourwebsite.com">
        </div>

        @if (saved()) {
          <div class="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm">
            ✅ Profile saved!
          </div>
        }

        <button type="submit" [disabled]="saving()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5
                       rounded-xl text-sm font-semibold transition disabled:opacity-60">
          {{ saving() ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  }

  <!-- ── Privacy Tab ────────────────────────────────────────── -->
  @if (activeTab() === 'Privacy') {
    <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">

      @for (setting of privacySettings; track setting.key) {
        <div class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div>
            <p class="font-medium text-gray-900 text-sm">{{ setting.label }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ setting.description }}</p>
          </div>
          <button (click)="setting.value = !setting.value"
                  class="relative inline-flex w-12 h-6 rounded-full transition-colors duration-200"
                  [class.bg-indigo-600]="setting.value"
                  [class.bg-gray-200]="!setting.value">
            <span class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                  [class.left-7]="setting.value"
                  [class.left-1]="!setting.value"></span>
          </button>
        </div>
      }

      <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5
                     rounded-xl text-sm font-semibold transition mt-2">
        Save Privacy Settings
      </button>
    </div>
  }

  <!-- ── Security Tab ───────────────────────────────────────── -->
  @if (activeTab() === 'Security') {
    <div class="bg-white rounded-2xl shadow-sm p-6 space-y-5">
      <h3 class="font-semibold text-gray-900">Change Password</h3>

      <form [formGroup]="pwdForm" (ngSubmit)="changePassword()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input formControlName="oldPassword" type="password"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input formControlName="newPassword" type="password"
                 class="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                        focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
        </div>
        <button type="submit" [disabled]="pwdForm.invalid"
                class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white
                       px-6 py-2.5 rounded-xl text-sm font-semibold transition">
          Update Password
        </button>
      </form>

      <div class="border-t border-gray-100 pt-5">
        <h3 class="font-semibold text-gray-900 mb-3">Two-Factor Authentication</h3>
        <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4">
          <div>
            <p class="text-sm font-medium text-gray-700">Authenticator App</p>
            <p class="text-xs text-gray-400">Add an extra layer of security</p>
          </div>
          <button class="px-4 py-2 border-2 border-indigo-600 text-indigo-600
                         rounded-xl text-sm font-medium hover:bg-indigo-50 transition">
            Enable 2FA
          </button>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-5">
        <h3 class="font-semibold text-red-500 mb-3">Danger Zone</h3>
        <button class="px-4 py-2.5 border-2 border-red-200 text-red-500 hover:bg-red-50
                       rounded-xl text-sm font-medium transition">
          Delete Account
        </button>
      </div>
    </div>
  }
</div>
  `
})
export class SettingsComponent {
  activeTab = signal<'Profile' | 'Privacy' | 'Security'>('Profile');
  tabs      = ['Profile', 'Privacy', 'Security'] as const;
  saving    = signal(false);
  saved     = signal(false);

  profileForm = this.fb.group({
    fullName: [this.auth.currentUser()?.fullName || ''],
    bio:      [''],
    website:  [''],
    location: ['']
  });

  pwdForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  privacySettings = [
    { key: 'isPrivate',        label: 'Private Account',      description: 'Only followers can see your posts', value: false },
    { key: 'showEmail',        label: 'Show Email',           description: 'Display email on your profile',     value: false },
    { key: 'allowMessages',    label: 'Allow Messages',       description: 'Anyone can send you messages',      value: true  },
    { key: 'showOnlineStatus', label: 'Show Online Status',   description: 'Let others see when you\'re online', value: true },
  ];

  constructor(
    private fb:      FormBuilder,
    public  auth:    AuthService,
    private userSvc: UserService,
    private http:    HttpClient
  ) {}

  saveProfile() {
    this.saving.set(true);
    this.userSvc.updateProfile(this.profileForm.value as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => this.saving.set(false)
    });
  }

  uploadAvatar(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.userSvc.uploadAvatar(file).subscribe();
  }

  changePassword() {
    if (this.pwdForm.invalid) return;
    const { oldPassword, newPassword } = this.pwdForm.value;
    this.http.post(`${environment.apiUrl}/users/me/password`,
      { oldPassword, newPassword }).subscribe({
      next:  () => { this.pwdForm.reset(); alert('Password updated!'); },
      error: err => alert(err.error?.message || 'Failed to update password')
    });
  }
}
