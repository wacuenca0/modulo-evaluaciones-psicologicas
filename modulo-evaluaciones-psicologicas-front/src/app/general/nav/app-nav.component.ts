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
        <span class="font-semibold tracking-wide uppercase text-xs md:text-sm">Sistema de Evaluaciones Psicologicas</span>
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
  readonly isPsicologo = this.auth.isPsicologo;
  readonly links = computed(() => {
    const links: { label: string; route: string }[] = [];
    const esAdmin = this.auth.isAdmin();
    const esPsicologo = this.auth.isPsicologo();
    if (esAdmin) {
      links.push(
        { label: 'Catalogos', route: '/admin/catalogos' },
        { label: 'Usuarios', route: '/users' }
      );
    }
    if (esPsicologo) {
      links.push({ label: 'Buscar Personal', route: '/psicologo/personal' });
    }
    if (esAdmin || esPsicologo) {
      links.push({ label: 'Reportes', route: '/reportes' });
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
