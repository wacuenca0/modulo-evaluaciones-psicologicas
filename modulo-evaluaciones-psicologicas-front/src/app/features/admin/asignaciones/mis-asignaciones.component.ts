import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AsignacionesService } from '../../../services/asignaciones.service';
import { AuthService } from '../../../services/auth.service';
import { AsignacionDTO, EstadoAsignacion } from '../../../models/asignacion.models';

@Component({
  selector: 'app-mis-asignaciones',
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Gestión clínica</p>
        <h1 class="text-2xl font-semibold text-slate-900">Mis asignaciones</h1>
        <p class="text-sm text-slate-500">Casos asignados para seguimiento clínico.</p>
      </header>

      @if (status()) {
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{{ status() }}</div>
      }

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Cargando información...</div>
      } @else if (!asignaciones().length) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">No tienes asignaciones activas.</div>
      } @else {
        <div class="grid gap-4 md:grid-cols-2">
          @for (item of asignaciones(); track item.id) {
            <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <header>
                <p class="text-sm font-semibold text-slate-900">{{ item.personal.nombres }} {{ item.personal.apellidos }}</p>
                <p class="text-xs text-slate-500">Grado {{ item.personal.grado }} • Unidad {{ item.personal.unidad || '—' }}</p>
              </header>
              <p class="text-xs text-slate-500">Asignado el {{ item.fechaAsignacion | date:'longDate' }}</p>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado del caso
                <select
                  #estadoSelect
                  class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"
                  [value]="item.estado"
                  (change)="actualizarEstado(item, estadoSelect.value)"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En proceso</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="ANULADA">Anulada</option>
                </select>
              </label>
              <p class="text-xs text-slate-500">Observaciones: {{ item.observaciones || 'Sin observaciones' }}</p>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class MisAsignacionesComponent implements OnInit {
  private readonly asignacionesService = inject(AsignacionesService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly asignaciones = signal<AsignacionDTO[]>([]);
  readonly status = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  actualizarEstado(item: AsignacionDTO, estado: string) {
    const estadoTyped = estado as EstadoAsignacion;
    this.asignacionesService.actualizarEstado(item.id, estadoTyped).subscribe({
      next: () => {
        this.status.set('Estado de la asignación actualizado.');
        this.cargar();
      }
    });
  }

  private cargar() {
    const username = this.auth.currentUser()?.username;
    if (!username) return;
    this.loading.set(true);
    this.asignacionesService.list({ page: 0, size: 20, psicologoId: username }).subscribe({
      next: (response) => {
        this.asignaciones.set(response.content);
        this.loading.set(false);
      },
      error: () => {
        this.asignaciones.set([]);
        this.loading.set(false);
      }
    });
  }
}
