import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonalMilitarService } from '../../services/personal-militar.service';
import { PersonalMilitarDTO } from '../../models/personal-militar.models';
import { FichasPsicologicasService } from '../../services/fichas-psicologicas.service';
import { FichaPsicologicaHistorialDTO } from '../../models/fichas-psicologicas.models';
import { catchError, forkJoin, of, throwError } from 'rxjs';

@Component({
  selector: 'app-personal-historial',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Gestion clinica</p>
          <h1 class="text-3xl font-semibold text-slate-900">Historial clinico</h1>
          <p class="text-sm text-slate-500 max-w-3xl">Revisa la informacion del personal y el historial de fichas psicologicas generadas.</p>
        </div>
        <a routerLink="/psicologo/personal" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Volver al listado</a>
      </header>

      @if (mensaje()) {
        <div class="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{{ mensaje() }}</span>
          <span aria-hidden="true" class="inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-500"></span>
        </div>
      }

      @if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
      }

      @if (cargando()) {
        <div class="space-y-3">
          @for (_ of [0,1]; track $index) {
            <div class="h-28 animate-pulse rounded-2xl bg-slate-200"></div>
          }
        </div>
      } @else if (!persona()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No se encontro informacion del personal solicitado.
        </div>
      } @else {
        <section class="space-y-6">
          <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Datos del personal</p>
                <h2 class="text-xl font-semibold text-slate-900">{{ personaNombre() }}</h2>
                <p class="text-sm text-slate-500">Cedula: {{ persona()?.cedula || 'No registrada' }}</p>
              </div>
              @if (personaId()) {
                <a [routerLink]="['/psicologo/fichas/nueva', personaId()]" [state]="{ persona: persona() }"
                  class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700 transition">
                  Crear nueva ficha
                </a>
              }
            </header>
            <dl class="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-600">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de persona</dt>
                <dd>{{ persona()?.tipoPersona || (persona()?.esMilitar ? 'Militar' : 'Dependiente/Civil') }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Servicio</dt>
                <dd>{{ servicioLabel() }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto</dt>
                <dd>{{ contactoLabel() }}</dd>
              </div>
            </dl>
          </article>

          <article class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Historial de fichas</p>
                <h3 class="text-lg font-semibold text-slate-900">Evaluaciones registradas</h3>
              </div>
            </header>

            @if (!historial().length) {
              <div class="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-sm text-emerald-700 space-y-3">
                <p>No existen fichas registradas para este personal. Crea la primera ficha psicologica.</p>
                @if (personaId()) {
                  <a [routerLink]="['/psicologo/fichas/nueva', personaId()]" [state]="{ persona: persona() }"
                    class="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow hover:bg-emerald-500 transition">
                    Crear ficha
                  </a>
                }
              </div>
            } @else {
              <ul class="space-y-3">
                @for (item of historial(); track item.id ?? item.fechaEvaluacion ?? $index) {
                  @let itemId = item.id ?? $index;
                  <li class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="space-y-2">
                        <div class="flex flex-wrap items-center gap-2">
                          <p class="text-sm font-semibold text-slate-900">{{ fechaFormateada(item.fechaEvaluacion) }}</p>
                          @if (item.numeroEvaluacion) {
                            <span class="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                              Ficha {{ item.numeroEvaluacion }}
                            </span>
                          }
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                          <span [class]="badgeBaseClass + ' ' + estadoBadgeClass(item.estado)">
                            {{ estadoLabel(item.estado) }}
                          </span>
                          <span [class]="badgeBaseClass + ' ' + condicionBadgeClass(item.condicion)">
                            {{ condicionLabel(item.condicion) }}
                          </span>
                          @if (item.psicologo) {
                            <span class="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                              {{ item.psicologo }}
                            </span>
                          }
                        </div>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <button type="button" (click)="toggleDetalle(itemId)"
                          class="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100">
                          {{ detalleAbiertoId() === itemId ? 'Ocultar detalles' : 'Ver detalles' }}
                        </button>
                        @if (puedeActualizarCondicion(item) && item.id) {
                          <a [routerLink]="['/psicologo/fichas', item.id, 'condicion-final']" [state]="{ persona: persona(), personalId: personaId(), ficha: item }"
                            class="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:bg-slate-700">
                            Actualizar plan
                          </a>
                        }
                      </div>
                    </div>

                    @if (detalleAbiertoId() === itemId) {
                      <div class="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                        <dl class="grid gap-3 md:grid-cols-3">
                          <div>
                            <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diagnostico CIE-10</dt>
                            <dd class="text-sm font-semibold text-slate-900">
                              {{ diagnosticoDisplay(item.diagnosticoCie10Codigo, item.diagnosticoCie10Descripcion) }}
                            </dd>
                          </div>
                          <div>
                            <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Frecuencia</dt>
                            <dd>{{ displayOrDefault(item.planFrecuencia, 'Sin definir') }}</dd>
                          </div>
                          <div>
                            <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tipo de sesion</dt>
                            <dd>{{ displayOrDefault(item.planTipoSesion, 'Sin definir') }}</dd>
                          </div>
                        </dl>
                        <div>
                          <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Detalle del plan</p>
                          <p>{{ displayOrDefault(item.planDetalle, 'Sin detalle registrado') }}</p>
                        </div>
                        <div class="grid gap-3 md:grid-cols-2">
                          <div>
                            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tipo de evaluacion</p>
                            <p>{{ displayOrDefault(item.tipoEvaluacion, 'No registrado') }}</p>
                          </div>
                          <div>
                            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Estado actual</p>
                            <p>{{ estadoLabel(item.estado) }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  </li>
                }
              </ul>
            }
          </article>
        </section>
      }
    </section>
  `
})
export class PersonalHistorialComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly personalService = inject(PersonalMilitarService);
  private readonly fichasService = inject(FichasPsicologicasService);

  private readonly personalId = signal<number | null>(null);
  readonly cargando = signal(true);
  readonly persona = signal<PersonalMilitarDTO | null>(null);
  readonly historial = signal<FichaPsicologicaHistorialDTO[]>([]);
  readonly mensaje = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly detalleAbiertoId = signal<number | null>(null);

  readonly badgeBaseClass = 'rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide';

  private readonly condicionMeta: Record<string, { label: string; badge: string }> = {
    ALTA: { label: 'Alta', badge: 'bg-emerald-100 text-emerald-700' },
    SEGUIMIENTO: { label: 'Seguimiento', badge: 'bg-amber-100 text-amber-700' },
    TRANSFERENCIA: { label: 'Transferencia', badge: 'bg-indigo-100 text-indigo-700' }
  };

  private readonly estadoMeta: Record<string, { label: string; badge: string }> = {
    ABIERTA: { label: 'Abierta', badge: 'bg-sky-100 text-sky-700' },
    CERRADA: { label: 'Cerrada', badge: 'bg-emerald-100 text-emerald-700' },
    EN_PROCESO: { label: 'En proceso', badge: 'bg-amber-100 text-amber-700' }
  };

  readonly personaNombre = computed(() => {
    const current = this.persona();
    if (!current) {
      return 'Sin datos';
    }
    const apellidosNombres = current.apellidosNombres?.trim();
    if (apellidosNombres?.length) {
      return apellidosNombres;
    }
    const partes = [current.apellidos, current.nombres]
      .filter((parte): parte is string => !!parte && parte.trim().length > 0)
      .map(parte => parte.trim());
    return partes.length ? partes.join(' ') : 'Sin nombres registrados';
  });

  readonly personaId = computed(() => {
    const value = this.personalId();
    return Number.isFinite(value) ? Number(value) : null;
  });

  readonly servicioLabel = computed(() => {
    const current = this.persona();
    if (!current) {
      return 'Sin informacion';
    }
    const activo = current.servicioActivo ? 'Activo' : null;
    const pasivo = current.servicioPasivo ? 'Pasivo' : null;
    const piezas = [activo, pasivo].filter((p): p is string => !!p);
    if (piezas.length) {
      return piezas.join(' / ');
    }
    return 'Sin informacion';
  });

  readonly contactoLabel = computed(() => {
    const current = this.persona();
    if (!current) {
      return 'Sin informacion';
    }
    const telefono = current.telefono?.trim();
    const celular = current.celular?.trim();
    const email = current.email?.trim();
    const partes = [telefono, celular, email].filter((part): part is string => !!part && part.length > 0);
    return partes.length ? partes.join(' / ') : 'Sin informacion de contacto';
  });

  condicionLabel(value?: string | null): string {
    const meta = value ? this.condicionMeta[value.trim().toUpperCase()] : undefined;
    if (meta) {
      return meta.label;
    }
    if (!value) {
      return 'Sin condicion';
    }
    return value.trim();
  }

  condicionBadgeClass(value?: string | null): string {
    const meta = value ? this.condicionMeta[value.trim().toUpperCase()] : undefined;
    return meta?.badge ?? 'bg-slate-200 text-slate-700';
  }

  estadoLabel(value?: string | null): string {
    const meta = value ? this.estadoMeta[value.trim().toUpperCase()] : undefined;
    if (meta) {
      return meta.label;
    }
    if (!value) {
      return 'Sin estado';
    }
    const normalized = value.trim().toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  estadoBadgeClass(value?: string | null): string {
    const meta = value ? this.estadoMeta[value.trim().toUpperCase()] : undefined;
    return meta?.badge ?? 'bg-slate-200 text-slate-700';
  }

  diagnosticoDisplay(codigo?: string | null, descripcion?: string | null): string {
    const codigoTrim = codigo?.trim();
    const descripcionTrim = descripcion?.trim();
    if (codigoTrim && descripcionTrim) {
      return `${codigoTrim} · ${descripcionTrim}`;
    }
    if (codigoTrim) {
      return codigoTrim;
    }
    if (descripcionTrim) {
      return descripcionTrim;
    }
    return 'Sin diagnostico registrado';
  }

  displayOrDefault(value: unknown, fallback: string): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) {
        return trimmed;
      }
    }
    return fallback;
  }

  toggleDetalle(id: number) {
    const actual = this.detalleAbiertoId();
    this.detalleAbiertoId.set(actual === id ? null : id);
  }

  puedeActualizarCondicion(item: FichaPsicologicaHistorialDTO): boolean {
    return this.normalizarCondicion(item.condicion) === 'SEGUIMIENTO';
  }

  constructor() {
    const param = this.route.snapshot.paramMap.get('personalId');
    const id = param ? Number(param) : Number.NaN;
    if (!Number.isFinite(id)) {
      this.cargando.set(false);
      this.error.set('Identificador de personal no valido.');
      return;
    }
    this.personalId.set(Number(id));
    this.intentarObtenerMensaje();
    this.cargarDatos(Number(id));
  }

  fechaFormateada(fecha?: string): string {
    if (!fecha) {
      return 'Fecha no registrada';
    }
    const instante = new Date(fecha);
    if (Number.isNaN(instante.getTime())) {
      return fecha;
    }
    return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(instante);
  }

  private normalizarCondicion(value?: string | null): 'ALTA' | 'SEGUIMIENTO' | 'TRANSFERENCIA' | null {
    if (typeof value !== 'string') {
      return null;
    }
    const normalized = value.trim().toUpperCase();
    if (!normalized.length) {
      return null;
    }
    if (normalized.includes('ALTA')) {
      return 'ALTA';
    }
    if (normalized.includes('SEGUIMIENTO')) {
      return 'SEGUIMIENTO';
    }
    if (normalized.includes('TRANSFERENCIA') || normalized.includes('DERIV')) {
      return 'TRANSFERENCIA';
    }
    return null;
  }

  private cargarDatos(id: number) {
    this.cargando.set(true);
    this.error.set(null);
    const historial$ = this.fichasService.obtenerHistorial(id).pipe(
      catchError((err) => {
        if (this.es404(err)) {
          return of([] as FichaPsicologicaHistorialDTO[]);
        }
        return throwError(() => err);
      })
    );

    forkJoin({
      persona: this.personalService.obtenerPorId(id),
      historial: historial$
    })
      .pipe(
        catchError((err) => {
          this.error.set(this.resolverError(err));
          return of({ persona: null, historial: [] as FichaPsicologicaHistorialDTO[] });
        })
      )
      .subscribe(({ persona, historial }) => {
        this.persona.set(persona);
        this.historial.set(historial ?? []);
        this.cargando.set(false);
      });
  }

  private intentarObtenerMensaje() {
    const navigationState = (this.router.lastSuccessfulNavigation?.extras?.state ?? {}) as Record<string, unknown>;
    const historyState = (globalThis.history?.state ?? {}) as Record<string, unknown>;
    const rawMensaje = navigationState['mensaje'] ?? historyState['mensaje'];
    if (typeof rawMensaje === 'string') {
      const mensaje = rawMensaje.trim();
      if (!mensaje.length) {
        return;
      }
      this.mensaje.set(mensaje);
      const nuevoEstado = { ...historyState };
      delete nuevoEstado['mensaje'];
      const href = globalThis.location?.href ?? '/';
      globalThis.history?.replaceState?.(nuevoEstado, '', href);
    }
  }

  private resolverError(err: unknown): string {
    const status = this.extractStatus(err);
    if (status === 404) {
      return 'No se encontro informacion del personal solicitado.';
    }
    const mensaje = this.extractErrorMessage(err);
    if (mensaje) {
      return mensaje;
    }
    return 'Ocurrio un error al consultar el historial de fichas.';
  }

  private es404(err: unknown): boolean {
    return this.extractStatus(err) === 404;
  }

  private extractStatus(err: unknown): number | null {
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status?: unknown }).status;
      if (typeof status === 'number') {
        return status;
      }
    }
    return null;
  }

  private extractErrorMessage(err: unknown): string | null {
    const fallback = this.toTrimmedString(err);
    if (fallback) {
      return fallback;
    }
    if (!err || typeof err !== 'object') {
      return null;
    }
    if ('error' in err) {
      const contenido = (err as { error?: unknown }).error;
      const mensajeDesdeContenido = this.extractMessageFromErrorPayload(contenido);
      if (mensajeDesdeContenido) {
        return mensajeDesdeContenido;
      }
    }
    if ('message' in err) {
      return this.toTrimmedString((err as { message?: unknown }).message);
    }
    return null;
  }

  private extractMessageFromErrorPayload(payload: unknown): string | null {
    const directo = this.toTrimmedString(payload);
    if (directo) {
      return directo;
    }
    if (payload && typeof payload === 'object' && 'message' in payload) {
      return this.toTrimmedString((payload as { message?: unknown }).message);
    }
    return null;
  }

  private toTrimmedString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
}
