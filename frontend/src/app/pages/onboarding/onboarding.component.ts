import { Component, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Router }            from '@angular/router';
import { HttpClient }        from '@angular/common/http';
import { AuthService }       from '../../services/auth.service';
import { environment }       from '../../../environments/environment';

interface Interest { id: string; icon: string; label: string; selected: boolean; }
interface SuggestedUser { username: string; fullName: string; avatarUrl: string; followed: boolean; }

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="min-height:100vh;background:var(--color-background-secondary);
            display:flex;align-items:center;justify-content:center;padding:20px">
  <div style="width:100%;max-width:560px">

    <!-- Progress dots -->
    <div style="display:flex;justify-content:center;gap:8px;margin-bottom:32px">
      @for (i of [1,2,3]; track i) {
        <div style="height:4px;border-radius:10px;transition:all .3s"
             [style.width]="step() === i ? '32px' : '8px'"
             [style.background]="step() >= i ? '#6366f1' : 'var(--color-border-tertiary)'">
        </div>
      }
    </div>

    <div style="background:var(--color-background-primary);border-radius:24px;
                border:0.5px solid var(--color-border-tertiary);overflow:hidden">

      <!-- Step 1: Welcome + interests -->
      @if (step() === 1) {
        <div style="padding:32px">
          <div style="text-align:center;margin-bottom:28px">
            <div style="width:72px;height:72px;background:#6366f1;border-radius:20px;
                        display:flex;align-items:center;justify-content:center;
                        font-size:32px;margin:0 auto 16px">🌐</div>
            <h1 style="font-size:24px;font-weight:500;color:var(--color-text-primary)">
              Welcome to SocialNet!
            </h1>
            <p style="font-size:15px;color:var(--color-text-secondary);margin-top:6px">
              Let's personalise your experience. Pick your interests:
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px">
            @for (int of interests; track int.id) {
              <button (click)="int.selected = !int.selected"
                      style="padding:14px 10px;border-radius:14px;border:2px solid;
                             cursor:pointer;transition:all .15s;text-align:center"
                      [style.border-color]="int.selected ? '#6366f1' : 'var(--color-border-tertiary)'"
                      [style.background]="int.selected ? '#e0e7ff' : 'var(--color-background-primary)'">
                <div style="font-size:26px;margin-bottom:6px">{{ int.icon }}</div>
                <div style="font-size:12px;font-weight:500"
                     [style.color]="int.selected ? '#4338ca' : 'var(--color-text-primary)'">
                  {{ int.label }}
                </div>
              </button>
            }
          </div>

          <button (click)="step.set(2)"
                  style="width:100%;padding:14px;background:#6366f1;color:#fff;
                         border:none;border-radius:12px;font-size:15px;font-weight:500;cursor:pointer">
            Continue →
          </button>
          <button (click)="skip()"
                  style="width:100%;padding:10px;background:none;border:none;
                         color:var(--color-text-secondary);font-size:13px;cursor:pointer;margin-top:8px">
            Skip for now
          </button>
        </div>
      }

      <!-- Step 2: Follow suggested users -->
      @if (step() === 2) {
        <div style="padding:32px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:40px;margin-bottom:12px">👥</div>
            <h2 style="font-size:22px;font-weight:500;color:var(--color-text-primary)">
              Follow some people
            </h2>
            <p style="font-size:14px;color:var(--color-text-secondary);margin-top:6px">
              See their posts in your feed
            </p>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">
            @for (u of suggestedUsers; track u.username) {
              <div style="display:flex;align-items:center;gap:12px;padding:12px;
                          background:var(--color-background-secondary);border-radius:12px">
                <div style="width:44px;height:44px;border-radius:50%;background:#6366f1;
                             display:flex;align-items:center;justify-content:center;
                             color:#fff;font-weight:500;font-size:16px;flex-shrink:0">
                  {{ u.username.charAt(0).toUpperCase() }}
                </div>
                <div style="flex:1">
                  <div style="font-size:14px;font-weight:500;color:var(--color-text-primary)">
                    {{ u.fullName || u.username }}
                  </div>
                  <div style="font-size:12px;color:var(--color-text-secondary)">&#64;{{ u.username }}</div>
                </div>
                <button (click)="toggleSuggestedFollow(u)"
                        style="padding:6px 16px;border-radius:8px;font-size:13px;
                               font-weight:500;cursor:pointer;transition:all .15s;border:1.5px solid"
                        [style.background]="u.followed ? 'var(--color-background-primary)' : '#6366f1'"
                        [style.color]="u.followed ? 'var(--color-text-primary)' : '#fff'"
                        [style.border-color]="u.followed ? 'var(--color-border-secondary)' : '#6366f1'">
                  {{ u.followed ? 'Following ✓' : 'Follow' }}
                </button>
              </div>
            }
          </div>

          <button (click)="step.set(3)"
                  style="width:100%;padding:14px;background:#6366f1;color:#fff;
                         border:none;border-radius:12px;font-size:15px;font-weight:500;cursor:pointer">
            Continue →
          </button>
          <button (click)="step.set(3)"
                  style="width:100%;padding:10px;background:none;border:none;
                         color:var(--color-text-secondary);font-size:13px;cursor:pointer;margin-top:8px">
            Skip
          </button>
        </div>
      }

      <!-- Step 3: Upload avatar + bio -->
      @if (step() === 3) {
        <div style="padding:32px;text-align:center">
          <div style="font-size:40px;margin-bottom:12px">🎉</div>
          <h2 style="font-size:22px;font-weight:500;color:var(--color-text-primary);margin-bottom:6px">
            You're all set!
          </h2>
          <p style="font-size:14px;color:var(--color-text-secondary);margin-bottom:24px">
            Complete your profile to get more followers
          </p>

          <!-- Avatar upload -->
          <div style="width:90px;height:90px;border-radius:50%;background:#e0e7ff;
                      margin:0 auto 8px;display:flex;align-items:center;justify-content:center;
                      cursor:pointer;border:2px dashed #6366f1"
               (click)="avatarInput.click()">
            <span style="font-size:28px">📷</span>
          </div>
          <input #avatarInput type="file" accept="image/*" style="display:none"
                 (change)="onAvatarChange($event)">
          <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:20px">
            Click to upload photo
          </p>

          <!-- Bio -->
          <textarea [(ngModel)]="bio" placeholder="Write a short bio about yourself..."
                    rows="3"
                    style="width:100%;padding:12px;border:0.5px solid var(--color-border-tertiary);
                           border-radius:12px;background:var(--color-background-secondary);
                           color:var(--color-text-primary);font-size:14px;
                           outline:none;resize:none;margin-bottom:20px;text-align:left">
          </textarea>

          <!-- Checkboxes summary -->
          <div style="background:var(--color-background-secondary);border-radius:12px;
                      padding:14px;margin-bottom:24px;text-align:left">
            <div style="font-size:12px;color:var(--color-text-secondary);margin-bottom:8px">Your setup:</div>
            <div style="font-size:13px;color:var(--color-text-primary);display:flex;flex-direction:column;gap:4px">
              <span>✅ {{ selectedInterests().length }} interests selected</span>
              <span>✅ {{ followedCount() }} people followed</span>
              <span>{{ bio ? '✅' : '⬜' }} Bio {{ bio ? 'added' : 'not added yet' }}</span>
            </div>
          </div>

          <button (click)="finish()"
                  style="width:100%;padding:14px;background:#6366f1;color:#fff;
                         border:none;border-radius:12px;font-size:15px;font-weight:500;cursor:pointer">
            🚀 Go to my feed
          </button>
        </div>
      }
    </div>
  </div>
</div>
  `
})
export class OnboardingComponent {
  step = signal(1);
  bio  = '';

  interests: Interest[] = [
    { id:'tech',     icon:'💻', label:'Technology',  selected:false },
    { id:'design',   icon:'🎨', label:'Design',       selected:false },
    { id:'science',  icon:'🔬', label:'Science',      selected:false },
    { id:'travel',   icon:'✈️',  label:'Travel',       selected:false },
    { id:'food',     icon:'🍕', label:'Food',         selected:false },
    { id:'fitness',  icon:'💪', label:'Fitness',      selected:false },
    { id:'music',    icon:'🎵', label:'Music',        selected:false },
    { id:'gaming',   icon:'🎮', label:'Gaming',       selected:false },
    { id:'art',      icon:'🖼️', label:'Art',          selected:false },
    { id:'business', icon:'💼', label:'Business',     selected:false },
    { id:'movies',   icon:'🎬', label:'Movies',       selected:false },
    { id:'sports',   icon:'⚽', label:'Sports',       selected:false },
  ];

  suggestedUsers: SuggestedUser[] = [
    { username:'alice',  fullName:'Alice Johnson',  avatarUrl:'', followed:false },
    { username:'bob',    fullName:'Bob Smith',      avatarUrl:'', followed:false },
    { username:'admin',  fullName:'SocialNet Team', avatarUrl:'', followed:false },
  ];

  selectedInterests = () => this.interests.filter(i => i.selected);
  followedCount     = () => this.suggestedUsers.filter(u => u.followed).length;

  constructor(private router: Router, private http: HttpClient, public auth: AuthService) {}

  toggleSuggestedFollow(u: SuggestedUser) {
    u.followed = !u.followed;
    if (u.followed) {
      this.http.post(`${environment.apiUrl}/users/${u.username}/follow`, {}).subscribe();
    }
  }

  onAvatarChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    this.http.post(`${environment.apiUrl}/users/me/avatar`, form).subscribe();
  }

  saveBio() {
    if (this.bio) {
      this.http.put(`${environment.apiUrl}/users/me`, { bio: this.bio }).subscribe();
    }
  }

  skip()   { this.router.navigate(['/feed']); }
  finish() { this.saveBio(); localStorage.setItem('onboarded','1'); this.router.navigate(['/feed']); }
}
