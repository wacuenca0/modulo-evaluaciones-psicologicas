import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import {
  ReportePersonalDiagnosticoDTO,
  ReportePersonalDiagnosticosFilters,
  ReportePersonalDiagnosticosResponse
} from '../../models/reportes.models';
import { Cie10LookupComponent } from '../shared/cie10-lookup.component';
import { CatalogoCIE10DTO } from '../../models/catalogo.models';

interface FiltroResumenItem {
  etiqueta: string;
  valor: string;
}

@Component({
  selector: 'app-personal-diagnosticos-report',
  imports: [CommonModule, ReactiveFormsModule, Cie10LookupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Inteligencia operativa</p>
        <h1 class="text-3xl font-semibold text-slate-900">Personal por diagnostico</h1>
        <p class="text-sm text-slate-500 max-w-3xl">
          Identifica las fichas psicologicas emitidas por diagnostico, grado y unidad militar para personal militar y dependientes activos.
        </p>
      </header>

      @if (error()) {
        <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="buscar()" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Fecha desde
            <input type="date" formControlName="fechaDesde" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Fecha hasta
            <input type="date" formControlName="fechaHasta" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Diagnóstico CIE-10
            <app-cie10-lookup
              formControlName="diagnosticoId"
              [helperText]="'Escribe al menos 3 caracteres para buscar en el catálogo.'"
              (selectionChange)="onDiagnosticoSelectionChange($event)"
            />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cédula
            <input type="text" maxlength="20" formControlName="cedula" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase tracking-wide focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. 0912345678" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Grado
            <input type="text" maxlength="60" formControlName="grado" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase tracking-wide focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. TCNL." />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 md:col-span-2 xl:col-span-1">
            Unidad militar
            <input type="text" maxlength="120" formControlName="unidadMilitar" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej. Hospital Militar Quito" />
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
          @for (_ of [0, 1, 2]; track $index) {
            <div class="h-32 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else {
        <section class="space-y-4">
          @if (busquedaEjecutada() && sinResultados()) {
            <div class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No se encontraron fichas con los criterios seleccionados.
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
                    <th class="px-4 py-3">Evaluacion</th>
                    <th class="px-4 py-3">Fecha</th>
                    <th class="px-4 py-3">Personal</th>
                    <th class="px-4 py-3">Unidad</th>
                    <th class="px-4 py-3">Diagnostico</th>
                    <th class="px-4 py-3">Psicologo</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (fila of resultados(); track trackFicha(fila)) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-900">{{ fila.numeroEvaluacion || '—' }}</p>
                        @if (fila.estadoFicha) {
                          <p class="text-xs uppercase tracking-wide text-slate-500">{{ fila.estadoFicha }}</p>
                        }
                      </td>
                      <td class="px-4 py-3 text-slate-600">{{ formatearFecha(fila.fechaEvaluacion) }}</td>
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-900">{{ nombrePersonal(fila) }}</p>
                        <p class="text-xs text-slate-500">
                          @if (fila.personalGrado) {<span class="uppercase tracking-wide">{{ fila.personalGrado }}</span>} @if (fila.personalCedula) {<span class="ml-2">{{ fila.personalCedula }}</span>}
                        </p>
                      </td>
                      <td class="px-4 py-3 text-slate-600">{{ fila.personalUnidadMilitar || '—' }}</td>
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-900">{{ diagnosticoPrincipal(fila) }}</p>
                        @if (fila.diagnosticoDescripcion) {
                          <p class="text-xs text-slate-500">{{ fila.diagnosticoDescripcion }}</p>
                        }
                      </td>
                      <td class="px-4 py-3">
                        <p class="font-semibold text-slate-900">{{ psicologoPrincipal(fila) }}</p>
                        @if (fila.psicologoUnidadMilitar) {
                          <p class="text-xs text-slate-500">{{ fila.psicologoUnidadMilitar }}</p>
                        }
                      </td>
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
export class PersonalDiagnosticosReportComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reportes = inject(ReportesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    fechaDesde: this.fb.control(''),
    fechaHasta: this.fb.control(''),
    diagnosticoId: this.fb.control(''),
    cedula: this.fb.control('', { validators: [Validators.maxLength(20)] }),
    grado: this.fb.control('', { validators: [Validators.maxLength(60)] }),
    unidadMilitar: this.fb.control('', { validators: [Validators.maxLength(120)] })
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultados = signal<ReportePersonalDiagnosticoDTO[]>([]);
  readonly filtrosAplicados = signal<ReportePersonalDiagnosticosFilters | null>(null);
  readonly busquedaEjecutada = signal(false);
  readonly diagnosticoSeleccionado = signal<CatalogoCIE10DTO | null>(null);
  readonly diagnosticoEtiqueta = computed(() => {
    const seleccionado = this.diagnosticoSeleccionado();
    if (!seleccionado) {
      return null;
    }
    const codigo = seleccionado.codigo?.trim() ?? '';
    const descripcion = seleccionado.descripcion?.trim() ?? '';
    if (codigo && descripcion) {
      return `${codigo} · ${descripcion}`;
    }
    return codigo || descripcion || null;
  });
  readonly filtrosResumen = computed<FiltroResumenItem[]>(() => {
    const filtros = this.filtrosAplicados();
    if (!filtros) {
      return [];
    }
    const resumen: FiltroResumenItem[] = [];
    if (filtros.fechaDesde) {
      resumen.push({ etiqueta: 'Fecha desde', valor: filtros.fechaDesde });
    }
    if (filtros.fechaHasta) {
      resumen.push({ etiqueta: 'Fecha hasta', valor: filtros.fechaHasta });
    }
    if (filtros.diagnosticoId !== null && filtros.diagnosticoId !== undefined) {
      const etiqueta = this.diagnosticoEtiqueta();
      resumen.push({ etiqueta: 'Diagnóstico', valor: etiqueta ?? `ID ${filtros.diagnosticoId}` });
    }
    if (filtros.cedula) {
      resumen.push({ etiqueta: 'Cédula', valor: filtros.cedula });
    }
    if (filtros.grado) {
      resumen.push({ etiqueta: 'Grado', valor: filtros.grado });
    }
    if (filtros.unidadMilitar) {
      resumen.push({ etiqueta: 'Unidad militar', valor: filtros.unidadMilitar });
    }
    return resumen;
  });
  readonly sinResultados = computed(() => !this.error() && !this.resultados().length);

  private readonly dateFormatter = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' });
  private readonly isInitialized = signal(false);

  constructor() {
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

    const filtros: ReportePersonalDiagnosticosFilters = {
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      diagnosticoId: this.parseId(raw.diagnosticoId),
      cedula: raw.cedula.trim().toUpperCase() || undefined,
      grado: raw.grado.trim().toUpperCase() || undefined,
      unidadMilitar: raw.unidadMilitar.trim() || undefined
    };

    this.loading.set(true);
    this.error.set(null);

    this.reportes.obtenerPersonalDiagnosticos(filtros).pipe(
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
        return of<ReportePersonalDiagnosticosResponse>({ resultados: [], filtros: filtrosAplicados });
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
    this.form.reset({
      fechaDesde: '',
      fechaHasta: '',
      diagnosticoId: '',
      cedula: '',
      grado: '',
      unidadMilitar: ''
    });
    this.resultados.set([]);
    this.filtrosAplicados.set(null);
    this.busquedaEjecutada.set(false);
    this.error.set(null);
    this.diagnosticoSeleccionado.set(null);
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

  nombrePersonal(fila: ReportePersonalDiagnosticoDTO): string {
    return fila.personalNombreCompleto?.trim() || fila.personalNombre?.trim() || 'Personal';
  }

  diagnosticoPrincipal(fila: ReportePersonalDiagnosticoDTO): string {
    if (fila.diagnosticoCodigo && fila.diagnosticoDescripcion) {
      return `${fila.diagnosticoCodigo} · ${fila.diagnosticoDescripcion}`;
    }
    return fila.diagnosticoCodigo || fila.diagnosticoDescripcion || '—';
  }

  psicologoPrincipal(fila: ReportePersonalDiagnosticoDTO): string {
    return fila.psicologoNombre?.trim() || '—';
  }

  trackFicha(fila: ReportePersonalDiagnosticoDTO): string {
    const id = typeof fila.fichaId === 'number' && Number.isFinite(fila.fichaId) ? String(fila.fichaId) : undefined;
    const numero = fila.numeroEvaluacion?.trim();
    return id || numero || `${fila.personalId ?? 'fila'}-${fila.diagnosticoCodigo ?? 'diag'}`;
  }

  private toAppliedFilters(filtros: ReportePersonalDiagnosticosFilters): ReportePersonalDiagnosticosFilters {
    return {
      fechaDesde: filtros.fechaDesde ?? null,
      fechaHasta: filtros.fechaHasta ?? null,
      diagnosticoId: filtros.diagnosticoId ?? null,
      cedula: filtros.cedula ?? null,
      grado: filtros.grado ?? null,
      unidadMilitar: filtros.unidadMilitar ?? null
    };
  }

  private parseId(raw: string): number | undefined {
    const value = raw?.trim();
    if (!value?.length) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  onDiagnosticoSelectionChange(opcion: CatalogoCIE10DTO | null) {
    this.diagnosticoSeleccionado.set(opcion ?? null);
  }
}
