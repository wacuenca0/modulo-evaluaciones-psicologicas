import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import {
  ReporteHistorialFichaDTO,
  ReporteHistorialFichasFilters,
  ReporteHistorialFichasResponse,
  ReporteHistorialSeguimientoDTO
} from '../../models/reportes.models';

interface FiltroResumenItem {
  etiqueta: string;
  valor: string;
}

@Component({
  selector: 'app-historial-fichas-report',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Seguimiento clinico</p>
        <h1 class="text-3xl font-semibold text-slate-900">Historial de fichas por persona</h1>
        <p class="text-sm text-slate-500 max-w-3xl">
          Revisa las fichas activas e historicas de un mismo personal militar o dependiente, incluyendo seguimientos cuando corresponda.
        </p>
      </header>

      @if (error()) {
        <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="buscar()" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="grid gap-4 md:grid-cols-3">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 md:col-span-2">
            Identificador personal
            <input type="number" min="1" formControlName="personalMilitarId" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. 1001" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cédula
            <input type="text" maxlength="20" formControlName="cedula" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase tracking-wide focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. 0912345678" />
          </label>
          <label class="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <input type="checkbox" formControlName="incluirSeguimientos" class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
            Incluir seguimientos
          </label>
        </div>
        <div class="flex flex-wrap gap-3">
          <button type="submit" [disabled]="loading()" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {{ loading() ? 'Consultando...' : 'Buscar historial' }}
          </button>
          <button type="button" (click)="limpiar()" [disabled]="loading()" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
            Limpiar
          </button>
        </div>
      </form>

      @if (loading()) {
        <div class="space-y-3">
          @for (_ of [0, 1, 2]; track $index) {
            <div class="h-32 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else {
        <section class="space-y-6">
          @if (busquedaEjecutada() && sinResultados()) {
            <div class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No se registran fichas para la persona consultada.
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

            @if (fichasActuales().length) {
              <section class="space-y-4">
                <h2 class="text-lg font-semibold text-slate-900">Fichas vigentes</h2>
                <div class="grid gap-4 lg:grid-cols-2">
                  @for (ficha of fichasActuales(); track trackFicha(ficha)) {
                    <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <header class="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <p class="text-xs uppercase tracking-wide text-slate-500">Evaluación</p>
                          <p class="text-lg font-semibold text-slate-900">{{ ficha.numeroEvaluacion || '—' }}</p>
                        </div>
                        <span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          {{ ficha.estado || ficha.condicionClinica || 'Activa' }}
                        </span>
                      </header>
                      <dl class="space-y-2 text-sm text-slate-600">
                        <div class="flex items-start justify-between gap-4">
                          <dt class="font-semibold text-slate-700">Fecha</dt>
                          <dd>{{ formatearFecha(ficha.fechaEvaluacion) }}</dd>
                        </div>
                        <div class="flex items-start justify-between gap-4">
                          <dt class="font-semibold text-slate-700">Diagnóstico</dt>
                          <dd class="text-right">
                            <p class="font-semibold text-slate-900">{{ diagnosticoPrincipal(ficha) }}</p>
                            @if (ficha.diagnosticoDescripcion) {
                              <p class="text-xs text-slate-500">{{ ficha.diagnosticoDescripcion }}</p>
                            }
                          </dd>
                        </div>
                        <div class="flex items-start justify-between gap-4">
                          <dt class="font-semibold text-slate-700">Seguimientos</dt>
                          <dd>{{ ficha.totalSeguimientos ?? 0 }}</dd>
                        </div>
                      </dl>

                      @if (ficha.seguimientos?.length) {
                        <details class="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <summary class="cursor-pointer text-sm font-semibold text-slate-900">Ver seguimientos ({{ ficha.seguimientos?.length || 0 }})</summary>
                          <ul class="space-y-3 text-sm text-slate-600">
                            @for (seguimiento of ficha.seguimientos; track trackSeguimiento(seguimiento)) {
                              <li class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                                <p class="text-xs uppercase tracking-wide text-slate-500">{{ formatearFecha(seguimiento.fecha) }}</p>
                                <p class="mt-1 text-sm text-slate-700">{{ seguimiento.descripcion || 'Sin descripción' }}</p>
                                @if (seguimiento.registradoPor) {
                                  <p class="mt-1 text-xs text-slate-500">Registrado por {{ seguimiento.registradoPor }}</p>
                                }
                              </li>
                            }
                          </ul>
                        </details>
                      }
                    </article>
                  }
                </div>
              </section>
            }

            @if (fichasHistoricas().length) {
              <section class="space-y-4">
                <h2 class="text-lg font-semibold text-slate-900">Historial previo</h2>
                <div class="grid gap-4 lg:grid-cols-2">
                  @for (ficha of fichasHistoricas(); track trackFicha(ficha)) {
                    <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <header class="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <p class="text-xs uppercase tracking-wide text-slate-500">Evaluación</p>
                          <p class="text-lg font-semibold text-slate-900">{{ ficha.numeroEvaluacion || '—' }}</p>
                        </div>
                        <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {{ ficha.origen || 'Histórico' }}
                        </span>
                      </header>
                      <dl class="space-y-2 text-sm text-slate-600">
                        <div class="flex items-start justify-between gap-4">
                          <dt class="font-semibold text-slate-700">Fecha</dt>
                          <dd>{{ formatearFecha(ficha.fechaEvaluacion) }}</dd>
                        </div>
                        <div class="flex items-start justify-between gap-4">
                          <dt class="font-semibold text-slate-700">Condición</dt>
                          <dd>{{ ficha.condicionClinica || ficha.estado || 'Sin registro' }}</dd>
                        </div>
                        <div class="flex items-start justify-between gap-4">
                          <dt class="font-semibold text-slate-700">Diagnóstico</dt>
                          <dd class="text-right">
                            <p class="font-semibold text-slate-900">{{ diagnosticoPrincipal(ficha) }}</p>
                            @if (ficha.diagnosticoDescripcion) {
                              <p class="text-xs text-slate-500">{{ ficha.diagnosticoDescripcion }}</p>
                            }
                          </dd>
                        </div>
                      </dl>
                    </article>
                  }
                </div>
              </section>
            }
          }
        </section>
      }
    </section>
  `
})
export class HistorialFichasReportComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reportes = inject(ReportesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    personalMilitarId: this.fb.control('', { validators: [Validators.min(1)] }),
    cedula: this.fb.control('', { validators: [Validators.maxLength(20)] }),
    incluirSeguimientos: this.fb.control(false)
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultados = signal<ReporteHistorialFichaDTO[]>([]);
  readonly filtrosAplicados = signal<ReporteHistorialFichasFilters | null>(null);
  readonly busquedaEjecutada = signal(false);

  readonly filtrosResumen = computed<FiltroResumenItem[]>(() => {
    const filtros = this.filtrosAplicados();
    if (!filtros) {
      return [];
    }
    const resumen: FiltroResumenItem[] = [];
    if (typeof filtros.personalMilitarId === 'number' && Number.isFinite(filtros.personalMilitarId)) {
      resumen.push({ etiqueta: 'Personal', valor: String(filtros.personalMilitarId) });
    }
    if (filtros.cedula) {
      resumen.push({ etiqueta: 'Cédula', valor: filtros.cedula });
    }
    if (filtros.incluirSeguimientos !== undefined && filtros.incluirSeguimientos !== null) {
      resumen.push({ etiqueta: 'Seguimientos', valor: filtros.incluirSeguimientos ? 'Sí' : 'No' });
    }
    return resumen;
  });

  readonly fichasActuales = computed(() => this.resultados().filter(ficha => !this.esHistorica(ficha)));
  readonly fichasHistoricas = computed(() => this.resultados().filter(ficha => this.esHistorica(ficha)));
  readonly sinResultados = computed(() => !this.error() && !this.resultados().length);

  private readonly dateFormatter = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' });

  buscar() {
    if (this.loading()) {
      return;
    }

    const raw = this.form.getRawValue();
    const idRaw = String(raw.personalMilitarId ?? '').trim();
    const personalId = Number.parseInt(idRaw, 10);
    const cedula = String(raw.cedula ?? '').trim().toUpperCase();

    if ((!idRaw.length || Number.isNaN(personalId) || personalId <= 0) && !cedula.length) {
      this.error.set('Ingresa un identificador o una cédula para consultar el historial.');
      this.resultados.set([]);
      this.filtrosAplicados.set(null);
      this.busquedaEjecutada.set(false);
      return;
    }

    const incluirSeguimientos = raw.incluirSeguimientos === true;
    const filtros: ReporteHistorialFichasFilters = {
      personalMilitarId: Number.isFinite(personalId) && personalId > 0 ? personalId : undefined,
      cedula: cedula || undefined,
      incluirSeguimientos: incluirSeguimientos ? true : undefined
    };

    this.loading.set(true);
    this.error.set(null);

    this.reportes.obtenerHistorialFichas(filtros).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading.set(false);
        this.busquedaEjecutada.set(true);
      }),
      catchError(() => {
        const filtrosAplicados = this.toAppliedFilters(filtros);
        this.error.set('No fue posible obtener el historial. Intenta nuevamente.');
        this.resultados.set([]);
        this.filtrosAplicados.set(filtrosAplicados);
        return of<ReporteHistorialFichasResponse>({ resultados: [], filtros: filtrosAplicados });
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
    this.form.reset({ personalMilitarId: '', cedula: '', incluirSeguimientos: false });
    this.loading.set(false);
    this.error.set(null);
    this.resultados.set([]);
    this.filtrosAplicados.set(null);
    this.busquedaEjecutada.set(false);
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

  diagnosticoPrincipal(ficha: ReporteHistorialFichaDTO): string {
    if (ficha.diagnosticoCodigo && ficha.diagnosticoDescripcion) {
      return `${ficha.diagnosticoCodigo} · ${ficha.diagnosticoDescripcion}`;
    }
    return ficha.diagnosticoCodigo || ficha.diagnosticoDescripcion || 'Sin diagnóstico';
  }

  trackFicha(ficha: ReporteHistorialFichaDTO): string {
    const id = typeof ficha.fichaId === 'number' && Number.isFinite(ficha.fichaId) ? String(ficha.fichaId) : undefined;
    const numero = ficha.numeroEvaluacion?.trim();
    return id || numero || `${ficha.fechaEvaluacion ?? 'ficha'}-${ficha.diagnosticoCodigo ?? 'dx'}`;
  }

  trackSeguimiento(seguimiento: ReporteHistorialSeguimientoDTO): string {
    const id = typeof seguimiento.seguimientoId === 'number' && Number.isFinite(seguimiento.seguimientoId) ? String(seguimiento.seguimientoId) : undefined;
    return id || `${seguimiento.fecha ?? 'seguimiento'}-${seguimiento.descripcion ?? ''}`;
  }

  private esHistorica(ficha: ReporteHistorialFichaDTO): boolean {
    const origen = ficha.origen?.trim().toUpperCase();
    return origen === 'HISTORICO' || origen === 'HISTÓRICO';
  }

  private toAppliedFilters(filtros: ReporteHistorialFichasFilters): ReporteHistorialFichasFilters {
    return {
      personalMilitarId: filtros.personalMilitarId ?? null,
      cedula: filtros.cedula ?? null,
      incluirSeguimientos: filtros.incluirSeguimientos ?? false
    };
  }
}
