import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { HttpClient }                from '@angular/common/http';
import { environment }               from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="max-w-6xl mx-auto px-4 py-6">

  <div class="flex items-center gap-3 mb-8">
    <span class="text-3xl">⚙️</span>
    <h1 class="text-2xl font-bold text-gray-900">Admin Panel</h1>
    <span class="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">ADMIN</span>
  </div>

  <!-- Stats Cards -->
  @if (stats()) {
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      @for (card of statCards(); track card.label) {
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p class="text-3xl mb-1">{{ card.icon }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ card.value | number }}</p>
          <p class="text-sm text-gray-500">{{ card.label }}</p>
        </div>
      }
    </div>
  }

  <!-- Tabs -->
  <div class="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
    @for (tab of tabs; track tab) {
      <button (click)="activeTab.set(tab)"
              class="px-5 py-2 text-sm font-medium rounded-lg transition"
              [class.bg-white]="activeTab() === tab"
              [class.shadow-sm]="activeTab() === tab"
              [class.text-gray-900]="activeTab() === tab"
              [class.text-gray-500]="activeTab() !== tab">
        {{ tab }}
      </button>
    }
  </div>

  <!-- Users Tab -->
  @if (activeTab() === 'Users') {
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">

      <!-- Search -->
      <div class="p-4 border-b border-gray-100">
        <input [(ngModel)]="userSearch" (ngModelChange)="searchUsers($event)"
               placeholder="Search users..."
               class="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl
                      focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-left">
              <th class="px-4 py-3 text-gray-500 font-medium">User</th>
              <th class="px-4 py-3 text-gray-500 font-medium">Role</th>
              <th class="px-4 py-3 text-gray-500 font-medium">Status</th>
              <th class="px-4 py-3 text-gray-500 font-medium">Joined</th>
              <th class="px-4 py-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (user of users(); track user.id) {
              <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img [src]="user.avatarUrl || '/assets/default-avatar.png'"
                         class="w-9 h-9 rounded-full object-cover">
                    <div>
                      <p class="font-medium text-gray-900">{{ user.fullName || user.username }}</p>
                      <p class="text-xs text-gray-400">{{ user.email }}</p>
                    </div>
                    @if (user.isVerified) { <span class="text-blue-500 text-sm">✓</span> }
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded-lg text-xs font-medium"
                        [class.bg-red-100]="user.role === 'ADMIN'"
                        [class.text-red-700]="user.role === 'ADMIN'"
                        [class.bg-yellow-100]="user.role === 'MODERATOR'"
                        [class.text-yellow-700]="user.role === 'MODERATOR'"
                        [class.bg-gray-100]="user.role === 'USER'"
                        [class.text-gray-700]="user.role === 'USER'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded-lg text-xs font-medium"
                        [class.bg-green-100]="user.status === 'ACTIVE'"
                        [class.text-green-700]="user.status === 'ACTIVE'"
                        [class.bg-red-100]="user.status === 'BANNED'"
                        [class.text-red-700]="user.status === 'BANNED'">
                    {{ user.status || 'ACTIVE' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-400 text-xs">
                  {{ user.createdAt | date:'MMM d, y' }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button (click)="verifyUser(user)"
                            [disabled]="user.isVerified"
                            class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg
                                   hover:bg-blue-100 disabled:opacity-40 transition">
                      ✓ Verify
                    </button>
                    @if (user.status !== 'BANNED') {
                      <button (click)="banUser(user)"
                              class="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-lg
                                     hover:bg-red-100 transition">
                        Ban
                      </button>
                    } @else {
                      <button (click)="unbanUser(user)"
                              class="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-lg
                                     hover:bg-green-100 transition">
                        Unban
                      </button>
                    }
                    <select (change)="setRole(user, $any($event.target).value)"
                            [value]="user.role"
                            class="text-xs border border-gray-200 rounded-lg px-2 py-1
                                   focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option>USER</option>
                      <option>MODERATOR</option>
                      <option>ADMIN</option>
                    </select>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <button (click)="prevPage()" [disabled]="currentPage() === 0"
                class="px-4 py-2 border border-gray-200 rounded-xl text-sm
                       hover:bg-gray-50 disabled:opacity-40 transition">← Prev</button>
        <span class="text-sm text-gray-500">Page {{ currentPage() + 1 }}</span>
        <button (click)="nextPage()" [disabled]="!hasMorePages()"
                class="px-4 py-2 border border-gray-200 rounded-xl text-sm
                       hover:bg-gray-50 disabled:opacity-40 transition">Next →</button>
      </div>
    </div>
  }
</div>
  `
})
export class AdminComponent implements OnInit {
  stats        = signal<any>(null);
  users        = signal<any[]>([]);
  activeTab    = signal<'Users' | 'Posts'>('Users');
  tabs         = ['Users', 'Posts'] as const;
  userSearch   = '';
  currentPage  = signal(0);
  hasMorePages = signal(false);
  private api  = `${environment.apiUrl}/admin`;

  statCards = () => [
    { icon: '👥', label: 'Total Users',   value: this.stats()?.totalUsers   || 0 },
    { icon: '✅', label: 'Active Users',  value: this.stats()?.activeUsers  || 0 },
    { icon: '🚫', label: 'Banned Users',  value: this.stats()?.bannedUsers  || 0 },
    { icon: '📝', label: 'Total Posts',   value: this.stats()?.totalPosts   || 0 },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
  }

  loadStats() {
    this.http.get<any>(`${this.api}/stats`).subscribe(s => this.stats.set(s));
  }

  loadUsers(search = '') {
    const params = `page=${this.currentPage()}&size=20${search ? '&search=' + search : ''}`;
    this.http.get<any>(`${this.api}/users?${params}`).subscribe(res => {
      this.users.set(res.content || []);
      this.hasMorePages.set(!res.last);
    });
  }

  searchUsers(q: string) {
    this.currentPage.set(0);
    this.loadUsers(q);
  }

  banUser(user: any) {
    this.http.patch(`${this.api}/users/${user.id}/ban`, {}).subscribe(u => {
      this.users.update(list => list.map(x => x.id === user.id ? u : x));
    });
  }

  unbanUser(user: any) {
    this.http.patch(`${this.api}/users/${user.id}/unban`, {}).subscribe(u => {
      this.users.update(list => list.map(x => x.id === user.id ? u : x));
    });
  }

  verifyUser(user: any) {
    this.http.patch(`${this.api}/users/${user.id}/verify`, {}).subscribe(u => {
      this.users.update(list => list.map(x => x.id === user.id ? u : x));
    });
  }

  setRole(user: any, role: string) {
    this.http.patch(`${this.api}/users/${user.id}/role`, { role }).subscribe(u => {
      this.users.update(list => list.map(x => x.id === user.id ? u : x));
    });
  }

  prevPage() { this.currentPage.update(p => p - 1); this.loadUsers(this.userSearch); }
  nextPage() { this.currentPage.update(p => p + 1); this.loadUsers(this.userSearch); }
}
