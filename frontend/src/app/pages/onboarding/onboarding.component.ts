import { Component, signal } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Router }            from '@angular/router';
import { HttpClient }        from '@angular/common/http';
import { AuthService }       from '../../services/auth.service';
import { environment }       from '../../../environments/environment';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
            background:linear-gradient(135deg,#ede9fe 0%,#fce7f3 50%,#e0e7ff 100%);
            padding:20px">
  <div style="width:100%;max-width:480px">

    <!-- Progress dots -->
    <div style="display:flex;justify-content:center;gap:8px;margin-bottom:24px">
      @for (i of [0,1,2,3]; track i) {
        <div style="height:4px;border-radius:10px;transition:all .3s"
             [style.width]="step() === i ? '24px' : '8px'"
             [style.background]="step() >= i ? '#6366f1' : 'rgba(99,102,241,.2)'"></div>
      }
    </div>

    <div style="background:#fff;border-radius:24px;padding:36px 32px;
                box-shadow:0 8px 40px rgba(99,102,241,.12)">

      <!-- Step 0: Welcome -->
      @if (step() === 0) {
        <div style="text-align:center">
          <div style="font-size:56px;margin-bottom:16px">🌐</div>
          <h1 style="font-size:26px;font-weight:500;color:#111;margin-bottom:10px">
            Welcome to SocialNet!
          </h1>
          <p style="font-size:15px;color:#6b7280;line-height:1.6;margin-bottom:28px">
            Let's set up your profile in just a few steps.<br>It only takes 2 minutes.
          </p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
            @for (f of welcomeFeatures; track f.icon) {
              <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;
                          background:#f9fafb;border-radius:12px">
                <span style="font-size:20px">{{ f.icon }}</span>
                <div style="text-align:left">
                  <div style="font-size:13px;font-weight:500;color:#111">{{ f.title }}</div>
                  <div style="font-size:12px;color:#6b7280">{{ f.desc }}</div>
                </div>
              </div>
            }
          </div>
          <button (click)="next()" style="width:100%;padding:14px;background:#6366f1;
                  color:#fff;border:none;border-radius:12px;font-size:15px;
                  font-weight:500;cursor:pointer">
            Get started →
          </button>
        </div>
      }

      <!-- Step 1: Profile info -->
      @if (step() === 1) {
        <div>
          <h2 style="font-size:20px;font-weight:500;color:#111;margin-bottom:6px">Your profile</h2>
          <p style="font-size:14px;color:#6b7280;margin-bottom:20px">Tell people a bit about you</p>

          <!-- Avatar upload -->
          <div style="display:flex;justify-content:center;margin-bottom:20px">
            <div style="position:relative;cursor:pointer" (click)="avatarInput.click()">
              <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                          display:flex;align-items:center;justify-content:center;
                          color:#fff;font-size:28px;font-weight:500;overflow:hidden">
                @if (avatarPreview()) {
                  <img [src]="avatarPreview()" style="width:100%;height:100%;object-fit:cover">
                } @else {
                  {{ fullName.charAt(0).toUpperCase() || '?' }}
                }
              </div>
              <div style="position:absolute;bottom:0;right:0;width:26px;height:26px;
                          background:#6366f1;border-radius:50%;border:2px solid #fff;
                          display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff">
                +
              </div>
            </div>
            <input #avatarInput type="file" accept="image/*" style="display:none"
                   (change)="previewAvatar(avatarInput.files)">
          </div>

          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">
            <div>
              <label style="font-size:12px;font-weight:500;color:#6b7280;display:block;margin-bottom:5px">Full Name</label>
              <input [(ngModel)]="fullName" placeholder="Your full name"
                     style="width:100%;padding:10px 14px;border:0.5px solid #e5e7eb;
                            border-radius:10px;font-size:14px;outline:none;background:#f9fafb">
            </div>
            <div>
              <label style="font-size:12px;font-weight:500;color:#6b7280;display:block;margin-bottom:5px">Bio</label>
              <textarea [(ngModel)]="bio" placeholder="Tell something about yourself..."
                        rows="3"
                        style="width:100%;padding:10px 14px;border:0.5px solid #e5e7eb;
                               border-radius:10px;font-size:14px;outline:none;resize:none;background:#f9fafb">
              </textarea>
            </div>
            <div>
              <label style="font-size:12px;font-weight:500;color:#6b7280;display:block;margin-bottom:5px">Location</label>
              <input [(ngModel)]="location" placeholder="City, Country"
                     style="width:100%;padding:10px 14px;border:0.5px solid #e5e7eb;
                            border-radius:10px;font-size:14px;outline:none;background:#f9fafb">
            </div>
          </div>
          <div style="display:flex;gap:10px">
            <button (click)="skip()" style="flex:1;padding:12px;border:0.5px solid #e5e7eb;
                    background:#fff;border-radius:12px;font-size:14px;cursor:pointer;color:#6b7280">
              Skip
            </button>
            <button (click)="saveProfile()" style="flex:2;padding:12px;background:#6366f1;
                    color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:500;cursor:pointer">
              Continue →
            </button>
          </div>
        </div>
      }

      <!-- Step 2: Interests -->
      @if (step() === 2) {
        <div>
          <h2 style="font-size:20px;font-weight:500;color:#111;margin-bottom:6px">Pick your interests</h2>
          <p style="font-size:14px;color:#6b7280;margin-bottom:20px">
            We'll personalise your feed based on what you love
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">
            @for (interest of interests; track interest.tag) {
              <button (click)="toggleInterest(interest)"
                      style="padding:8px 16px;border-radius:20px;font-size:13px;
                             cursor:pointer;transition:all .15s;font-weight:500"
                      [style.background]="interest.selected ? '#6366f1' : '#f3f4f6'"
                      [style.color]="interest.selected ? '#fff' : '#374151'"
                      [style.border]="interest.selected ? 'none' : '0.5px solid #e5e7eb'">
                {{ interest.icon }} {{ interest.tag }}
              </button>
            }
          </div>
          <div style="display:flex;gap:10px">
            <button (click)="prev()" style="flex:1;padding:12px;border:0.5px solid #e5e7eb;
                    background:#fff;border-radius:12px;font-size:14px;cursor:pointer;color:#6b7280">
              Back
            </button>
            <button (click)="next()" style="flex:2;padding:12px;background:#6366f1;
                    color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:500;cursor:pointer">
              Continue →
            </button>
          </div>
        </div>
      }

      <!-- Step 3: Done -->
      @if (step() === 3) {
        <div style="text-align:center">
          <div style="font-size:64px;margin-bottom:16px">🎉</div>
          <h2 style="font-size:22px;font-weight:500;color:#111;margin-bottom:10px">You're all set!</h2>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:24px">
            Your profile is ready. Start exploring and connecting with people.
          </p>
          @if (selectedInterests().length) {
            <div style="background:#e0e7ff;border-radius:12px;padding:14px;margin-bottom:20px;text-align:left">
              <div style="font-size:12px;font-weight:500;color:#4338ca;margin-bottom:8px">
                Your interests
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                @for (i of selectedInterests(); track i.tag) {
                  <span style="font-size:12px;background:#fff;color:#4338ca;
                               padding:3px 10px;border-radius:10px">{{ i.icon }} {{ i.tag }}</span>
                }
              </div>
            </div>
          }
          <div style="display:flex;flex-direction:column;gap:10px">
            <button (click)="goToFeed()"
                    style="width:100%;padding:14px;background:#6366f1;color:#fff;
                           border:none;border-radius:12px;font-size:15px;font-weight:500;cursor:pointer">
              🏠 Go to Feed
            </button>
            <button (click)="goToExplore()"
                    style="width:100%;padding:12px;border:0.5px solid #e5e7eb;background:#fff;
                           border-radius:12px;font-size:14px;cursor:pointer;color:#374151">
              🔍 Explore people first
            </button>
          </div>
        </div>
      }
    </div>
  </div>
</div>
  `
})
export class OnboardingComponent {
  step         = signal(0);
  avatarPreview = signal<string | null>(null);
  fullName     = '';
  bio          = '';
  location     = '';
  avatarFile:  File | null = null;

  welcomeFeatures = [
    { icon: '💬', title: 'Chat in real-time',    desc: 'Message anyone instantly' },
    { icon: '📸', title: 'Share your moments',   desc: 'Photos, videos and stories' },
    { icon: '🔍', title: 'Discover people',       desc: 'Find interesting accounts' },
    { icon: '🤖', title: 'AI assistant',          desc: 'Get help anytime' },
  ];

  interests = [
    { icon: '💻', tag: 'Technology', selected: false },
    { icon: '🎨', tag: 'Design',     selected: false },
    { icon: '📸', tag: 'Photography',selected: false },
    { icon: '🎵', tag: 'Music',      selected: false },
    { icon: '✈️', tag: 'Travel',     selected: false },
    { icon: '🍕', tag: 'Food',       selected: false },
    { icon: '🏋️', tag: 'Fitness',   selected: false },
    { icon: '📚', tag: 'Books',      selected: false },
    { icon: '🎮', tag: 'Gaming',     selected: false },
    { icon: '🌿', tag: 'Nature',     selected: false },
    { icon: '🎬', tag: 'Movies',     selected: false },
    { icon: '💰', tag: 'Finance',    selected: false },
  ];

  selectedInterests() { return this.interests.filter(i => i.selected); }

  constructor(
    private router: Router,
    private http:   HttpClient,
    public  auth:   AuthService
  ) {
    const u = auth.currentUser();
    if (u) { this.fullName = u.fullName || ''; }
  }

  next()  { this.step.update(s => Math.min(s + 1, 3)); }
  prev()  { this.step.update(s => Math.max(s - 1, 0)); }
  skip()  { this.next(); }

  toggleInterest(i: any) { i.selected = !i.selected; }

  previewAvatar(files: FileList | null) {
    if (!files?.length) return;
    this.avatarFile = files[0];
    const reader = new FileReader();
    reader.onload = e => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(files[0]);
  }

  saveProfile() {
    const data = { fullName: this.fullName, bio: this.bio, location: this.location };
    this.http.patch(`${environment.apiUrl}/users/me`, data).subscribe();
    if (this.avatarFile) {
      const fd = new FormData();
      fd.append('file', this.avatarFile);
      this.http.post(`${environment.apiUrl}/users/me/avatar`, fd).subscribe();
    }
    this.next();
  }

  goToFeed()    { localStorage.setItem('onboarded', '1'); this.router.navigate(['/feed']); }
  goToExplore() { localStorage.setItem('onboarded', '1'); this.router.navigate(['/explore']); }
}
