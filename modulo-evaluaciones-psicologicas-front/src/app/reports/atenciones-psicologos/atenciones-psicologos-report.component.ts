import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReportesService } from '../../services/reportes.service';
import {
  ReporteAtencionPsicologoDTO,
  ReporteAtencionesAppliedFilters,
  ReporteAtencionesFilters,
  ReporteAtencionesResponse,
  ReporteAtencionesTotales
} from '../../models/reportes.models';
import { PsicologosLookupService, PsicologoOption } from '../shared/psicologos-lookup.service';
import { AuthService } from '../../services/auth.service';
import { Cie10LookupComponent } from '../shared/cie10-lookup.component';
import { CatalogoCIE10DTO } from '../../models/catalogo.models';
import { Cie10CacheService } from '../shared/cie10-cache.service';

@Component({
  selector: 'app-atenciones-psicologos-report',
  imports: [CommonModule, ReactiveFormsModule, Cie10LookupComponent],
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
  private readonly psicologosLookup = inject(PsicologosLookupService);
  private readonly auth = inject(AuthService);
  private readonly cie10Cache = inject(Cie10CacheService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    psicologoId: this.fb.control(''),
    fechaDesde: this.fb.control(''),
    fechaHasta: this.fb.control(''),
    diagnosticoId: this.fb.control(''),
    cedula: this.fb.control('', { validators: [Validators.maxLength(20)] }),
    unidadMilitar: this.fb.control('', { validators: [Validators.maxLength(120)] })
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultados = signal<ReporteAtencionPsicologoDTO[]>([]);
  readonly totales = signal<ReporteAtencionesTotales>(this.createTotales());
  readonly psicologos = signal<PsicologoOption[]>([]);
  readonly psicologosCargando = signal(false);
  readonly busquedaEjecutada = signal(false);
  readonly psicologoForzado = signal<string | null>(null);
  readonly filtrosAplicados = signal<ReporteAtencionesAppliedFilters | null>(null);
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

  readonly filtrosResumen = computed(() => {
    const filtros = this.filtrosAplicados();
    if (!filtros) {
      return [] as { etiqueta: string; valor: string }[];
    }
    const resumen: { etiqueta: string; valor: string }[] = [];
    if (filtros.psicologoId !== null && filtros.psicologoId !== undefined) {
      const psicologo = this.psicologos().find(opcion => opcion.id === filtros.psicologoId);
      if (psicologo) {
        resumen.push({ etiqueta: 'Psicólogo', valor: psicologo.nombre });
      } else {
        resumen.push({ etiqueta: 'Psicólogo', valor: String(filtros.psicologoId) });
      }
    }
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
    if (filtros.unidadMilitar) {
      resumen.push({ etiqueta: 'Unidad militar', valor: filtros.unidadMilitar });
    }
    return resumen;
  });

  private readonly dateFormatter = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
  private readonly isInitialized = signal(false);

  readonly sinResultados = computed(() => !this.error() && !this.resultados().length);
  private createTotales(): ReporteAtencionesTotales {
    return { fichas: 0, activas: 0, observacion: 0, seguimientos: 0, personas: 0 };
  }

  private toAppliedFilters(filtros: ReporteAtencionesFilters): ReporteAtencionesAppliedFilters {
    return {
      psicologoId: typeof filtros.psicologoId === 'number' && Number.isFinite(filtros.psicologoId) ? filtros.psicologoId : null,
      fechaDesde: filtros.fechaDesde ?? null,
      fechaHasta: filtros.fechaHasta ?? null,
      diagnosticoId: filtros.diagnosticoId ?? null,
      cedula: filtros.cedula ?? null,
      unidadMilitar: filtros.unidadMilitar ?? null
    };
  }

  constructor() {
    this.cargarPsicologos();
    this.syncDiagnosticoDesdeFiltros();

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

    const diagnosticoValor = raw.diagnosticoId.trim();
    const diagnosticoId = diagnosticoValor.length ? Number(diagnosticoValor) : null;
    const cedula = raw.cedula.trim().toUpperCase();
    const unidad = raw.unidadMilitar.trim();
    const psicologoVal = raw.psicologoId.trim();
    const psicologoId = psicologoVal.length ? Number(psicologoVal) : null;

    this.error.set(null);
    this.loading.set(true);

    const filtrosConsulta: ReporteAtencionesFilters = {
      psicologoId: Number.isFinite(psicologoId) ? psicologoId : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      diagnosticoId: Number.isFinite(diagnosticoId) ? diagnosticoId : undefined,
      cedula: cedula || undefined,
      unidadMilitar: unidad || undefined
    };

    this.reportesService.obtenerAtencionesPorPsicologos(filtrosConsulta).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading.set(false);
        this.busquedaEjecutada.set(true);
      }),
      catchError(() => {
        const totalesVacios = this.createTotales();
        const filtrosAplicados = this.toAppliedFilters(filtrosConsulta);
        this.error.set('No fue posible obtener el reporte. Intenta nuevamente.');
        this.resultados.set([]);
        this.totales.set({ ...totalesVacios });
        this.filtrosAplicados.set(filtrosAplicados);
        return of<ReporteAtencionesResponse>({ resultados: [], totales: { ...totalesVacios }, filtros: filtrosAplicados });
      })
    ).subscribe(res => {
      if (!res) {
        this.resultados.set([]);
        this.totales.set(this.createTotales());
        this.filtrosAplicados.set(this.toAppliedFilters(filtrosConsulta));
        return;
      }
      if (Array.isArray(res)) {
        this.resultados.set(res);
        this.totales.set(this.createTotales());
        this.filtrosAplicados.set(this.toAppliedFilters(filtrosConsulta));
        return;
      }
      this.resultados.set(Array.isArray(res.resultados) ? res.resultados : []);
      const totales = res.totales ?? this.createTotales();
      this.totales.set({ ...totales });
      this.filtrosAplicados.set(res.filtros ?? this.toAppliedFilters(filtrosConsulta));
    });
  }

  limpiar() {
    const forced = this.psicologoForzado();
    this.form.patchValue({
      psicologoId: forced ?? '',
      fechaDesde: '',
      fechaHasta: '',
      diagnosticoId: '',
      cedula: '',
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
    this.totales.set(this.createTotales());
    this.filtrosAplicados.set(null);
    this.busquedaEjecutada.set(false);
    this.diagnosticoSeleccionado.set(null);
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

  onDiagnosticoSelectionChange(opcion: CatalogoCIE10DTO | null) {
    this.diagnosticoSeleccionado.set(opcion ?? null);
  }

  private syncDiagnosticoDesdeFiltros() {
    effect(() => {
      const applied = this.filtrosAplicados();
      const diagnosticoId = applied?.diagnosticoId ?? null;
      const seleccionadoId = this.diagnosticoSeleccionado()?.id ?? null;

      if (diagnosticoId === null) {
        if (seleccionadoId !== null) {
          this.diagnosticoSeleccionado.set(null);
        }
        return;
      }

      if (seleccionadoId === diagnosticoId) {
        return;
      }

      this.cie10Cache
        .obtenerPorId(diagnosticoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(item => {
          if (item && item.id === diagnosticoId) {
            this.diagnosticoSeleccionado.set(item);
          }
        });
    });
  }

}
