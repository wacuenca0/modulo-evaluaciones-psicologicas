import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonalMilitarService } from '../../services/personal-militar.service';
import { PersonalMilitarDTO, PersonalMilitarPageDTO } from '../../models/personal-militar.models';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FichasPsicologicasService } from '../../services/fichas-psicologicas.service';
import { FichaPsicologicaHistorialDTO } from '../../models/fichas-psicologicas.models';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface SearchState {
  mode: 'CEDULA' | 'APELLIDOS' | null;
  page: number;
  size: number;
  totalPages: number;
}

interface HistorialResumen {
  total: number;
  ultimaFecha: string | null;
  ultimaCondicion: string | null;
  ultimoEstado: string | null;
  cargando: boolean;
}

@Component({
  selector: 'app-personal-search',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Gestion clinica</p>
        <h1 class="text-3xl font-semibold text-slate-900">Busqueda de personal militar</h1>
        <p class="text-sm text-slate-500 max-w-2xl">
          Localiza rapidamente al personal militar mediante cedula o apellidos para continuar con la evaluacion psicologica.
        </p>
      </header>

      @if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error() }}
        </div>
      }

      @if (mensajeExito()) {
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{{ mensajeExito() }}</span>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="buscar()" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cedula
            <input formControlName="cedula" type="text" maxlength="15" autocomplete="off"
              class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Apellidos
            <input formControlName="apellidos" type="text" autocomplete="off"
              class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
          </label>
        </div>
        <p class="text-xs text-slate-500">Ingresa la cedula para una busqueda exacta o apellidos para obtener coincidencias parciales. Al menos uno de los campos es obligatorio.</p>
        <div class="flex flex-wrap gap-3">
          <button type="submit" [disabled]="loading()" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {{ loading() ? 'Buscando...' : 'Buscar' }}
          </button>
          <button type="button" (click)="limpiar()" [disabled]="loading()" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
            Limpiar
          </button>
        </div>
      </form>

      <section class="space-y-4">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-slate-900">Resultados</h2>
          <div class="flex flex-wrap items-center gap-3">
            <a routerLink="/psicologo/personal/nuevo"
              class="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100">
              Registrar personal
            </a>
            @if (state().mode === 'APELLIDOS' && resultados().length) {
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <button type="button" (click)="paginaAnterior()" [disabled]="state().page === 0 || loading()"
                  class="rounded-full border border-slate-300 px-3 py-1 font-semibold transition hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed">Anterior</button>
                <span>Pagina {{ state().page + 1 }} de {{ state().totalPages }}</span>
                <button type="button" (click)="siguientePagina()" [disabled]="state().page + 1 >= state().totalPages || loading()"
                  class="rounded-full border border-slate-300 px-3 py-1 font-semibold transition hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed">Siguiente</button>
              </div>
            }
          </div>
        </header>

        @if (loading()) {
          <div class="space-y-3">
            @for (_ of [0,1,2]; track $index) {
              <div class="h-20 animate-pulse rounded-2xl bg-slate-200"></div>
            }
          </div>
        } @else if (sinResultados()) {
          <div class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 space-y-3">
            <p>No se encontraron registros con los criterios proporcionados.</p>
            <a routerLink="/psicologo/personal/nuevo"
              class="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100">
              Registrar nuevo personal
            </a>
          </div>
        } @else if (!resultados().length) {
          <div class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Sin resultados. Ingresa criterios de busqueda para comenzar.
          </div>
        } @else {
          <ul class="space-y-3">
            @for (persona of resultados(); track persona.id ?? persona.cedula) {
              @let resumen = resumenPara(persona);
              @let personaId = idPara(persona);
              <li class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition"
                [class.border-emerald-400]="esSeleccionDestacada(persona)"
                [class.bg-emerald-50]="esSeleccionDestacada(persona)">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="space-y-1">
                    <p class="text-base font-semibold text-slate-900">{{ nombrePara(persona) }}</p>
                    <p class="text-sm text-slate-500">Cedula: {{ persona.cedula || 'No registrada' }}</p>
                    <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span [class]="badgeBaseClass + ' bg-slate-100 text-slate-600'">{{ tipoPersonaLabel(persona) }}</span>
                      @if (persona.esMilitar) {
                        <span [class]="badgeBaseClass + ' bg-slate-900 text-white'">Servicio {{ servicioEtiqueta(persona) }}</span>
                      }
                      @if (persona.activo === false) {
                        <span [class]="badgeBaseClass + ' bg-red-100 text-red-700'">Inactivo</span>
                      }
                      @if (esSeleccionDestacada(persona)) {
                        <span [class]="badgeBaseClass + ' bg-emerald-100 text-emerald-700'">Registro reciente</span>
                      }
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button type="button" (click)="verDetalle(persona)"
                      class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                      Ver detalle
                    </button>
                  </div>
                </div>

                <dl class="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Grado</dt>
                    <dd>{{ mostrarDato(persona.grado) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Unidad</dt>
                    <dd>{{ mostrarDato(persona.unidad) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Situacion</dt>
                    <dd>{{ mostrarDato(persona.situacion) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Especialidad</dt>
                    <dd>{{ mostrarDato(persona.especialidad) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Ocupacion</dt>
                    <dd>{{ mostrarDato(persona.ocupacion) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Cobertura</dt>
                    <dd>{{ mostrarDato(persona.seguro) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto</dt>
                    <dd>{{ contactoLabel(persona) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Direccion</dt>
                    <dd>{{ direccionLabel(persona) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Ingreso</dt>
                    <dd>{{ fechaResumen(persona.fechaIngreso) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Actualizacion</dt>
                    <dd>{{ fechaResumen(persona.updatedAt) }}</dd>
                  </div>
                </dl>

                <section class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <header class="flex flex-wrap items-center justify-between gap-2">
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Historial clinico</p>
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                      <span class="font-semibold text-slate-600">Total: {{ resumen?.cargando ? '...' : resumen?.total ?? 0 }}</span>
                      <button type="button" (click)="irAlHistorial(persona)"
                        class="rounded-md border border-slate-300 px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        [disabled]="personaId === null">
                        Ver fichas
                      </button>
                    </div>
                  </header>

                  @if (personaId === null) {
                    <p class="mt-2 text-xs text-slate-500">Este registro no cuenta con identificador para consultar su historial.</p>
                  } @else if (!resumen || resumen.cargando) {
                    <p class="mt-2 text-xs text-slate-500">Cargando historial...</p>
                  } @else if (!resumen.total) {
                    <p class="mt-2 text-xs text-slate-500">No existen fichas registradas para este personal.</p>
                  } @else {
                    <div class="mt-3 space-y-2 text-xs text-slate-600">
                      <p class="text-sm font-semibold text-slate-900">Ultima evaluacion: {{ fechaResumen(resumen.ultimaFecha) }}</p>
                      <div class="flex flex-wrap gap-2">
                        <span [class]="badgeBaseClass + ' bg-emerald-100 text-emerald-700'">{{ condicionLabel(resumen.ultimaCondicion) }}</span>
                        <span [class]="badgeBaseClass + ' bg-sky-100 text-sky-700'">{{ estadoLabel(resumen.ultimoEstado) }}</span>
                      </div>
                    </div>
                  }
                </section>
              </li>
            }
          </ul>
        }
      </section>
    </section>
  `
})
export class PersonalSearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PersonalMilitarService);
  private readonly router = inject(Router);
  private readonly fichasService = inject(FichasPsicologicasService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    cedula: ['', [Validators.maxLength(15)]],
    apellidos: ['', [Validators.maxLength(100)]]
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly detail = signal<PersonalMilitarDTO | null>(null);
  readonly pageResult = signal<PersonalMilitarPageDTO | null>(null);
  readonly state = signal<SearchState>({ mode: null, page: 0, size: 10, totalPages: 0 });
  readonly sinResultados = signal(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly seleccionDestacadaId = signal<number | null>(null);
  readonly historialResumen = signal<Record<number, HistorialResumen>>({});

  readonly badgeBaseClass = 'rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide';

  readonly resultados = computed(() => {
    const mode = this.state().mode;
    if (mode === 'CEDULA') {
      const single = this.detail();
      return single ? [single] : [];
    }
    const paged = this.pageResult();
    return paged?.content ?? [];
  });

  constructor() {
    this.resolverPersonaRegistrada();
  }

  esSeleccionDestacada(persona: PersonalMilitarDTO): boolean {
    const targetId = this.seleccionDestacadaId();
    if (typeof targetId !== 'number') {
      return false;
    }
    const personaId = this.idPara(persona);
    if (personaId !== null) {
      return Number(personaId) === Number(targetId);
    }
    const detalle = this.detail();
    if (!detalle?.cedula || !persona.cedula) {
      return false;
    }
    return detalle.cedula.trim() === persona.cedula.trim();
  }

  idPara(persona: PersonalMilitarDTO): number | null {
    if (typeof persona.id === 'number') {
      return Number(persona.id);
    }
    const parsed = Number((persona.id as unknown) ?? Number.NaN);
    return Number.isFinite(parsed) ? Number(parsed) : null;
  }

  private resolverPersonaRegistrada() {
    const navigationState = (this.router.lastSuccessfulNavigation?.extras?.state ?? {}) as Record<string, unknown>;
    const historyState = (globalThis.history?.state ?? {}) as Record<string, unknown>;
    const personaRegistrada = (navigationState['personaRegistrada'] ?? historyState['personaRegistrada'] ?? null) as PersonalMilitarDTO | null;

    if (!personaRegistrada) {
      return;
    }

    const normalizada = this.normalizarPersona(personaRegistrada);
    this.detail.set(normalizada);
    this.pageResult.set(null);
    this.state.set({ mode: 'CEDULA', page: 0, size: 1, totalPages: 1 });
    this.sinResultados.set(false);
    this.error.set(null);
    this.form.patchValue({ cedula: normalizada.cedula ?? '' });

    const id = this.idPara(normalizada);
    if (id !== null) {
      this.seleccionDestacadaId.set(Number(id));
    }

    this.mensajeExito.set('Personal registrado correctamente. Revisa su historial clinico para continuar.');
    this.actualizarResumenes([normalizada]);
    this.clearPersonaRegistradaState();
  }

  private clearPersonaRegistradaState() {
    const historyState = globalThis.history?.state;
    if (!historyState || typeof historyState !== 'object') {
      return;
    }
    const currentState = { ...(historyState as Record<string, unknown>) };
    if (!('personaRegistrada' in currentState)) {
      return;
    }
    delete currentState['personaRegistrada'];
    if ('mensaje' in currentState) {
      delete currentState['mensaje'];
    }
    if ('exitoRegistro' in currentState) {
      delete currentState['exitoRegistro'];
    }
    const href = globalThis.location?.href ?? '/';
    globalThis.history?.replaceState?.(currentState, '', href);
  }

  buscar(pageOverride?: number) {
    this.error.set(null);
    this.sinResultados.set(false);
    this.mensajeExito.set(null);
    this.seleccionDestacadaId.set(null);
    this.historialResumen.set({});
    const raw = this.form.getRawValue();
    const cedula = (raw.cedula ?? '').trim();
    const apellidos = (raw.apellidos ?? '').trim();

    if (!cedula && !apellidos) {
      this.error.set('Debes ingresar cedula o apellidos para realizar la busqueda.');
      this.detail.set(null);
      this.pageResult.set(null);
      return;
    }

    if (cedula && apellidos) {
      this.error.set('Ingresa solo un criterio de busqueda a la vez.');
      this.detail.set(null);
      this.pageResult.set(null);
      return;
    }

    if (cedula) {
      this.ejecutarBusquedaCedula(cedula);
      return;
    }

    const page = typeof pageOverride === 'number' ? pageOverride : 0;
    this.ejecutarBusquedaApellidos(apellidos, page);
  }

  nombrePara(persona: PersonalMilitarDTO): string {
    const apellidosNombres = persona.apellidosNombres?.trim();
    if (apellidosNombres?.length) {
      return apellidosNombres;
    }
    const apellidos = persona.apellidos?.trim();
    const nombres = persona.nombres?.trim();
    if (apellidos && nombres) {
      return `${apellidos}, ${nombres}`;
    }
    if (apellidos) {
      return apellidos;
    }
    if (nombres) {
      return nombres;
    }
    return 'Sin nombres registrados';
  }

  resumenPara(persona: PersonalMilitarDTO): HistorialResumen | null {
    const id = this.idPara(persona);
    if (id === null) {
      return null;
    }
    return this.historialResumen()[id] ?? null;
  }

  tipoPersonaLabel(persona: PersonalMilitarDTO): string {
    const tipo = persona.tipoPersona?.trim();
    if (tipo?.length) {
      return tipo;
    }
    if (persona.esMilitar) {
      return 'Militar';
    }
    return 'Dependiente/Civil';
  }

  servicioEtiqueta(persona: PersonalMilitarDTO): string {
    const etiquetas = [persona.servicioActivo ? 'activo' : null, persona.servicioPasivo ? 'pasivo' : null]
      .filter((etiqueta): etiqueta is string => !!etiqueta);
    if (!etiquetas.length) {
      return 'Sin registro';
    }
    if (etiquetas.length === 2) {
      return 'Activo y pasivo';
    }
    const etiqueta = etiquetas[0];
    return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
  }

  mostrarDato(value: unknown): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) {
        return trimmed;
      }
    }
    return 'No registrado';
  }

  contactoLabel(persona: PersonalMilitarDTO): string {
    const telefono = persona.telefono?.trim();
    const celular = persona.celular?.trim();
    const email = persona.email?.trim();
    const partes = [telefono, celular, email].filter((part): part is string => !!part && part.length > 0);
    return partes.length ? partes.join(' · ') : 'Sin informacion de contacto';
  }

  direccionLabel(persona: PersonalMilitarDTO): string {
    const provincia = persona.provincia?.trim();
    const canton = persona.canton?.trim();
    const parroquia = persona.parroquia?.trim();
    const barrio = persona.barrioSector?.trim();
    const piezas = [provincia, canton, parroquia, barrio].filter((parte): parte is string => !!parte && parte.length > 0);
    return piezas.length ? piezas.join(' · ') : 'Sin direccion registrada';
  }

  fechaResumen(value?: string | null): string {
    if (!value) {
      return 'Sin registro';
    }
    const instante = new Date(value);
    if (!Number.isFinite(instante.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(instante);
  }

  condicionLabel(value?: string | null): string {
    if (!value) {
      return 'Sin condicion';
    }
    const normalized = value.trim().toUpperCase();
    if (normalized.includes('ALTA')) {
      return 'Alta';
    }
    if (normalized.includes('SEGUIMIENTO')) {
      return 'Seguimiento';
    }
    if (normalized.includes('TRANSFERENCIA') || normalized.includes('DERIV')) {
      return 'Transferencia';
    }
    return value.trim();
  }

  estadoLabel(value?: string | null): string {
    if (!value) {
      return 'Sin estado';
    }
    const normalized = value.trim().toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  paginaAnterior() {
    const current = this.state();
    if (current.mode !== 'APELLIDOS' || current.page === 0) return;
    this.buscar(current.page - 1);
  }

  siguientePagina() {
    const current = this.state();
    if (current.mode !== 'APELLIDOS') return;
    if (current.page + 1 >= current.totalPages) return;
    this.buscar(current.page + 1);
  }

  limpiar() {
    this.form.reset({ cedula: '', apellidos: '' });
    this.error.set(null);
    this.detail.set(null);
    this.pageResult.set(null);
    this.state.set({ mode: null, page: 0, size: 10, totalPages: 0 });
    this.sinResultados.set(false);
    this.mensajeExito.set(null);
    this.seleccionDestacadaId.set(null);
    this.historialResumen.set({});
  }

  verDetalle(persona: PersonalMilitarDTO) {
    const identifier = typeof persona.id === 'number' ? persona.id : Number(persona.id ?? Number.NaN);
    if (!Number.isFinite(identifier)) {
      this.error.set('El registro seleccionado no contiene identificador valido.');
      return;
    }
    this.router.navigate(['/psicologo/personal', Number(identifier)], {
      state: { persona: this.normalizarPersona(persona) }
    }).catch(() => {});
  }

  irAlHistorial(persona: PersonalMilitarDTO) {
    const identifier = typeof persona.id === 'number' ? persona.id : Number(persona.id ?? Number.NaN);
    if (!Number.isFinite(identifier)) {
      this.error.set('No se puede abrir el historial sin un identificador valido.');
      return;
    }
    this.router.navigate(['/psicologo/personal', Number(identifier), 'historial'], {
      state: { persona: this.normalizarPersona(persona) }
    }).catch(() => {});
  }

  private ejecutarBusquedaCedula(cedula: string) {
    this.loading.set(true);
    this.state.set({ mode: 'CEDULA', page: 0, size: 1, totalPages: 1 });
    this.pageResult.set(null);
    this.detail.set(null);
    this.sinResultados.set(false);
    this.historialResumen.set({});

    this.service.buscarPorCedula(cedula)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (persona) => {
          this.loading.set(false);
          this.sinResultados.set(false);
          const normalizada = persona ? this.normalizarPersona(persona) : null;
          this.detail.set(normalizada);
          if (normalizada) {
            this.actualizarResumenes([normalizada]);
            const id = this.idPara(normalizada);
            if (id !== null) {
              this.seleccionDestacadaId.set(Number(id));
            }
          } else {
            this.historialResumen.set({});
            this.seleccionDestacadaId.set(null);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.detail.set(null);
          this.historialResumen.set({});
          this.error.set(this.resolverError(err));
          this.sinResultados.set(true);
          this.seleccionDestacadaId.set(null);
        }
      });
  }

  private ejecutarBusquedaApellidos(apellidos: string, page: number) {
    this.loading.set(true);
    this.detail.set(null);
    this.historialResumen.set({});
    this.service.buscarPorApellidos(apellidos, page, this.state().size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.pageResult.set(res);
          const totalPages = res?.totalPages ?? 0;
          this.state.set({ mode: 'APELLIDOS', page: res?.number ?? page, size: res?.size ?? 10, totalPages: totalPages || 1 });
          const contenido = res?.content ?? [];
          if (contenido.length > 0) {
            this.error.set(null);
            this.sinResultados.set(false);
            this.seleccionDestacadaId.set(null);
            this.actualizarResumenes(contenido);
          } else {
            this.error.set('No se encontraron registros con los apellidos proporcionados.');
            this.sinResultados.set(true);
            this.historialResumen.set({});
            this.seleccionDestacadaId.set(null);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.pageResult.set(null);
          this.state.set({ mode: 'APELLIDOS', page, size: this.state().size, totalPages: 0 });
          this.error.set(this.resolverError(err));
          this.historialResumen.set({});
          this.sinResultados.set(true);
        }
      });
  }

  private actualizarResumenes(personas: PersonalMilitarDTO[]) {
    const ids = personas
      .map((persona) => this.idPara(persona))
      .filter((id): id is number => id !== null);

    if (!ids.length) {
      this.historialResumen.set({});
      return;
    }

    const estadoInicial: Record<number, HistorialResumen> = {};
    ids.forEach((id) => {
      estadoInicial[id] = { total: 0, ultimaFecha: null, ultimaCondicion: null, ultimoEstado: null, cargando: true };
    });
    this.historialResumen.set(estadoInicial);

    const solicitudes = ids.map((id) =>
      this.fichasService.obtenerHistorial(id).pipe(
        map((items) => ({ id, resumen: this.crearResumen(items ?? []) })),
        catchError(() => of({ id, resumen: this.crearResumen([]) }))
      )
    );

    forkJoin(solicitudes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((respuestas) => {
        const actual = { ...this.historialResumen() };
        respuestas.forEach(({ id, resumen }) => {
          actual[id] = { ...resumen, cargando: false };
        });
        this.historialResumen.set(actual);
      });
  }

  private crearResumen(items: readonly FichaPsicologicaHistorialDTO[]): HistorialResumen {
    if (!items?.length) {
      return { total: 0, ultimaFecha: null, ultimaCondicion: null, ultimoEstado: null, cargando: false };
    }
    const ordenados = [...items].sort((a, b) => {
      const fechaA = a?.fechaEvaluacion ? new Date(a.fechaEvaluacion).getTime() : Number.NaN;
      const fechaB = b?.fechaEvaluacion ? new Date(b.fechaEvaluacion).getTime() : Number.NaN;
      return (Number.isFinite(fechaB) ? fechaB : 0) - (Number.isFinite(fechaA) ? fechaA : 0);
    });
    const ultimo = ordenados[0];
    return {
      total: items.length,
      ultimaFecha: ultimo?.fechaEvaluacion ?? null,
      ultimaCondicion: ultimo?.condicion ?? null,
      ultimoEstado: ultimo?.estado ?? null,
      cargando: false
    };
  }

  private resolverError(err: unknown): string {
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status?: number }).status;
      if (status === 404) {
        return 'No se encontro personal con los datos proporcionados.';
      }
      if (status === 400) {
        return 'Busqueda invalida. Revisa los criterios ingresados.';
      }
    }
    if (err && typeof err === 'object' && 'error' in err) {
      const anyErr = err as { error?: any };
      const message = typeof anyErr.error === 'string' ? anyErr.error : anyErr.error?.message;
      if (typeof message === 'string' && message.trim().length) {
        return message;
      }
    }
    return 'Ocurrio un error al realizar la busqueda.';
  }

  private normalizarPersona(persona: PersonalMilitarDTO): PersonalMilitarDTO {
    const apellidosNombres = persona.apellidosNombres?.trim();
    if (apellidosNombres?.length) {
      return persona;
    }
    return {
      ...persona,
      apellidosNombres: this.nombrePara(persona)
    };
  }

}
