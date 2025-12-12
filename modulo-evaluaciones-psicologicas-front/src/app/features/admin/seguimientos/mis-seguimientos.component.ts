import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SeguimientosService } from '../../../services/seguimientos.service';
import { AuthService } from '../../../services/auth.service';
import { SeguimientoDTO } from '../../../models/seguimiento.models';

@Component({
  selector: 'app-mis-seguimientos',
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Seguimiento personal</p>
        <h1 class="text-2xl font-semibold text-slate-900">Mis seguimientos</h1>
        <p class="text-sm text-slate-500">Sesiones clínicas registradas bajo tu responsabilidad.</p>
      </header>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Cargando seguimiento...</div>
      } @else if (!seguimientos().length) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Aún no se han registrado seguimientos.</div>
      } @else {
        <div class="grid gap-4 md:grid-cols-2">
          @for (item of seguimientos(); track item.id) {
            <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-slate-900">Ficha {{ item.fichaId }}</p>
                <span class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{{ item.estado }}</span>
              </div>
              <p class="text-xs text-slate-500">Sesión registrada el {{ item.fecha | date:'mediumDate' }}</p>
              <p class="text-sm text-slate-700">{{ item.observaciones || 'Sin observaciones registradas.' }}</p>
              <p class="text-xs text-slate-500">Próxima cita: {{ item.proximaCita ? (item.proximaCita | date:'shortDate') : 'No programada' }}</p>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class MisSeguimientosComponent implements OnInit {
  private readonly seguimientosService = inject(SeguimientosService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly seguimientos = signal<SeguimientoDTO[]>([]);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar() {
    const username = this.auth.currentUser()?.username;
    if (!username) return;
    this.loading.set(true);
    this.seguimientosService.list({ page: 0, size: 25, psicologoId: username }).subscribe({
      next: (response) => {
        this.seguimientos.set(response.content);
        this.loading.set(false);
      },
      error: () => {
        this.seguimientos.set([]);
        this.loading.set(false);
      }
    });
  }
}
