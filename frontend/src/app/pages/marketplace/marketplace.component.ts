import { Component, OnInit, signal } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { RouterLink }    from '@angular/router';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../../environments/environment';

@Component({
  selector: 'app-marketplace', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div style="max-width:1000px;margin:0 auto;padding:20px 16px">

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
    <div>
      <h1 style="font-size:22px;font-weight:500;color:var(--text-primary,#111)">🛒 Marketplace</h1>
      <p style="font-size:13px;color:var(--text-secondary,#6b7280)">Buy and sell within the community</p>
    </div>
    <button (click)="createMode=!createMode"
            style="padding:9px 20px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
      + Sell Something
    </button>
  </div>

  <!-- Create listing -->
  @if (createMode) {
    <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,.04)">
      <h3 style="font-size:15px;font-weight:500;margin-bottom:16px;color:var(--text-primary,#111)">New Listing</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <input [(ngModel)]="form.title" placeholder="Item title" [style]="iS" style="grid-column:span 2">
        <textarea [(ngModel)]="form.description" placeholder="Description..." rows="3"
                  [style]="iS+'resize:none'" style="grid-column:span 2"></textarea>
        <div style="position:relative">
          <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
                       color:var(--text-secondary,#6b7280);font-size:13px">$</span>
          <input [(ngModel)]="form.price" type="number" placeholder="Price" [style]="iS+'padding-left:28px'">
        </div>
        <select [(ngModel)]="form.category" [style]="iS">
          <option value="">Select category</option>
          @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
        </select>
        <input [(ngModel)]="form.location" placeholder="📍 Location (optional)" [style]="iS">
        <div style="display:flex;align-items:center;gap:8px;padding:9px 14px;
                    border:0.5px solid var(--border,#e5e7eb);border-radius:9px;cursor:pointer;
                    background:var(--bg-secondary,#f9fafb)" (click)="imgInput.click()">
          <span style="font-size:14px">📷</span>
          <span style="font-size:13px;color:var(--text-secondary,#6b7280)">
            {{ imgFile ? imgFile.name : 'Add photo' }}
          </span>
          <input #imgInput type="file" accept="image/*" style="display:none"
                 (change)="setImg(imgInput.files)">
        </div>
        <div style="grid-column:span 2;display:flex;gap:10px">
          <button (click)="createMode=false"
                  style="flex:1;padding:10px;border:0.5px solid var(--border,#e5e7eb);background:none;
                         border-radius:10px;font-size:13px;cursor:pointer;color:var(--text-secondary,#6b7280)">
            Cancel
          </button>
          <button (click)="submit()" [disabled]="!form.title || !form.price || submitting()"
                  style="flex:2;padding:10px;background:#6366f1;color:#fff;border:none;
                         border-radius:10px;font-size:13px;font-weight:500;cursor:pointer">
            {{ submitting() ? 'Listing...' : 'Post Listing' }}
          </button>
        </div>
      </div>
    </div>
  }

  <!-- Search & filter -->
  <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <div style="position:relative;flex:1;min-width:200px">
      <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px">🔍</span>
      <input [(ngModel)]="q" (ngModelChange)="load()" placeholder="Search listings..."
             style="width:100%;padding:10px 14px 10px 36px;border:0.5px solid var(--border,#e5e7eb);
                    border-radius:10px;font-size:13px;outline:none;background:var(--bg-primary,#fff);
                    color:var(--text-primary,#111);box-sizing:border-box">
    </div>
    <div style="display:flex;gap:6px;overflow-x:auto">
      <button (click)="filterCat='';load()"
              style="padding:8px 14px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap"
              [style.background]="!filterCat ? '#6366f1' : 'var(--bg-primary,#fff)'"
              [style.color]="!filterCat ? '#fff' : 'var(--text-primary,#111)'"
              [style.border]="!filterCat ? 'none' : '0.5px solid var(--border,#e5e7eb)'">All</button>
      @for (c of categories; track c) {
        <button (click)="filterCat=c;load()"
                style="padding:8px 14px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap"
                [style.background]="filterCat===c ? '#6366f1' : 'var(--bg-primary,#fff)'"
                [style.color]="filterCat===c ? '#fff' : 'var(--text-primary,#111)'"
                [style.border]="filterCat===c ? 'none' : '0.5px solid var(--border,#e5e7eb)'">
          {{ c }}
        </button>
      }
    </div>
  </div>

  <!-- Product grid -->
  @if (loading()) {
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
      @for (i of [1,2,3,4,5,6]; track i) {
        <div style="border-radius:14px;overflow:hidden;background:var(--bg-secondary,#f9fafb);height:280px;animation:pulse 1.5s infinite"></div>
      }
    </div>
  } @else {
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
      @for (p of products(); track p.id) {
        <div style="background:var(--bg-primary,#fff);border:0.5px solid var(--border,#e5e7eb);
                    border-radius:14px;overflow:hidden;transition:transform .15s"
             class="product-card">
          <!-- Image -->
          <div style="aspect-ratio:1;background:linear-gradient(135deg,#e0e7ff,#ede9fe);
                      display:flex;align-items:center;justify-content:center;position:relative">
            @if (p.imageUrl) {
              <img [src]="p.imageUrl" style="width:100%;height:100%;object-fit:cover">
            } @else {
              <span style="font-size:40px">{{ catEmoji(p.category) }}</span>
            }
            @if (p.status === 'SOLD') {
              <div style="position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center">
                <span style="color:#fff;font-size:16px;font-weight:600;letter-spacing:1px">SOLD</span>
              </div>
            }
            <div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.5);
                        color:#fff;font-size:10px;padding:3px 7px;border-radius:10px;
                        backdrop-filter:blur(4px)">
              {{ p.category }}
            </div>
          </div>

          <!-- Info -->
          <div style="padding:12px">
            <div style="font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:4px;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ p.title }}</div>
            <div style="font-size:18px;font-weight:600;color:#6366f1;margin-bottom:8px">\${{ p.price }}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
              <div style="width:20px;height:20px;border-radius:50%;background:#6366f1;
                          display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:500">
                {{ p.sellerUsername.charAt(0).toUpperCase() }}
              </div>
              <span style="font-size:11px;color:var(--text-secondary,#6b7280)">{{ p.sellerFullName }}</span>
            </div>
            @if (p.location) {
              <div style="font-size:11px;color:var(--text-muted,#9ca3af);margin-bottom:8px">📍 {{ p.location }}</div>
            }
            <button (click)="contactSeller(p)"
                    style="width:100%;padding:8px;background:#6366f1;color:#fff;border:none;
                           border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;
                           opacity:1;transition:opacity .15s"
                    [style.opacity]="p.status==='SOLD' ? '0.5' : '1'"
                    [disabled]="p.status==='SOLD'">
              {{ p.status==='SOLD' ? 'Sold' : '💬 Contact Seller' }}
            </button>
          </div>
        </div>
      }
    </div>

    @if (!products().length) {
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:52px;margin-bottom:14px">🛒</div>
        <p style="font-size:16px;font-weight:500;color:var(--text-primary,#111);margin-bottom:6px">No listings yet</p>
        <p style="font-size:14px;color:var(--text-secondary,#6b7280)">Be the first to sell something!</p>
        <button (click)="createMode=true"
                style="margin-top:16px;padding:10px 24px;background:#6366f1;color:#fff;
                       border:none;border-radius:10px;font-size:14px;cursor:pointer">
          Post a Listing
        </button>
      </div>
    }
  }
</div>
<style>
.product-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
</style>
  `
})
export class MarketplaceComponent implements OnInit {
  products  = signal<any[]>([]);
  loading   = signal(true);
  submitting = signal(false);
  createMode = false;
  q = ''; filterCat = '';
  imgFile: File | null = null;
  form = { title:'', description:'', price:'', category:'', location:'' };
  iS = 'width:100%;padding:9px 14px;border:0.5px solid var(--border,#e5e7eb);border-radius:9px;font-size:13px;background:var(--bg-secondary,#f9fafb);color:var(--text-primary,#111);outline:none;box-sizing:border-box;';
  categories = ['Electronics','Clothing','Furniture','Books','Sports','Vehicles','Music','Art','Garden','Other'];
  catEmojis: Record<string,string> = {Electronics:'💻',Clothing:'👕',Furniture:'🛋️',Books:'📚',Sports:'⚽',Vehicles:'🚗',Music:'🎵',Art:'🎨',Garden:'🌿',Other:'📦'};

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params = this.q ? `?q=${encodeURIComponent(this.q)}` : this.filterCat ? `?category=${this.filterCat}` : '';
    this.http.get<any>(`${environment.apiUrl}/marketplace${params}`).subscribe({
      next: r => { this.products.set(r.content || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setImg(files: FileList | null) { if (files?.length) this.imgFile = files[0]; }

  submit() {
    if (!this.form.title || !this.form.price) return;
    this.submitting.set(true);
    const fd = new FormData();
    fd.append('title',       this.form.title);
    fd.append('description', this.form.description);
    fd.append('price',       this.form.price);
    fd.append('category',    this.form.category || 'Other');
    fd.append('location',    this.form.location);
    if (this.imgFile) fd.append('image', this.imgFile);
    this.http.post<any>(`${environment.apiUrl}/marketplace`, fd).subscribe({
      next: p => {
        this.products.update(l => [p, ...l]);
        this.createMode = false;
        this.form = { title:'', description:'', price:'', category:'', location:'' };
        this.imgFile = null;
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false)
    });
  }

  contactSeller(p: any) {
    alert(`Open chat with @${p.sellerUsername} about: ${p.title}`);
  }

  catEmoji(cat: string) { return this.catEmojis[cat] || '📦'; }
}
