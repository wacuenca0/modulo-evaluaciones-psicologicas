import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PersonalMilitarService } from '../../../services/personal-militar.service';
import { PsicologosService } from '../../../services/psicologos.service';
import { AsignacionesService } from '../../../services/asignaciones.service';
import { FichasClinicasService } from '../../../services/fichas-clinicas.service';

interface DashboardMetrics {
  personal: number;
  psicologos: number;
  asignacionesPendientes: number;
  fichasActivas: number;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Panel Administrativo</p>
        <h1 class="text-2xl font-semibold text-slate-900">Resumen Operativo</h1>
        <p class="text-sm text-slate-500">Monitorea el estado general de la gestión clínica y administrativa.</p>
      </header>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="h-32 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
          <div class="h-32 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
          <div class="h-32 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
          <div class="h-32 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Personal Militar</span>
            <p class="mt-3 text-3xl font-semibold text-slate-900">{{ metrics().personal }}</p>
            <p class="mt-1 text-xs text-slate-500">Registrados en el sistema</p>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Psicólogos</span>
            <p class="mt-3 text-3xl font-semibold text-slate-900">{{ metrics().psicologos }}</p>
            <p class="mt-1 text-xs text-slate-500">Profesionales activos</p>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Asignaciones pendientes</span>
            <p class="mt-3 text-3xl font-semibold text-amber-600">{{ metrics().asignacionesPendientes }}</p>
            <p class="mt-1 text-xs text-slate-500">Requieren seguimiento</p>
          </article>
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Fichas activas</span>
            <p class="mt-3 text-3xl font-semibold text-emerald-600">{{ metrics().fichasActivas }}</p>
            <p class="mt-1 text-xs text-slate-500">En proceso clínico</p>
          </article>
        </div>
      }
    </section>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly personalService = inject(PersonalMilitarService);
  private readonly psicologosService = inject(PsicologosService);
  private readonly asignacionesService = inject(AsignacionesService);
  private readonly fichasService = inject(FichasClinicasService);

  readonly loading = signal(true);
  readonly metrics = signal<DashboardMetrics>({ personal: 0, psicologos: 0, asignacionesPendientes: 0, fichasActivas: 0 });

  ngOnInit(): void {
    forkJoin({
      personal: this.personalService.list({ page: 0, size: 1 }).pipe(map(r => r.totalElements), catchError(() => of(0))),
      psicologos: this.psicologosService.list({ page: 0, size: 1 }).pipe(map(r => r.totalElements), catchError(() => of(0))),
      asignacionesPendientes: this.asignacionesService.list({ page: 0, size: 1, estado: 'PENDIENTE' }).pipe(map(r => r.totalElements), catchError(() => of(0))),
      fichasActivas: this.fichasService.list({ page: 0, size: 1, estado: 'EN_PROCESO' }).pipe(map(r => r.totalElements), catchError(() => of(0)))
    }).subscribe({
      next: metrics => {
        this.metrics.set(metrics);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
