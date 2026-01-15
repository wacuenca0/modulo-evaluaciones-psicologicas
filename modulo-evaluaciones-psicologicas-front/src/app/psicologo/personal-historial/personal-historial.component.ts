import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonalMilitarService } from '../../services/personal-militar.service';
import { PersonalMilitarDTO } from '../../models/personal-militar.models';
import { FichasPsicologicasService } from '../../services/fichas-psicologicas.service';
import { FichaPsicologicaHistorialDTO } from '../../models/fichas-psicologicas.models';
import { catchError, forkJoin, of, throwError } from 'rxjs';

type MensajeFlashTipo = 'ALTA' | 'SEGUIMIENTO' | 'TRANSFERENCIA' | 'DEFAULT';

type MensajeFlash = {
  texto: string;
  tipo: MensajeFlashTipo;
};

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

      @if (mensajeFlash()) {
        @let flash = mensajeFlash()!;
        <div [class]="mensajeFlashClase(flash.tipo)">
          <span>{{ flash.texto }}</span>
          <span aria-hidden="true" [class]="mensajeFlashIndicador(flash.tipo)"></span>
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
          <article class="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
            <header class="flex flex-wrap items-center justify-between gap-6">
              <div class="flex items-start gap-4">
                <!-- Avatar con iniciales -->
                <div class="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 text-white shadow-lg ring-2 ring-white/60">
                  <span class="text-lg font-bold">{{ personaIniciales() }}</span>
                </div>
                <div class="space-y-1">
                  <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Datos del personal</p>
                  <h2 class="text-2xl font-bold text-slate-900 leading-tight">{{ personaNombre() }}</h2>
                  <div class="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-medium">
                      <svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zM19 20a7 7 0 10-14 0h14z"/></svg>
                      Cedula: <span class="font-semibold">{{ persona()?.cedula || 'No registrada' }}</span>
                    </span>
                  </div>
                  <!-- Chips -->
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <span [class]="'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide ' + tipoPersonaBadgeClass()">
                      {{ persona()?.tipoPersona || (persona()?.esMilitar ? 'Militar' : 'Dependiente/Civil') }}
                    </span>
                    <span [class]="'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide ' + servicioChipClass()">
                      {{ servicioLabel() }}
                    </span>
                    <span class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
                      {{ contactoLabel() }}
                    </span>
                  </div>
                </div>
              </div>
              @if (personaId()) {
                <a [routerLink]="['/psicologo/fichas/nueva', personaId()]" [state]="{ persona: persona() }"
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:from-slate-700 hover:to-slate-800">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  Crear nueva ficha
                </a>
              }
            </header>
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
              <ul class="space-y-4">
                @for (item of historial(); track item.id ?? item.fechaEvaluacion ?? $index) {
                  @let itemId = item.id ?? $index;
                  <li [class]="'group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ' + fichaBorderClass(item.condicion)"
                      [style.background]="fichaBackgroundGradient(item.condicion)">
                    <!-- Barra lateral de color según condición -->
                    <div [class]="'absolute left-0 top-0 h-full w-2 ' + fichaSidebarClass(item.condicion)"></div>
                    
                    <div class="relative px-6 py-5 pl-8">
                      <div class="flex flex-wrap items-start justify-between gap-4">
                        <div class="flex-1 space-y-3">
                          <!-- Fecha y número de ficha -->
                          <div class="flex flex-wrap items-center gap-3">
                            <div class="flex items-center gap-2">
                              <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              <p class="text-lg font-bold text-slate-900">{{ fechaFormateada(item.fechaEvaluacion) }}</p>
                            </div>
                            @if (item.numeroEvaluacion) {
                              <span class="rounded-lg bg-gradient-to-r from-slate-700 to-slate-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                                Ficha #{{ item.numeroEvaluacion }}
                              </span>
                            }
                          </div>
                          
                          <!-- Badges de estado y condición -->
                          <div class="flex flex-wrap items-center gap-3">
                            <div [class]="'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-lg ring-2 ring-white/50 ' + estadoBadgeModernClass(item.estado)">
                              <span class="relative flex h-2.5 w-2.5">
                                <span [class]="'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ' + estadoPingClass(item.estado)"></span>
                                <span [class]="'relative inline-flex h-2.5 w-2.5 rounded-full ' + estadoDotClass(item.estado)"></span>
                              </span>
                              <span>{{ estadoLabel(item.estado) }}</span>
                            </div>
                            
                            <div [class]="'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg ring-2 ring-white/50 ' + condicionBadgeModernClass(item.condicion)">
                              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                @if (esCondicionAlta(item.condicion)) {
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                } @else if (esCondicionSeguimiento(item.condicion)) {
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                } @else {
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd"/>
                                }
                              </svg>
                              <span>{{ condicionLabelCorto(item.condicion) }}</span>
                            </div>
                          </div>
                          
                          <!-- Información de auditoría -->
                          <div class="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <div class="flex items-center gap-1.5">
                              <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                              </svg>
                              <span class="font-medium text-slate-700">{{ creadoPorResumen(item) }}</span>
                            </div>
                            <span class="text-slate-400">•</span>
                            <span [class]="ultimaEdicionClass(item)">{{ ultimaEdicionResumen(item) }}</span>
                          </div>
                        </div>
                        
                        <!-- Botones de acción -->
                        <div class="flex flex-col gap-2 sm:flex-row">
                          <button type="button" (click)="toggleDetalle(itemId)"
                            class="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              @if (detalleAbiertoId() === itemId) {
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                              } @else {
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                              }
                            </svg>
                            {{ detalleAbiertoId() === itemId ? 'Ocultar' : 'Ver más' }}
                          </button>
                          @if (puedeActualizarCondicion(item) && item.id) {
                            <a [routerLink]="['/psicologo/fichas', item.id, 'condicion-final']" [state]="{ persona: persona(), personalId: personaId(), ficha: item }"
                              class="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition-all hover:from-slate-700 hover:to-slate-800 hover:shadow-xl">
                              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                              Actualizar Plan
                            </a>
                          }
                        </div>
                      </div>
                    </div>

                    @if (detalleAbiertoId() === itemId) {
                      <div class="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                        @if (esCondicionSeguimiento(item.condicion)) {
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
                        } @else if (esCondicionTransferencia(item.condicion)) {
                          <dl class="grid gap-3 md:grid-cols-3">
                            <div>
                              <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Unidad destino</dt>
                              <dd class="text-sm font-semibold text-slate-900">{{ displayOrDefault(item.transferenciaUnidad, 'Sin unidad registrada') }}</dd>
                            </div>
                            <div>
                              <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Fecha de transferencia</dt>
                              <dd>{{ fechaHoraFormateada(item.transferenciaFecha) || 'Sin fecha' }}</dd>
                            </div>
                            <div>
                              <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diagnostico CIE-10</dt>
                              <dd class="text-sm font-semibold text-slate-900">
                                {{ diagnosticoDisplay(item.diagnosticoCie10Codigo, item.diagnosticoCie10Descripcion) }}
                              </dd>
                            </div>
                          </dl>
                          <div>
                            <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Observacion</dt>
                            <dd>{{ displayOrDefault(item.transferenciaObservacion, 'Sin observacion') }}</dd>
                          </div>
                        } @else if (esCondicionAlta(item.condicion)) {
                          <div class="grid gap-3 md:grid-cols-3">
                            <div class="md:col-span-2">
                              <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Estado clínico</dt>
                              <dd class="text-sm font-semibold text-emerald-700">Paciente en alta. No presenta psicopatologia activa.</dd>
                            </div>
                            <div>
                              <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diagnostico (si aplica)</dt>
                              <dd class="text-sm font-semibold text-slate-900">
                                {{ diagnosticoDisplay(item.diagnosticoCie10Codigo, item.diagnosticoCie10Descripcion) }}
                              </dd>
                            </div>
                          </div>
                        } @else {
                          <dl class="grid gap-3 md:grid-cols-3">
                            <div>
                              <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diagnostico CIE-10</dt>
                              <dd class="text-sm font-semibold text-slate-900">
                                {{ diagnosticoDisplay(item.diagnosticoCie10Codigo, item.diagnosticoCie10Descripcion) }}
                              </dd>
                            </div>
                            <div>
                              <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Estado</dt>
                              <dd>{{ estadoLabel(item.estado) }}</dd>
                            </div>
                            <div>
                              <dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Plan</dt>
                              <dd>{{ displayOrDefault(item.planDetalle, 'Sin plan establecido') }}</dd>
                            </div>
                          </dl>
                        }
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
                        <div class="grid gap-3 md:grid-cols-2">
                          <div>
                            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Creada por</p>
                            <p>{{ creadoPorDetalle(item) }}</p>
                          </div>
                          <div>
                            <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Ultima edicion</p>
                            <p [class]="ultimaEdicionClass(item)">{{ ultimaEdicionDetalle(item) }}</p>
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
  readonly mensajeFlash = signal<MensajeFlash | null>(null);
  readonly error = signal<string | null>(null);
  readonly detalleAbiertoId = signal<number | null>(null);

  private readonly mensajeFlashBaseClass = 'flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm';

  private readonly mensajeFlashMeta: Record<MensajeFlashTipo, { container: string; indicator: string }> = {
    ALTA: { container: 'border-emerald-200 bg-emerald-50 text-emerald-700', indicator: 'bg-emerald-500' },
    SEGUIMIENTO: { container: 'border-amber-200 bg-amber-50 text-amber-800', indicator: 'bg-amber-500' },
    TRANSFERENCIA: { container: 'border-indigo-200 bg-indigo-50 text-indigo-700', indicator: 'bg-indigo-500' },
    DEFAULT: { container: 'border-emerald-200 bg-emerald-50 text-emerald-700', indicator: 'bg-emerald-500' }
  };

  readonly badgeBaseClass = 'rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide';

  private readonly condicionMeta: Record<string, { label: string; badge: string }> = {
    ALTA: { label: 'No presenta psicopatologia (Alta)', badge: 'bg-emerald-600 text-white' },
    SEGUIMIENTO: { label: 'Seguimiento (Requiere citas periodicas)', badge: 'bg-blue-600 text-white' },
    TRANSFERENCIA: { label: 'Transferencia (Derivado a otro especialista o unidad)', badge: 'bg-purple-600 text-white' }
  };

  private readonly estadoMeta: Record<string, { label: string; badge: string }> = {
    ABIERTA: { label: 'Abierta', badge: 'bg-sky-600 text-white' },
    CERRADA: { label: 'Cerrada', badge: 'bg-slate-500 text-white' },
    EN_PROCESO: { label: 'En proceso', badge: 'bg-amber-600 text-white' }
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

  personaIniciales(): string {
    const nombre = this.personaNombre();
    const partes = nombre.split(' ').filter(p => p.trim().length);
    const letras = partes.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
    return letras || 'P';
  }

  tipoPersonaBadgeClass(): string {
    const current = this.persona();
    const tipo = current?.tipoPersona?.trim().toLowerCase();
    if (tipo === 'militar') return 'bg-emerald-600 text-white shadow-lg';
    if (tipo === 'dependiente') return 'bg-indigo-600 text-white shadow-lg';
    if (tipo === 'civil') return 'bg-sky-600 text-white shadow-lg';
    return 'bg-slate-500 text-white';
  }

  servicioChipClass(): string {
    const current = this.persona();
    const activo = !!current?.servicioActivo;
    const pasivo = !!current?.servicioPasivo;
    if (activo && pasivo) return 'bg-amber-600 text-white shadow-lg';
    if (activo) return 'bg-blue-600 text-white shadow-lg';
    if (pasivo) return 'bg-slate-600 text-white shadow-lg';
    return 'bg-slate-500 text-white';
  }

  mensajeFlashClase(tipo: MensajeFlashTipo): string {
    const meta = this.mensajeFlashMeta[tipo] ?? this.mensajeFlashMeta.DEFAULT;
    return `${this.mensajeFlashBaseClass} ${meta.container}`;
  }

  mensajeFlashIndicador(tipo: MensajeFlashTipo): string {
    const meta = this.mensajeFlashMeta[tipo] ?? this.mensajeFlashMeta.DEFAULT;
    return `inline-flex h-2 w-2 animate-ping rounded-full ${meta.indicator}`;
  }

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

  creadoPorResumen(item: FichaPsicologicaHistorialDTO): string {
    return this.usuarioLabel(item.creadoPorNombre, item.creadoPorUsername) ?? 'Sin registro';
  }

  creadoPorDetalle(item: FichaPsicologicaHistorialDTO): string {
    const label = this.usuarioLabelDetallada(item.creadoPorNombre, item.creadoPorUsername);
    return label ?? 'Sin informacion del creador';
  }

  ultimaEdicionResumen(item: FichaPsicologicaHistorialDTO): string {
    const editor = this.usuarioLabel(item.actualizadoPorNombre, item.actualizadoPorUsername);
    const fecha = this.fechaHoraFormateada(item.updatedAt);
    if (!editor && !fecha) {
      return 'Sin ediciones registradas';
    }
    if (editor && fecha) {
      return `Ultima edicion por ${editor} · ${fecha}`;
    }
    if (editor) {
      return `Ultima edicion por ${editor}`;
    }
    return `Ultima edicion ${fecha}`;
  }

  ultimaEdicionDetalle(item: FichaPsicologicaHistorialDTO): string {
    const editor = this.usuarioLabelDetallada(item.actualizadoPorNombre, item.actualizadoPorUsername);
    const fecha = this.fechaHoraFormateada(item.updatedAt);
    if (!editor && !fecha) {
      return 'Sin informacion de ediciones';
    }
    if (editor && fecha) {
      return `${editor} · ${fecha}`;
    }
    return editor ?? fecha ?? 'Sin informacion de ediciones';
  }

  ultimaEdicionClass(item: FichaPsicologicaHistorialDTO): string {
    return this.debeResaltarAuditoria(item) ? 'font-semibold text-indigo-600' : 'text-slate-600';
  }

  toggleDetalle(id: number) {
    const actual = this.detalleAbiertoId();
    this.detalleAbiertoId.set(actual === id ? null : id);
  }

  puedeActualizarCondicion(item: FichaPsicologicaHistorialDTO): boolean {
    return this.normalizarCondicion(item.condicion) === 'SEGUIMIENTO';
  }

  // Métodos para el nuevo diseño moderno
  fichaBorderClass(condicion?: string | null): string {
    const tipo = this.normalizarCondicion(condicion);
    if (!tipo) return 'border-slate-200 hover:border-slate-300';
    const classes: Record<string, string> = {
      'ALTA': 'border-emerald-200 hover:border-emerald-300',
      'SEGUIMIENTO': 'border-blue-200 hover:border-blue-300',
      'TRANSFERENCIA': 'border-purple-200 hover:border-purple-300'
    };
    return classes[tipo] ?? 'border-slate-200 hover:border-slate-300';
  }

  fichaBackgroundGradient(condicion?: string | null): string {
    const tipo = this.normalizarCondicion(condicion);
    if (!tipo) return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
    const gradients: Record<string, string> = {
      'ALTA': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      'SEGUIMIENTO': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      'TRANSFERENCIA': 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
    };
    return gradients[tipo] ?? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  }

  fichaSidebarClass(condicion?: string | null): string {
    const tipo = this.normalizarCondicion(condicion);
    if (!tipo) return 'bg-gradient-to-b from-slate-400 to-slate-600';
    const classes: Record<string, string> = {
      'ALTA': 'bg-gradient-to-b from-emerald-400 to-emerald-600',
      'SEGUIMIENTO': 'bg-gradient-to-b from-blue-400 to-blue-600',
      'TRANSFERENCIA': 'bg-gradient-to-b from-purple-400 to-purple-600'
    };
    return classes[tipo] ?? 'bg-gradient-to-b from-slate-400 to-slate-600';
  }

  estadoBadgeModernClass(estado?: string | null): string {
    const estadoUpper = estado?.trim().toUpperCase();
    if (!estadoUpper) return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
    const classes: Record<string, string> = {
      'ABIERTA': 'bg-gradient-to-r from-sky-500 to-sky-600 text-white',
      'CERRADA': 'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
      'EN_PROCESO': 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
    };
    return classes[estadoUpper] ?? 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
  }

  estadoPingClass(estado?: string | null): string {
    const estadoUpper = estado?.trim().toUpperCase();
    if (!estadoUpper) return 'bg-slate-400';
    const classes: Record<string, string> = {
      'ABIERTA': 'bg-sky-400',
      'CERRADA': 'bg-slate-400',
      'EN_PROCESO': 'bg-amber-400'
    };
    return classes[estadoUpper] ?? 'bg-slate-400';
  }

  estadoDotClass(estado?: string | null): string {
    const estadoUpper = estado?.trim().toUpperCase();
    if (!estadoUpper) return 'bg-slate-300';
    const classes: Record<string, string> = {
      'ABIERTA': 'bg-sky-300',
      'CERRADA': 'bg-slate-300',
      'EN_PROCESO': 'bg-amber-300'
    };
    return classes[estadoUpper] ?? 'bg-slate-300';
  }

  condicionBadgeModernClass(condicion?: string | null): string {
    const tipo = this.normalizarCondicion(condicion);
    if (!tipo) return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
    const classes: Record<string, string> = {
      'ALTA': 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white',
      'SEGUIMIENTO': 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
      'TRANSFERENCIA': 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
    };
    return classes[tipo] ?? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
  }

  condicionLabelCorto(condicion?: string | null): string {
    const tipo = this.normalizarCondicion(condicion);
    if (!tipo) return 'Sin condición';
    const labels: Record<string, string> = {
      'ALTA': 'Alta Médica',
      'SEGUIMIENTO': 'Seguimiento',
      'TRANSFERENCIA': 'Transferencia'
    };
    return labels[tipo] ?? 'Sin condición';
  }

  esCondicionAlta(condicion?: string | null): boolean {
    return this.normalizarCondicion(condicion) === 'ALTA';
  }

  esCondicionSeguimiento(condicion?: string | null): boolean {
    return this.normalizarCondicion(condicion) === 'SEGUIMIENTO';
  }

  esCondicionTransferencia(condicion?: string | null): boolean {
    return this.normalizarCondicion(condicion) === 'TRANSFERENCIA';
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

  fechaHoraFormateada(fecha?: string | null): string | null {
    if (!fecha) {
      return null;
    }
    const instante = new Date(fecha);
    if (Number.isNaN(instante.getTime())) {
      return fecha;
    }
    return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' }).format(instante);
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
        const ordenado = (historial ?? []).sort((a, b) => {
          // Ordenar por fecha de evaluación (más recientes primero)
          const fechaA = a.fechaEvaluacion || '';
          const fechaB = b.fechaEvaluacion || '';
          if (fechaA !== fechaB) {
            return fechaB.localeCompare(fechaA);
          }
          // Si tienen la misma fecha de evaluación, ordenar por ID descendente (las más nuevas primero)
          const idA = a.id ?? 0;
          const idB = b.id ?? 0;
          return idB - idA;
        });
        this.historial.set(ordenado);
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
      const tipo = this.normalizarMensajeTipo(navigationState['mensajeTipo'] ?? historyState['mensajeTipo']);
      this.mensajeFlash.set({ texto: mensaje, tipo });
      const nuevoEstado = { ...historyState };
      delete nuevoEstado['mensaje'];
      delete nuevoEstado['mensajeTipo'];
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

  private usuarioLabel(nombre?: string | null, username?: string | null): string | null {
    const nombreTrim = nombre?.trim();
    const usernameTrim = username?.trim();
    if (nombreTrim && usernameTrim) {
      return `${nombreTrim} (${usernameTrim})`;
    }
    if (nombreTrim) {
      return nombreTrim;
    }
    if (usernameTrim) {
      return usernameTrim;
    }
    return null;
  }

  private usuarioLabelDetallada(nombre?: string | null, username?: string | null): string | null {
    const nombreTrim = nombre?.trim();
    const usernameTrim = username?.trim();
    if (nombreTrim && usernameTrim) {
      return `${nombreTrim} (${usernameTrim})`;
    }
    if (nombreTrim) {
      return nombreTrim;
    }
    if (usernameTrim) {
      return `Usuario: ${usernameTrim}`;
    }
    return null;
  }

  private debeResaltarAuditoria(item: FichaPsicologicaHistorialDTO): boolean {
    const creadorId = this.parseId(item.creadoPorId);
    const editorId = this.parseId(item.actualizadoPorId);
    if (creadorId === null || editorId === null) {
      return false;
    }
    return creadorId !== editorId;
  }

  private parseId(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Number(value);
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
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

  private normalizarMensajeTipo(value: unknown): MensajeFlashTipo {
    if (typeof value !== 'string') {
      return 'DEFAULT';
    }
    const normalized = value.trim().toUpperCase();
    if (normalized === 'ALTA' || normalized === 'SEGUIMIENTO' || normalized === 'TRANSFERENCIA') {
      return normalized;
    }
    return 'DEFAULT';
  }
}
