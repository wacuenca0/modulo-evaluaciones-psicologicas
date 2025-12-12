import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoggedIn()) {
      <nav class="w-full flex flex-wrap items-center gap-4 p-3 bg-slate-900 text-white shadow">
        <span class="font-semibold tracking-wide uppercase text-xs md:text-sm">Sistema de Evaluaciones Psicológicas</span>
        @for (link of links(); track link.route) {
          <a
            [routerLink]="link.route"
            routerLinkActive="text-militar-accent"
            class="text-xs md:text-sm font-medium transition hover:text-militar-accent"
          >
            {{ link.label }}
          </a>
        }
        <button (click)="logout()" class="ml-auto text-xs md:text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-500 transition">Salir</button>
      </nav>
    }
  `
})
export class AppNavComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoggedIn = this.auth.isAuthenticated;
  readonly isAdmin = this.auth.isAdmin;
  readonly isPsicologo = this.auth.isPsicologo;
  readonly links = computed(() => {
    const links = [{ label: 'Panel', route: '/dashboard' }];
    if (this.auth.isAdmin()) {
      links.push(
        { label: 'Personal Militar', route: '/admin/personal' },
        { label: 'Psicólogos', route: '/admin/psicologos' },
        { label: 'Asignaciones', route: '/admin/asignaciones' },
        { label: 'Fichas Clínicas', route: '/admin/fichas' },
        { label: 'Seguimientos', route: '/admin/seguimientos' },
        { label: 'Catálogos', route: '/admin/catalogos' },
        { label: 'Usuarios', route: '/users' }
      );
    }
    if (this.auth.isPsicologo()) {
      links.push(
        { label: 'Mis Asignaciones', route: '/admin/asignaciones/mias' },
        { label: 'Mis Seguimientos', route: '/admin/seguimientos/mios' }
      );
    }
    return links;
  });

  logout() {
    this.auth.logout().subscribe({
      next: () => { this.router.navigate(['/login']).catch(() => {}); },
      error: () => { this.auth.clearAllTokens(); this.router.navigate(['/login']).catch(() => {}); }
    });
  }
}
