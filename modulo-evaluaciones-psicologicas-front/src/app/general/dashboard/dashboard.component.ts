import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
        <p class="text-xs uppercase tracking-widest text-slate-300">Panel principal</p>
        <h1 class="mt-2 text-3xl font-semibold">Hola, {{ auth.currentUser()?.username }}</h1>
        <p class="mt-2 text-sm text-slate-300">Gestiona los procesos administrativos y clínicos del sistema.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          @if (roleBadges().length) {
            @for (badge of roleBadges(); track badge.value) {
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{{ badge.label }}</span>
            }
          } @else {
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">Sin roles asignados</span>
          }
        </div>
      </header>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (card of accionesPrincipales(); track card.route) {
          <a [routerLink]="card.route" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-militar-primary hover:shadow-lg">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ card.categoria }}</p>
            <h2 class="mt-2 text-lg font-semibold text-slate-900">{{ card.titulo }}</h2>
            <p class="mt-1 text-sm text-slate-500">{{ card.descripcion }}</p>
          </a>
        }
      </section>
    </section>
  `
})
export class DashboardComponent  {
  readonly auth = inject(AuthService);
  private readonly roleLabels: Record<string, string> = {
    ROLE_ADMIN: 'Administrador',
    ROLE_PSICOLOGO: 'Psicólogo'
  };
  readonly roles = this.auth.roles;
  readonly roleBadges = computed(() => this.roles().map(role => ({ value: role, label: this.formatRoleLabel(role) })));
  readonly accionesPrincipales = computed(() => {
    const base = [{
      route: '/admin/asignaciones/mias',
      categoria: 'Casos asignados',
      titulo: 'Revisar mis asignaciones',
      descripcion: 'Consulta el detalle de los casos derivados a tu gestión clínica.'
    }];

    if (this.auth.isAdmin()) {
      return [
        {
          route: '/admin/personal',
          categoria: 'Administrativo',
          titulo: 'Gestión de personal militar',
          descripcion: 'Administra datos y disponibilidad del personal militar evaluado.'
        },
        {
          route: '/admin/psicologos',
          categoria: 'Talento humano',
          titulo: 'Equipo de psicólogos',
          descripcion: 'Gestiona psicólogos, especialidades y disponibilidad.'
        },
        {
          route: '/admin/asignaciones',
          categoria: 'Operaciones',
          titulo: 'Asignación de casos',
          descripcion: 'Deriva evaluaciones y controla el estado de las asignaciones activas.'
        },
        {
          route: '/admin/fichas',
          categoria: 'Clínico',
          titulo: 'Fichas clínicas',
          descripcion: 'Registra evaluaciones, diagnósticos y hallazgos clínicos.'
        },
        {
          route: '/admin/seguimientos',
          categoria: 'Seguimiento',
          titulo: 'Sesiones de seguimiento',
          descripcion: 'Documenta avances terapéuticos y próximas sesiones.'
        },
        {
          route: '/admin/catalogos',
          categoria: 'Configuración',
          titulo: 'Catálogos del sistema',
          descripcion: 'Mantén actualizadas las listas de referencia clínica.'
        },
        {
          route: '/users',
          categoria: 'Usuarios',
          titulo: 'Administración de cuentas',
          descripcion: 'Crea, edita y bloquea usuarios del sistema.'
        }
      ];
    }

    if (this.auth.isPsicologo()) {
      return base.concat({
        route: '/admin/seguimientos/mios',
        categoria: 'Seguimiento',
        titulo: 'Mis seguimientos clínicos',
        descripcion: 'Revisa y completa los registros de tus atenciones.'
      });
    }

    return base;
  });

  private formatRoleLabel(role: string): string {
    const direct = this.roleLabels[role];
    if (direct) return direct;
    const cleaned = role.replace(/^ROLE_/i, '').replaceAll('_', ' ').toLowerCase();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}
