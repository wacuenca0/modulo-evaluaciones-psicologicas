import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonalMilitarService } from '../../services/personal-militar.service';
import { PersonalMilitarDTO, PersonalMilitarPayload, Sexo } from '../../models/personal-militar.models';

const edadOFechaValidator: ValidatorFn = (group) => {
  const edadControl = group.get('edad');
  const fechaControl = group.get('fechaNacimiento');
  const edadValue = edadControl?.value;
  const fechaValue = fechaControl?.value;
  const edadVacia = edadValue === null || edadValue === undefined || (`${edadValue}`.trim() === '');
  const fechaVacia = !fechaValue || `${fechaValue}`.trim() === '';
  if (!edadVacia || !fechaVacia) {
    return null;
  }
  return { edadOFecha: true } satisfies ValidationErrors;
};

interface PasoFormulario {
  id: string;
  titulo: string;
  descripcion: string;
  controles: ReadonlyArray<string>;
}

@Component({
  selector: 'app-personal-detail',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Gestion clinica</p>
          <h1 class="text-3xl font-semibold text-slate-900">{{ titulo() }}</h1>
          <p class="text-sm text-slate-500 max-w-2xl">Completa la informacion por secciones para registrar o actualizar al personal militar.</p>
        </div>
        <button type="button" (click)="cerrar()"
          class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          [disabled]="cargando()">
          Cerrar
        </button>
      </header>

      <nav class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        @for (paso of pasos; track paso.id; let index = $index) {
          <div class="rounded-2xl border px-4 py-3 transition"
            [class.border-slate-900]="pasoActual() === index"
            [class.bg-slate-900]="pasoActual() === index"
            [class.text-white]="pasoActual() === index"
            [class.border-slate-200]="pasoActual() !== index"
            [class.bg-white]="pasoActual() !== index">
            <p class="text-xs font-semibold uppercase tracking-wide">Paso {{ index + 1 }}</p>
            <p class="text-sm font-semibold">{{ paso.titulo }}</p>
            <p class="text-xs" [class.text-slate-300]="pasoActual() === index" [class.text-slate-500]="pasoActual() !== index">{{ paso.descripcion }}</p>
          </div>
        }
      </nav>

      @if (mensajeError()) {
        <div class="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span aria-hidden="true" class="mt-0.5 text-base font-semibold">!</span>
          <p class="flex-1">{{ mensajeError() }}</p>
        </div>
      }

      @if (mensajeExito()) {
        <div class="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{{ mensajeExito() }}</span>
          <span aria-hidden="true" class="inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-500"></span>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()"
        class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        @switch (pasoActual()) {
          @case (0) {
            <section class="grid gap-4 md:grid-cols-2">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cedula
                <input formControlName="cedula" type="text" maxlength="20" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"
                  [class.border-red-400]="controlConError('cedula')" />
                @if (controlConError('cedula')) {
                  <span class="mt-1 block text-xs text-red-600">Ingresa una cedula valida.</span>
                }
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 md:col-span-2">
                Apellidos y nombres
                <input formControlName="apellidosNombres" type="text" maxlength="200" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"
                  [class.border-red-400]="controlConError('apellidosNombres')" />
                @if (controlConError('apellidosNombres')) {
                  <span class="mt-1 block text-xs text-red-600">Este campo es obligatorio.</span>
                }
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tipo de persona
                <select formControlName="tipoPersona"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                  @for (tipo of tipoPersonaOpciones; track tipo) {
                    <option [value]="tipo">{{ tipo }}</option>
                  }
                </select>
              </label>
              <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <input type="checkbox" formControlName="esMilitar"
                  class="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900" />
                Es militar en servicio
              </label>
            </section>
          }
          @case (1) {
            <section class="grid gap-4 md:grid-cols-2">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fecha de nacimiento
                <input formControlName="fechaNacimiento" type="date"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Edad
                <input formControlName="edad" type="number" min="0"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"
                  [class.border-red-400]="controlConError('edad')" />
                @if (controlConError('edad')) {
                  <span class="mt-1 block text-xs text-red-600">La edad debe ser un numero mayor o igual a 0.</span>
                }
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sexo
                <select formControlName="sexo"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                  @for (sexo of sexoOpciones; track sexo) {
                    <option [value]="sexo">{{ sexo }}</option>
                  }
                </select>
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado civil
                <select formControlName="estadoCivil"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                  <option value="">Selecciona...</option>
                  @for (estado of estadoCivilOpciones; track estado) {
                    <option [value]="estado">{{ estado }}</option>
                  }
                </select>
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Etnia
                <select formControlName="etnia"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                  <option value="">Selecciona...</option>
                  @for (etnia of etniaOpciones; track etnia) {
                    <option [value]="etnia">{{ etnia }}</option>
                  }
                </select>
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Numero de hijos
                <input formControlName="numeroHijos" type="number" min="0"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"
                  [class.border-red-400]="controlConError('numeroHijos')" />
                @if (controlConError('numeroHijos')) {
                  <span class="mt-1 block text-xs text-red-600">Ingrese un valor igual o mayor a 0.</span>
                }
              </label>
            </section>
            @if (edadOFechaInvalido()) {
              <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                Proporciona la edad o la fecha de nacimiento para continuar.
              </div>
            }
          }
          @case (2) {
            <section class="grid gap-4 md:grid-cols-2">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 md:col-span-2">
                Ocupacion
                <input formControlName="ocupacion" type="text" maxlength="150" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <input type="checkbox" formControlName="servicioActivo"
                  class="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900" />
                Servicio activo
              </label>
              <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <input type="checkbox" formControlName="servicioPasivo"
                  class="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900" />
                Servicio pasivo
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Seguro
                <select formControlName="seguro"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                  <option value="">Selecciona...</option>
                  @for (seguro of seguroOpciones; track seguro) {
                    <option [value]="seguro">{{ seguro }}</option>
                  }
                </select>
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Grado
                <input formControlName="grado" type="text" maxlength="100" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Especialidad
                <input formControlName="especialidad" type="text" maxlength="150" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
            </section>
          }
          @case (3) {
            <section class="grid gap-4 md:grid-cols-2">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Provincia
                <input formControlName="provincia" type="text" maxlength="100" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Canton
                <input formControlName="canton" type="text" maxlength="100" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Parroquia
                <input formControlName="parroquia" type="text" maxlength="100" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Barrio o sector
                <input formControlName="barrioSector" type="text" maxlength="150" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Telefono
                <input formControlName="telefono" type="text" maxlength="20" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Celular
                <input formControlName="celular" type="text" maxlength="20" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 md:col-span-2">
                Email
                <input formControlName="email" type="email" maxlength="200" autocomplete="off"
                  class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"
                  [class.border-red-400]="controlConError('email')" />
                @if (controlConError('email')) {
                  <span class="mt-1 block text-xs text-red-600">Ingresa un correo electronico valido.</span>
                }
              </label>
              <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <input type="checkbox" formControlName="activo"
                  class="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900" />
                Registro activo
              </label>
            </section>
          }
        }

        <footer class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-3">
            @if (pasoActual() > 0) {
              <button type="button" (click)="retroceder()"
                class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                [disabled]="cargando()">
                Anterior
              </button>
            }
            @if (!esUltimoPaso()) {
              <button type="submit"
                class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                [disabled]="cargando()">
                {{ cargando() ? 'Verificando...' : 'Continuar' }}
              </button>
            } @else {
              <button type="submit"
                class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                [disabled]="cargando()">
                {{ cargando() ? 'Guardando...' : botonTexto() }}
              </button>
            }
          </div>
          <div class="flex flex-wrap gap-3">
            @if (esEdicion()) {
              <button type="button" (click)="eliminar()"
                class="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                [disabled]="cargando()">
                Eliminar
              </button>
            }
            <button type="button" (click)="cerrar()"
              class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              [disabled]="cargando()">
              Cerrar
            </button>
          </div>
        </footer>
      </form>
    </section>
  `
})
export class PersonalDetailComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PersonalMilitarService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly pasos: ReadonlyArray<PasoFormulario> = [
    { id: 'identificacion', titulo: 'Identificacion', descripcion: 'Cedula y datos basicos', controles: ['cedula', 'apellidosNombres', 'tipoPersona', 'esMilitar'] },
    { id: 'demografia', titulo: 'Datos demograficos', descripcion: 'Nacimiento, sexo y grupo familiar', controles: ['fechaNacimiento', 'edad', 'sexo', 'estadoCivil', 'etnia', 'numeroHijos'] },
    { id: 'servicio', titulo: 'Servicio y situacion', descripcion: 'Condicion laboral y cobertura', controles: ['ocupacion', 'servicioActivo', 'servicioPasivo', 'seguro', 'grado', 'especialidad'] },
    { id: 'contacto', titulo: 'Ubicacion y contacto', descripcion: 'Direccion, telefonos y estado', controles: ['provincia', 'canton', 'parroquia', 'barrioSector', 'telefono', 'celular', 'email', 'activo'] }
  ];

  readonly sexoOpciones: ReadonlyArray<Sexo> = ['Masculino', 'Femenino'];
  readonly tipoPersonaOpciones: ReadonlyArray<string> = ['Militar', 'Dependiente', 'Civil'];
  readonly estadoCivilOpciones: ReadonlyArray<string> = ['Soltera', 'Soltero', 'Casada', 'Casado', 'Divorciada', 'Divorciado', 'Viuda', 'Viudo', 'Union de hecho', 'Separada', 'Separado'];
  readonly etniaOpciones: ReadonlyArray<string> = ['Mestiza', 'Afroecuatoriana', 'Indigena', 'Montubia', 'Blanca', 'Otra'];
  readonly seguroOpciones: ReadonlyArray<string> = ['ISSFA', 'IESS', 'Privado', 'Ninguno', 'Otro'];

  readonly form = this.fb.group({
    cedula: ['', [Validators.required, Validators.maxLength(20)]],
    apellidosNombres: ['', [Validators.required, Validators.maxLength(200)]],
    tipoPersona: ['Militar', Validators.required],
    esMilitar: [true],
    fechaNacimiento: [''],
    edad: ['', [Validators.min(0)]],
    sexo: ['Masculino' as Sexo, Validators.required],
    estadoCivil: [''],
    etnia: [''],
    numeroHijos: ['', [Validators.min(0)]],
    ocupacion: ['', [Validators.maxLength(150)]],
    servicioActivo: [true],
    servicioPasivo: [false],
    seguro: [''],
    grado: ['', [Validators.maxLength(100)]],
    especialidad: ['', [Validators.maxLength(150)]],
    provincia: ['', [Validators.maxLength(100)]],
    canton: ['', [Validators.maxLength(100)]],
    parroquia: ['', [Validators.maxLength(100)]],
    barrioSector: ['', [Validators.maxLength(150)]],
    telefono: ['', [Validators.maxLength(20)]],
    celular: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(200)]],
    activo: [true]
  }, { validators: edadOFechaValidator });

  readonly cargando = signal(false);
  readonly mensajeError = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly pasoActual = signal(0);
  readonly personalId = signal<number | null>(null);
  readonly persona = signal<PersonalMilitarDTO | null>(null);
  private redirectTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly esEdicion = computed(() => Number.isFinite(this.personalId()));
  readonly esUltimoPaso = computed(() => this.pasoActual() === this.pasos.length - 1);
  readonly titulo = computed(() => this.esEdicion() ? 'Actualizar personal militar' : 'Registrar personal militar');
  readonly botonTexto = computed(() => this.esEdicion() ? 'Guardar cambios' : 'Registrar personal');

  constructor() {
    this.resolverContexto();
  }

  onSubmit() {
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    if (this.esUltimoPaso()) {
      this.guardar();
      return;
    }
    this.irAlSiguientePaso();
  }

  retroceder() {
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.pasoActual.update((valor) => Math.max(valor - 1, 0));
  }

  cerrar() {
    this.clearRedirectTimeout();
    this.router.navigate(['/psicologo/personal']).catch(() => {});
  }

  eliminar() {
    const id = this.personalId();
    if (!Number.isFinite(id)) {
      this.mensajeError.set('No se puede eliminar un registro sin identificador.');
      return;
    }
    const confirmacion = globalThis.confirm('¿Deseas eliminar este registro de personal militar?');
    if (!confirmacion) {
      return;
    }
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.service.eliminar(Number(id)).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/psicologo/personal'], {
          replaceUrl: true,
          state: { mensaje: 'Personal eliminado correctamente.' }
        }).catch(() => {});
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set(this.resolverError(err));
      }
    });
  }

  controlConError(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && (control.dirty || control.touched);
  }

  edadOFechaInvalido(): boolean {
    if (this.pasoActual() !== 1) {
      return false;
    }
    return this.form.hasError('edadOFecha');
  }

  private irAlSiguientePaso() {
    const seccionValida = this.validarSeccionActual();
    if (!seccionValida) {
      this.mensajeError.set('Completa los datos de esta seccion antes de continuar.');
      return;
    }

    if (this.pasoActual() === 0) {
      this.verificarExistencia();
      return;
    }

    this.pasoActual.update((valor) => Math.min(valor + 1, this.pasos.length - 1));
  }

  private validarSeccionActual(): boolean {
    const paso = this.pasos[this.pasoActual()];
    let valido = true;
    for (const controlName of paso.controles) {
      const control = this.form.get(controlName);
      if (!control) {
        continue;
      }
      control.markAsTouched();
      control.updateValueAndValidity();
      if (control.invalid) {
        valido = false;
      }
    }
    if (this.pasoActual() === 1 && this.form.hasError('edadOFecha')) {
      valido = false;
    }
    return valido;
  }

  private verificarExistencia() {
    const cedulaControl = this.form.get('cedula');
    const cedula = this.normalizeOptionalString(cedulaControl?.value);
    if (!cedula) {
      this.mensajeError.set('La cedula es obligatoria para continuar.');
      cedulaControl?.markAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set(null);
    this.service.buscarPorCedula(cedula).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.personalId.set(res.id ?? null);
        this.persona.set(res);
        this.patchForm(res);
        this.mensajeExito.set('Se encontro un registro con esta cedula. Actualiza los datos y guarda los cambios.');
        this.pasoActual.update((valor) => Math.min(valor + 1, this.pasos.length - 1));
      },
      error: (err) => {
        this.cargando.set(false);
        if (err && typeof err === 'object' && 'status' in err && (err as { status?: number }).status === 404) {
          this.personalId.set(null);
          this.persona.set(null);
          this.mensajeExito.set('No existen registros con esta cedula. Completa las secciones siguientes para crear uno nuevo.');
          this.pasoActual.update((valor) => Math.min(valor + 1, this.pasos.length - 1));
          return;
        }
        this.mensajeError.set(this.resolverError(err));
      }
    });
  }

  private guardar() {
    const valido = this.validarSeccionActual();
    if (!valido) {
      this.mensajeError.set('Revisa los datos antes de guardar.');
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    const idActual = this.personalId();
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.clearRedirectTimeout();

    const accion = Number.isFinite(idActual)
      ? this.service.actualizar(Number(idActual), payload)
      : this.service.crear(payload);

    accion.subscribe({
      next: (res) => {
        this.cargando.set(false);
        const personaFinal: PersonalMilitarDTO = { ...res, id: res.id ?? idActual ?? undefined };
        this.personalId.set(personaFinal.id ?? null);
        this.persona.set(personaFinal);
        this.patchForm(personaFinal);
        const mensaje = this.esEdicion() ? 'Cambios guardados correctamente. Redirigiendo al historial clinico.' : 'Personal registrado correctamente. Redirigiendo al historial clinico.';
        this.mensajeExito.set(mensaje);
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.clearRedirectTimeout();
        const destinoId = personaFinal.id ?? res.id;
        if (Number.isFinite(destinoId)) {
          this.redirectTimeout = setTimeout(() => {
            this.router.navigate(['/psicologo/personal', Number(destinoId), 'historial'], {
              replaceUrl: true,
              state: { mensaje: 'Personal guardado correctamente. Ver historial y crear fichas.' }
            }).catch(() => {});
          }, 1200);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set(this.resolverError(err));
      }
    });
  }

  private resolverContexto() {
    const param = this.route.snapshot.paramMap.get('personalId');
    const id = this.parseNumeric(param);
    if (id !== null) {
      this.personalId.set(id);
    }

    const historyState = (globalThis.history?.state ?? {}) as Record<string, unknown>;
    const statePersona = (historyState['persona'] ?? null) as PersonalMilitarDTO | null;
    const personaId = this.parseNumeric(statePersona?.id);
    if (statePersona && (id === null || (personaId !== null && personaId === id))) {
      this.persona.set(statePersona);
      this.patchForm(statePersona);
    }

    if (id !== null && !this.persona()) {
      this.cargando.set(true);
      this.service.obtenerPorId(id).subscribe({
        next: (res) => {
          this.cargando.set(false);
          const resolvedId = this.parseNumeric(res.id) ?? id;
          this.personalId.set(resolvedId);
          this.persona.set(res);
          this.patchForm(res);
        },
        error: (err) => {
          this.cargando.set(false);
          this.mensajeError.set(this.resolverError(err));
        }
      });
    }
  }

  private patchForm(persona: PersonalMilitarDTO) {
    this.form.patchValue({
      cedula: persona.cedula ?? '',
      apellidosNombres: this.resolveApellidosNombres(persona),
      tipoPersona: persona.tipoPersona ?? (persona.esMilitar ? 'Militar' : 'Dependiente'),
      esMilitar: typeof persona.esMilitar === 'boolean' ? persona.esMilitar : (persona.tipoPersona?.toLowerCase() === 'militar'),
      fechaNacimiento: this.normalizeDateInput(persona.fechaNacimiento),
      edad: typeof persona.edad === 'number' ? String(persona.edad) : '',
      sexo: this.mapSexoFromApi(persona.sexo),
      estadoCivil: persona.estadoCivil ?? '',
      etnia: persona.etnia ?? '',
      numeroHijos: typeof persona.numeroHijos === 'number' ? String(persona.numeroHijos) : '',
      ocupacion: persona.ocupacion ?? '',
      servicioActivo: typeof persona.servicioActivo === 'boolean' ? persona.servicioActivo : true,
      servicioPasivo: typeof persona.servicioPasivo === 'boolean' ? persona.servicioPasivo : false,
      seguro: persona.seguro ?? '',
      grado: persona.grado ?? '',
      especialidad: persona.especialidad ?? '',
      provincia: persona.provincia ?? '',
      canton: persona.canton ?? '',
      parroquia: persona.parroquia ?? '',
      barrioSector: persona.barrioSector ?? '',
      telefono: persona.telefono ?? '',
      celular: persona.celular ?? '',
      email: persona.email ?? '',
      activo: typeof persona.activo === 'boolean' ? persona.activo : true
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private buildPayload(): PersonalMilitarPayload | null {
    const raw = this.form.getRawValue();
    const cedula = this.normalizeRequiredString(raw.cedula, 'cedula');
    const apellidosNombres = this.normalizeRequiredString(raw.apellidosNombres, 'apellidos y nombres');
    const tipoPersona = this.normalizeRequiredString(raw.tipoPersona, 'tipo de persona');
    const sexo = this.normalizeCatalogValue(raw.sexo, this.sexoOpciones, 'sexo');

    if (!cedula || !apellidosNombres || !tipoPersona) {
      return null;
    }

    let edad: number | null = null;
    if (raw.edad !== null && raw.edad !== undefined && `${raw.edad}`.trim() !== '') {
      const parsed = Number(raw.edad);
      if (!Number.isFinite(parsed) || parsed < 0) {
        this.mensajeError.set('La edad debe ser un numero mayor o igual a cero.');
        return null;
      }
      edad = Math.trunc(parsed);
    }

    const fechaNacimiento = this.normalizeOptionalString(raw.fechaNacimiento);
    if (edad == null && !fechaNacimiento) {
      this.mensajeError.set('Debes proporcionar la edad o la fecha de nacimiento.');
      return null;
    }

    let numeroHijos: number | null = null;
    if (raw.numeroHijos !== null && raw.numeroHijos !== undefined && `${raw.numeroHijos}`.trim() !== '') {
      const parsed = Number(raw.numeroHijos);
      if (!Number.isFinite(parsed) || parsed < 0) {
        this.mensajeError.set('El numero de hijos debe ser un valor igual o mayor a cero.');
        return null;
      }
      numeroHijos = Math.trunc(parsed);
    }

    const email = this.normalizeOptionalString(raw.email);
    if (email && this.form.get('email')?.invalid) {
      this.mensajeError.set('Ingresa un correo electronico valido.');
      return null;
    }

    return {
      cedula,
      apellidosNombres,
      tipoPersona,
      esMilitar: !!raw.esMilitar,
      fechaNacimiento,
      edad,
      sexo,
      etnia: this.normalizeOptionalString(raw.etnia),
      estadoCivil: this.normalizeOptionalString(raw.estadoCivil),
      numeroHijos,
      ocupacion: this.normalizeOptionalString(raw.ocupacion),
      servicioActivo: !!raw.servicioActivo,
      servicioPasivo: !!raw.servicioPasivo,
      seguro: this.normalizeOptionalString(raw.seguro),
      grado: this.normalizeOptionalString(raw.grado),
      especialidad: this.normalizeOptionalString(raw.especialidad),
      provincia: this.normalizeOptionalString(raw.provincia),
      canton: this.normalizeOptionalString(raw.canton),
      parroquia: this.normalizeOptionalString(raw.parroquia),
      barrioSector: this.normalizeOptionalString(raw.barrioSector),
      telefono: this.normalizeOptionalString(raw.telefono),
      celular: this.normalizeOptionalString(raw.celular),
      email,
      activo: !!raw.activo
    } satisfies PersonalMilitarPayload;
  }

  private resolveApellidosNombres(persona: PersonalMilitarDTO): string {
    const apellidosNombres = persona.apellidosNombres?.trim();
    if (apellidosNombres?.length) {
      return apellidosNombres;
    }
    const partes = [persona.apellidos, persona.nombres]
      .filter((parte): parte is string => !!parte && parte.trim().length > 0)
      .map((parte) => parte.trim());
    return partes.join(' ').trim();
  }

  private normalizeDateInput(value?: string): string {
    if (!value) {
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    if (trimmed.length >= 10) {
      return trimmed.slice(0, 10);
    }
    return trimmed;
  }

  private normalizeRequiredString(value: unknown, etiqueta: string): string {
    const normalizado = this.normalizeOptionalString(value);
    if (!normalizado) {
      this.mensajeError.set(`El campo ${etiqueta} es obligatorio.`);
    }
    return normalizado ?? '';
  }

  private mapSexoFromApi(value: unknown): Sexo {
    if (typeof value === 'string') {
      const normalized = value.trim().toUpperCase();
      if (normalized.startsWith('F')) {
        return 'Femenino';
      }
      if (normalized.startsWith('M')) {
        return 'Masculino';
      }
    }
    return 'Masculino';
  }

  private parseNumeric(value: unknown): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed.length) {
        return null;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private normalizeCatalogValue<T extends string>(valor: unknown, opciones: ReadonlyArray<T>, etiqueta: string): T {
    if (typeof valor === 'string') {
      const coincidente = opciones.find((item) => item.toLowerCase() === valor.trim().toLowerCase());
      if (coincidente) {
        return coincidente;
      }
    }
    this.mensajeError.set(`Selecciona un valor valido para ${etiqueta}.`);
    return opciones[0];
  }

  private normalizeOptionalString(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    }
    if (typeof value === 'number') {
      const trimmed = String(value).trim();
      return trimmed.length ? trimmed : null;
    }
    return null;
  }

  private resolverError(err: unknown): string {
    const status = this.extractStatus(err);
    if (status === 400) {
      return 'Los datos enviados no cumplen con las validaciones del servicio.';
    }
    if (status === 404) {
      return 'No se encontro personal militar con los datos proporcionados.';
    }
    if (status === 409) {
      return 'La cedula ya se encuentra registrada.';
    }
    const mensaje = this.extractErrorMessage(err);
    if (mensaje) {
      return mensaje;
    }
    return 'Ocurrio un error al procesar la solicitud.';
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
    if (!err || typeof err !== 'object') {
      return null;
    }
    if ('error' in err) {
      const contenido = (err as { error?: unknown }).error;
      const mensajeDesdeContenido = this.extractMessageFromPayload(contenido);
      if (mensajeDesdeContenido) {
        return mensajeDesdeContenido;
      }
    }
    return this.extractMessageFromPayload(err);
  }
  
  private extractMessageFromPayload(payload: unknown): string | null {
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

  ngOnDestroy(): void {
    this.clearRedirectTimeout();
  }

  private clearRedirectTimeout() {
    if (this.redirectTimeout !== null) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = null;
    }
  }
}
