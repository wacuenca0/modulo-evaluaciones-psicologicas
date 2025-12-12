import { Injectable, signal } from '@angular/core';

const KEY = 'app.sidebar.collapsed';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  collapsed = signal<boolean>(this.readInitial());

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
    localStorage.setItem(KEY, this.collapsed() ? '1' : '0');
  }

  private readInitial(): boolean {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
  }
}
