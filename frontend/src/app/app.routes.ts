import { Routes }    from '@angular/router';
import { authGuard }  from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  { path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent) },

  { path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent) },

  { path: 'login',          loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register',       loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: 'forgot-password',loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent), canActivate: [guestGuard] },
  { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent), canActivate: [guestGuard] },
  { path: 'onboarding', loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent) },

  { path: '', canActivate: [authGuard], children: [
    { path: '',              redirectTo: 'feed', pathMatch: 'full' },
    { path: 'feed',          loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent) },
    { path: 'profile/:username', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
    { path: 'posts/:id',     loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
    { path: 'messages',      loadComponent: () => import('./pages/messages/chat-layout/chat-layout.component').then(m => m.ChatLayoutComponent) },
    { path: 'messages/:id',  loadComponent: () => import('./pages/messages/chat/chat.component').then(m => m.ChatComponent) },
    { path: 'explore',       loadComponent: () => import('./pages/explore/explore.component').then(m => m.ExploreComponent) },
    { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent) },
    { path: 'settings',      loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
    { path: 'hashtag/:tag',  loadComponent: () => import('./pages/hashtag/hashtag.component').then(m => m.HashtagComponent) },
    { path: 'admin',         loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), canActivate: [adminGuard] },
  ]},
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
