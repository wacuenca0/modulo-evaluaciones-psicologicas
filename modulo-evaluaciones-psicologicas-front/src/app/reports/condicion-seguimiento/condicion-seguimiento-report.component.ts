import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import {
  ReporteCondicionSeguimientoDTO,
  ReporteCondicionSeguimientoFilters,
  ReporteCondicionSeguimientoResponse
} from '../../models/reportes.models';
import { AuthService } from '../../services/auth.service';
import { PsicologosLookupService, PsicologoOption } from '../shared/psicologos-lookup.service';

interface FiltroResumenItem {
  etiqueta: string;
  valor: string;
}

@Component({
  selector: 'app-condicion-seguimiento-report',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Alertas clinicas</p>
        <h1 class="text-3xl font-semibold text-slate-900">Condición Seguimiento o Transferencia</h1>
        <p class="text-sm text-slate-500 max-w-3xl">
          Monitorea las fichas que permanecen en seguimiento o transferencia, con detalle del psicologo responsable y el ultimo contacto.
        </p>
      </header>

      @if (error()) {
        <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="buscar()" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Psicologo
            <select formControlName="psicologoId" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" [disabled]="form.controls.psicologoId.disabled">
              <option value="">Todos</option>
              @for (opcion of psicologos(); track opcion.id) {
                <option [value]="opcion.id">{{ opcion.nombre }}</option>
              }
            </select>
            @if (psicologosCargando()) {
              <p class="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Cargando listado...</p>
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
            Cédula
            <input type="text" maxlength="20" formControlName="cedula" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase tracking-wide focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. 0912345678" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Unidad militar
            <input type="text" maxlength="120" formControlName="unidadMilitar" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. B.I. Latacunga" />
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
              No hay fichas en condición seguimiento o transferencia para los filtros aplicados.
            </div>
          } @else {
            @if (filtrosResumen().length) {
              <div class="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                @for (filtro of filtrosResumen(); track filtro.etiqueta) {
                  <span class="rounded-full bg-white px-3 py-1 shadow-sm">
                    <span class="font-semibold text-slate-700">{{ filtro.etiqueta }}:</span> {{ filtro.valor }}
                  </span>
                }
              </div>
            }

            <div class="overflow-x-auto">
              <table class="w-full min-w-[900px] divide-y divide-slate-200 text-sm">
                <thead>
                  <tr class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <th class="px-4 py-3">Psicologo</th>
                    <th class="px-4 py-3">Personal</th>
                    <th class="px-4 py-3">Ficha</th>
                    <th class="px-4 py-3">Condicion</th>
                    <th class="px-4 py-3 text-right">Seguimientos</th>
                    <th class="px-4 py-3">Evaluacion</th>
                    <th class="px-4 py-3">Ultimo contacto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (fila of resultados(); track trackFila(fila)) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-900">{{ fila.psicologoNombre || '—' }}</p>
                        @if (fila.psicologoUnidadMilitar) {
                          <p class="text-xs text-slate-500">{{ fila.psicologoUnidadMilitar }}</p>
                        }
                      </td>
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-900">{{ fila.personalNombre || '—' }}</p>
                        <p class="text-xs text-slate-500">
                          @if (fila.personalGrado) {<span class="uppercase tracking-wide">{{ fila.personalGrado }}</span>}
                          @if (fila.personalCedula) {<span class="ml-2">{{ fila.personalCedula }}</span>}
                          @if (fila.personalUnidadMilitar) {
                            <span class="ml-2">{{ fila.personalUnidadMilitar }}</span>
                          }
                        </p>
                      </td>
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-900">{{ fila.numeroEvaluacion || fila.fichaId || '—' }}</p>
                        <p class="text-xs text-slate-500">ID {{ fila.fichaId ?? '—' }}</p>
                      </td>
                      <td class="px-4 py-3">
                        <span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          {{ fila.condicion || 'Seguimiento' }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right font-semibold text-slate-900">{{ fila.totalSeguimientos ?? 0 }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ formatearFecha(fila.fechaEvaluacion) }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ formatearFecha(fila.ultimaFechaSeguimiento) }}</td>
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
export class CondicionSeguimientoReportComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reportes = inject(ReportesService);
  private readonly auth = inject(AuthService);
  private readonly psicologosLookup = inject(PsicologosLookupService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    psicologoId: this.fb.control(''),
    fechaDesde: this.fb.control(''),
    fechaHasta: this.fb.control(''),
    cedula: this.fb.control('', { validators: [Validators.maxLength(20)] }),
    unidadMilitar: this.fb.control('', { validators: [Validators.maxLength(120)] })
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultados = signal<ReporteCondicionSeguimientoDTO[]>([]);
  readonly psicologos = signal<PsicologoOption[]>([]);
  readonly psicologosCargando = signal(false);
  readonly busquedaEjecutada = signal(false);
  readonly psicologoForzado = signal<string | null>(null);
  readonly filtrosAplicados = signal<ReporteCondicionSeguimientoFilters | null>(null);

  readonly filtrosResumen = computed<FiltroResumenItem[]>(() => {
    const filtros = this.filtrosAplicados();
    if (!filtros) {
      return [];
    }
    const resumen: FiltroResumenItem[] = [];
    if (filtros.psicologoId !== null && filtros.psicologoId !== undefined) {
      const psicologo = this.psicologos().find(op => op.id === filtros.psicologoId);
      resumen.push({ etiqueta: 'Psicólogo', valor: psicologo?.nombre ?? String(filtros.psicologoId) });
    }
    if (filtros.fechaDesde) {
      resumen.push({ etiqueta: 'Fecha desde', valor: filtros.fechaDesde });
    }
    if (filtros.fechaHasta) {
      resumen.push({ etiqueta: 'Fecha hasta', valor: filtros.fechaHasta });
    }
    if (filtros.cedula) {
      resumen.push({ etiqueta: 'Cédula', valor: filtros.cedula });
    }
    if (filtros.unidadMilitar) {
      resumen.push({ etiqueta: 'Unidad militar', valor: filtros.unidadMilitar });
    }
    return resumen;
  });

  readonly sinResultados = computed(() => !this.error() && !this.resultados().length);

  private readonly dateFormatter = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
  private readonly isInitialized = signal(false);

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

    const cedula = raw.cedula.trim().toUpperCase();
    const unidad = raw.unidadMilitar.trim();
    const psicologoRaw = raw.psicologoId.trim();
    const psicologoId = psicologoRaw.length ? Number(psicologoRaw) : null;

    const filtros: ReporteCondicionSeguimientoFilters = {
      psicologoId: Number.isFinite(psicologoId) ? psicologoId : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      cedula: cedula || undefined,
      unidadMilitar: unidad || undefined
    };

    this.loading.set(true);
    this.error.set(null);

    this.reportes.obtenerCondicionSeguimiento(filtros).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading.set(false);
        this.busquedaEjecutada.set(true);
      }),
      catchError(() => {
        const filtrosAplicados = this.toAppliedFilters(filtros);
        this.error.set('No fue posible obtener el reporte. Intenta nuevamente.');
        this.resultados.set([]);
        this.filtrosAplicados.set(filtrosAplicados);
        return of<ReporteCondicionSeguimientoResponse>({ resultados: [], filtros: filtrosAplicados });
      })
    ).subscribe(respuesta => {
      if (!respuesta) {
        this.resultados.set([]);
        this.filtrosAplicados.set(this.toAppliedFilters(filtros));
        return;
      }
      this.resultados.set(Array.isArray(respuesta.resultados) ? respuesta.resultados : []);
      this.filtrosAplicados.set(respuesta.filtros ?? this.toAppliedFilters(filtros));
    });
  }

  limpiar() {
    const forced = this.psicologoForzado();
    this.form.patchValue({
      psicologoId: forced ?? '',
      fechaDesde: '',
      fechaHasta: '',
      cedula: '',
      unidadMilitar: ''
    });
    if (forced === null && this.form.controls.psicologoId.disabled) {
      this.form.controls.psicologoId.enable({ emitEvent: false });
    }
    if (forced !== null && !this.form.controls.psicologoId.disabled) {
      this.form.controls.psicologoId.disable({ emitEvent: false });
    }
    this.resultados.set([]);
    this.filtrosAplicados.set(null);
    this.error.set(null);
    this.busquedaEjecutada.set(false);
    this.buscar();
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) {
      return 'Sin registros';
    }
    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) {
      return fecha;
    }
    return this.dateFormatter.format(parsed);
  }

  trackFila(fila: ReporteCondicionSeguimientoDTO): string {
    const id = typeof fila.fichaId === 'number' && Number.isFinite(fila.fichaId) ? String(fila.fichaId) : undefined;
    const numero = fila.numeroEvaluacion?.trim();
    return id || numero || `${fila.personalId ?? 'fila'}-${fila.psicologoId ?? 'psicologo'}`;
  }

  private cargarPsicologos() {
    this.psicologosCargando.set(true);
    this.psicologosLookup.obtenerOpciones().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.psicologosCargando.set(false))
    ).subscribe(list => {
      this.psicologos.set(list);
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

  private toAppliedFilters(filtros: ReporteCondicionSeguimientoFilters): ReporteCondicionSeguimientoFilters {
    return {
      psicologoId: filtros.psicologoId ?? null,
      fechaDesde: filtros.fechaDesde ?? null,
      fechaHasta: filtros.fechaHasta ?? null,
      cedula: filtros.cedula ?? null,
      unidadMilitar: filtros.unidadMilitar ?? null
    };
  }
}
