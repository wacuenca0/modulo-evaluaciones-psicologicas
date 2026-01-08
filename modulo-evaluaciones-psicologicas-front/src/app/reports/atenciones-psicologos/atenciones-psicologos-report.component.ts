import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import { ReporteAtencionPsicologoDTO } from '../../models/reportes.models';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserDTO } from '../../models/auth.models';

interface PsicologoOption {
  id: number;
  nombre: string;
  username: string;
}

interface ReporteTotales {
  fichas: number;
  activas: number;
  observacion: number;
  seguimientos: number;
  personas: number;
}

@Component({
  selector: 'app-atenciones-psicologos-report',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Inteligencia operativa</p>
        <h1 class="text-3xl font-semibold text-slate-900">Reporte de atenciones por psicologos</h1>
        <p class="text-sm text-slate-500 max-w-3xl">
          Consulta el volumen de fichas clinicas creadas, su distribucion por estado y la actividad de seguimiento por cada psicologo.
        </p>
      </header>

      @if (error()) {
        <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="buscar()" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Psicologo
            <select formControlName="psicologoId" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" [disabled]="form.controls.psicologoId.disabled">
              <option value="">Todos</option>
              @for (opcion of psicologos(); track opcion.id) {
                <option [value]="opcion.id">{{ opcion.nombre }}</option>
              }
            </select>
            @if (psicologosCargando()) {
              <p class="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Cargando listado de psicologos...</p>
            } @else if (!psicologos().length) {
              <p class="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Sin registros disponibles.</p>
            }
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Fecha desde
            <input type="date" formControlName="fechaDesde" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Fecha hasta
            <input type="date" formControlName="fechaHasta" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Diagnostico (CIE10)
            <input type="text" maxlength="20" formControlName="diagnosticoCodigo" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase tracking-wide focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. F41.1" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 md:col-span-2 xl:col-span-1">
            Unidad militar
            <input type="text" maxlength="120" formControlName="unidadMilitar" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. Hospital Militar" />
          </label>
        </div>
        <div class="flex flex-wrap gap-3">
          <button type="submit" [disabled]="loading()" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {{ loading() ? 'Consultando...' : 'Aplicar filtros' }}
          </button>
          <button type="button" (click)="limpiar()" [disabled]="loading()" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
            Limpiar
          </button>
        </div>
      </form>

      @if (loading()) {
        <div class="space-y-3">
          @for (_ of [0, 1]; track $index) {
            <div class="h-32 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else {
        <section class="space-y-4">
          @if (busquedaEjecutada() && sinResultados()) {
            <div class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No se encontraron registros para los filtros proporcionados.
            </div>
          } @else {
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total fichas</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">{{ totales().fichas }}</p>
              </article>
              <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Activas</p>
                <p class="mt-2 text-2xl font-semibold text-emerald-600">{{ totales().activas }}</p>
              </article>
              <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Observacion</p>
                <p class="mt-2 text-2xl font-semibold text-sky-600">{{ totales().observacion }}</p>
              </article>
              <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Seguimientos</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">{{ totales().seguimientos }}</p>
              </article>
              <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Personas atendidas</p>
                <p class="mt-2 text-2xl font-semibold text-slate-900">{{ totales().personas }}</p>
              </article>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[760px] divide-y divide-slate-200 text-sm">
                <thead>
                  <tr class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <th class="px-4 py-3">Psicologo</th>
                    <th class="px-4 py-3 text-right">Fichas</th>
                    <th class="px-4 py-3 text-right">Activas</th>
                    <th class="px-4 py-3 text-right">Observacion</th>
                    <th class="px-4 py-3 text-right">Seguimientos</th>
                    <th class="px-4 py-3 text-right">Personas unicas</th>
                    <th class="px-4 py-3">Ultima atencion</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (fila of resultados(); track fila.psicologoId) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-900">{{ fila.psicologoNombre || fila.psicologoUsername }}</p>
                        <p class="text-xs text-slate-500">{{ fila.psicologoUsername }}</p>
                      </td>
                      <td class="px-4 py-3 text-right font-semibold text-slate-900">{{ fila.totalFichas }}</td>
                      <td class="px-4 py-3 text-right text-emerald-600">{{ fila.fichasActivas }}</td>
                      <td class="px-4 py-3 text-right text-sky-600">{{ fila.fichasObservacion }}</td>
                      <td class="px-4 py-3 text-right">{{ fila.totalSeguimientos }}</td>
                      <td class="px-4 py-3 text-right">{{ fila.personasAtendidas }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ formatearFecha(fila.ultimaAtencion) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }
    </section>
  `
})
export class AtencionesPsicologosReportComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reportesService = inject(ReportesService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    psicologoId: this.fb.control(''),
    fechaDesde: this.fb.control(''),
    fechaHasta: this.fb.control(''),
    diagnosticoCodigo: this.fb.control('', { validators: [Validators.maxLength(20)] }),
    unidadMilitar: this.fb.control('', { validators: [Validators.maxLength(120)] })
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultados = signal<ReporteAtencionPsicologoDTO[]>([]);
  readonly psicologos = signal<PsicologoOption[]>([]);
  readonly psicologosCargando = signal(false);
  readonly busquedaEjecutada = signal(false);
  readonly psicologoForzado = signal<string | null>(null);

  private readonly dateFormatter = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
  private readonly isInitialized = signal(false);

  readonly sinResultados = computed(() => !this.error() && !this.resultados().length);
  readonly totales = computed<ReporteTotales>(() => {
    const data = this.resultados();
    return data.reduce<ReporteTotales>((acc, fila) => ({
      fichas: acc.fichas + this.asNumber(fila.totalFichas),
      activas: acc.activas + this.asNumber(fila.fichasActivas),
      observacion: acc.observacion + this.asNumber(fila.fichasObservacion),
      seguimientos: acc.seguimientos + this.asNumber(fila.totalSeguimientos),
      personas: acc.personas + this.asNumber(fila.personasAtendidas)
    }), { fichas: 0, activas: 0, observacion: 0, seguimientos: 0, personas: 0 });
  });

  constructor() {
    this.cargarPsicologos();

    effect(() => {
      const esPsicologo = this.auth.isPsicologo();
      const usuario = this.auth.currentUser();
      const opciones = this.psicologos();
      if (!esPsicologo) {
        this.psicologoForzado.set(null);
        if (this.form.controls.psicologoId.disabled) {
          this.form.controls.psicologoId.enable({ emitEvent: false });
        }
        return;
      }
      const forcedId = this.resolvePsicologoId(usuario?.id, usuario?.username, opciones);
      const forcedValue = forcedId !== null ? String(forcedId) : '';
      this.psicologoForzado.set(forcedId !== null ? forcedValue : null);
      if (this.form.controls.psicologoId.value !== forcedValue) {
        this.form.controls.psicologoId.setValue(forcedValue, { emitEvent: false });
      }
      if (!this.form.controls.psicologoId.disabled) {
        this.form.controls.psicologoId.disable({ emitEvent: false });
      }
    });

    queueMicrotask(() => {
      this.isInitialized.set(true);
      this.buscar();
    });
  }

  buscar() {
    if (!this.isInitialized()) {
      return;
    }

    const raw = this.form.getRawValue();
    const fechaDesde = raw.fechaDesde.trim();
    const fechaHasta = raw.fechaHasta.trim();

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      this.error.set('La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }

    const diagnostico = raw.diagnosticoCodigo.trim().toUpperCase();
    const unidad = raw.unidadMilitar.trim();
    const psicologoVal = raw.psicologoId.trim();
    const psicologoId = psicologoVal.length ? Number(psicologoVal) : null;

    this.error.set(null);
    this.loading.set(true);

    this.reportesService.obtenerAtencionesPorPsicologos({
      psicologoId: Number.isFinite(psicologoId) ? psicologoId : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      diagnosticoCodigo: diagnostico || undefined,
      unidadMilitar: unidad || undefined
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading.set(false);
        this.busquedaEjecutada.set(true);
      }),
      catchError(err => {
        this.error.set('No fue posible obtener el reporte. Intenta nuevamente.');
        this.resultados.set([]);
        return of<ReporteAtencionPsicologoDTO[]>([]);
      })
    ).subscribe(res => {
      this.resultados.set(Array.isArray(res) ? res : []);
    });
  }

  limpiar() {
    const forced = this.psicologoForzado();
    this.form.patchValue({
      psicologoId: forced ?? '',
      fechaDesde: '',
      fechaHasta: '',
      diagnosticoCodigo: '',
      unidadMilitar: ''
    });
    if (forced === null && this.form.controls.psicologoId.disabled) {
      this.form.controls.psicologoId.enable({ emitEvent: false });
    }
    if (forced !== null && !this.form.controls.psicologoId.disabled) {
      this.form.controls.psicologoId.disable({ emitEvent: false });
    }
    this.error.set(null);
    this.resultados.set([]);
    this.busquedaEjecutada.set(false);
    this.buscar();
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) {
      return 'Sin registros';
    }
    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) {
      return fecha;
    }
    return this.dateFormatter.format(parsed);
  }

  private cargarPsicologos() {
    this.psicologosCargando.set(true);
    this.userService.list().pipe(
      takeUntilDestroyed(this.destroyRef),
      map(users => users.filter(user => Array.isArray(user.roles) && user.roles.includes('ROLE_PSICOLOGO'))),
      map(lista => lista.map(user => this.buildPsicologoOption(user)).filter((opcion): opcion is PsicologoOption => opcion !== null)),
      catchError(() => of<PsicologoOption[]>([])),
      finalize(() => this.psicologosCargando.set(false))
    ).subscribe(list => {
      const ordenado = [...list].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
      this.psicologos.set(ordenado);
    });
  }

  private resolvePsicologoId(id?: number | null, username?: string | null | undefined, opciones: PsicologoOption[] = []): number | null {
    if (typeof id === 'number' && Number.isFinite(id)) {
      return Number(id);
    }
    if (username) {
      const normalizado = username.trim().toLowerCase();
      const coincidencia = opciones.find(op => op.username.trim().toLowerCase() === normalizado);
      if (coincidencia) {
        return Number(coincidencia.id);
      }
    }
    return null;
  }

  private buildPsicologoOption(user: UserDTO): PsicologoOption | null {
    const idValue = typeof user.id === 'number' ? user.id : Number(user.id ?? Number.NaN);
    if (!Number.isFinite(idValue)) {
      return null;
    }
    const username = user.username?.trim();
    if (!username?.length) {
      return null;
    }
    return {
      id: Number(idValue),
      nombre: this.nombreVisible(user),
      username
    };
  }

  private nombreVisible(user: UserDTO): string {
    const username = user.username?.trim() ?? '';
    const email = user.email?.trim() ?? '';
    if (username && email) {
      return `${username} (${email})`;
    }
    return username || email || 'Psicologo';
  }

  private asNumber(value: number | null | undefined): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    const parsed = Number(value ?? Number.NaN);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
