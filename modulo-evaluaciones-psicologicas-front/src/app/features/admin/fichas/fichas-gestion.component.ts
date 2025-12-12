import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FichasClinicasService } from '../../../services/fichas-clinicas.service';
import { PersonalMilitarService } from '../../../services/personal-militar.service';
import { PsicologosService } from '../../../services/psicologos.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { FichaClinicaDTO, FichaClinicaPayload, DiagnosticoDTO } from '../../../models/ficha-clinica.models';
import { PersonalMilitarDTO } from '../../../models/personal-militar.models';
import { PsicologoDTO } from '../../../models/psicologo.models';
import { CatalogoCIE10DTO } from '../../../models/catalogo.models';

@Component({
  selector: 'app-fichas-gestion',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Gestión clínica</p>
        <h1 class="text-2xl font-semibold text-slate-900">Fichas de evaluación</h1>
        <p class="text-sm text-slate-500">Administra la información clínica, diagnósticos y hallazgos de cada caso.</p>
      </header>

      @if (status()) {
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{{ status() }}</div>
      }

      <div class="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-lg font-semibold text-slate-900">Fichas abiertas</h2>
            <button type="button" (click)="cargar()" class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Actualizar</button>
          </div>

          @if (loading()) {
            <div class="py-10 text-center text-sm text-slate-500">Cargando fichas...</div>
          } @else if (!fichas().length) {
            <div class="py-10 text-center text-sm text-slate-500">No se han registrado fichas clínicas.</div>
          } @else {
            <div class="space-y-4">
              @for (ficha of fichas(); track ficha.id) {
                <article class="rounded-xl border border-slate-200 p-4 transition hover:border-militar-primary hover:shadow" (click)="seleccionar(ficha)">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-slate-900">{{ ficha.personal.nombres }} {{ ficha.personal.apellidos }}</p>
                      <p class="text-xs text-slate-500">Psicólogo: {{ ficha.psicologo?.nombres || 'Sin asignar' }}</p>
                    </div>
                    <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{{ ficha.estado }}</span>
                  </div>
                  <p class="mt-2 text-xs text-slate-500">Motivo: {{ ficha.motivoConsulta || '—' }}</p>
                  <p class="mt-1 text-xs text-slate-400">Apertura: {{ ficha.fechaApertura | date:'shortDate' }}</p>
                </article>
              }
            </div>
          }
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 class="text-lg font-semibold text-slate-900">{{ seleccionada() ? 'Detalle de ficha' : 'Nueva ficha clínica' }}</h2>
          <p class="text-xs text-slate-500">{{ seleccionada() ? 'Actualiza la información y registra diagnósticos para la ficha seleccionada.' : 'Registra una nueva ficha clínica para un personal militar.' }}</p>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-3">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Personal
              <select formControlName="personalId" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="">Seleccionar</option>
                @for (item of personalOptions(); track item.id) {
                  <option [value]="item.id">{{ item.nombres }} {{ item.apellidos }}</option>
                }
              </select>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Psicólogo
              <select formControlName="psicologoId" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="">Seleccionar</option>
                @for (item of psicologoOptions(); track item.id) {
                  <option [value]="item.id">{{ item.nombres }} {{ item.apellidos }}</option>
                }
              </select>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Motivo de consulta
              <textarea formControlName="motivoConsulta" rows="2" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Anamnesis
              <textarea formControlName="anamnesis" rows="3" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Evaluación mental
              <textarea formControlName="evaluacionMental" rows="3" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Observaciones
              <textarea formControlName="observaciones" rows="2" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
            </label>
            <div class="flex justify-end gap-2">
              <button type="button" (click)="cancelar()" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Cancelar</button>
              <button type="submit" [disabled]="form.invalid || saving()" class="rounded-md bg-militar-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-militar-accent transition disabled:cursor-not-allowed disabled:opacity-60">
                {{ saving() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>

          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-900">Diagnósticos (CIE-10)</h3>
              <div class="flex gap-2 text-xs">
                <input
                  type="text"
                  [value]="busquedaCie10()"
                  #busquedaCie10Input
                  (input)="actualizarBusqueda(busquedaCie10Input.value)"
                  placeholder="Buscar código o descripción"
                  class="w-48 rounded-md border border-slate-200 px-3 py-1 focus:border-militar-accent focus:outline-none focus:ring"
                />
                <button type="button" (click)="buscarCie10()" class="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition">Buscar</button>
              </div>
            </div>

            @if (resultadoCie10().length) {
              <div class="rounded-lg border border-slate-200 p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Resultados</p>
                <ul class="mt-2 space-y-2">
                  @for (item of resultadoCie10(); track item.codigo) {
                    <li class="flex items-center justify-between text-sm">
                      <span>{{ item.codigo }} • {{ item.descripcion }}</span>
                      <button type="button" (click)="agregarDiagnostico(item)" class="rounded-md border border-militar-primary px-3 py-1 text-xs font-semibold text-militar-primary hover:bg-militar-primary hover:text-white transition">Agregar</button>
                    </li>
                  }
                </ul>
              </div>
            }

            <div class="rounded-lg border border-slate-200 p-3">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Diagnósticos registrados</p>
              @if (!diagnosticos().length) {
                <p class="pt-2 text-xs text-slate-500">No hay diagnósticos añadidos.</p>
              } @else {
                <ul class="mt-2 space-y-2">
                  @for (diag of diagnosticos(); track diag.cie10Codigo; let i = $index) {
                    <li class="flex items-center justify-between text-sm">
                      <span>{{ diag.cie10Codigo }} • {{ diag.descripcion }}</span>
                      <button type="button" (click)="removerDiagnostico(i)" class="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition">Quitar</button>
                    </li>
                  }
                </ul>
              }
            </div>

            @if (seleccionada()) {
              <button type="button" (click)="cerrarFicha()" class="w-full rounded-md border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition">Cerrar ficha clínica</button>
            }
          </section>
        </div>
      </div>
    </section>
  `
})
export class FichasGestionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly fichasService = inject(FichasClinicasService);
  private readonly personalService = inject(PersonalMilitarService);
  private readonly psicologosService = inject(PsicologosService);
  private readonly catalogosService = inject(CatalogosService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly status = signal<string | null>(null);
  readonly fichas = signal<FichaClinicaDTO[]>([]);
  readonly seleccionada = signal<FichaClinicaDTO | null>(null);
  readonly personalOptions = signal<PersonalMilitarDTO[]>([]);
  readonly psicologoOptions = signal<PsicologoDTO[]>([]);
  readonly diagnosticos = signal<DiagnosticoDTO[]>([]);
  readonly resultadoCie10 = signal<CatalogoCIE10DTO[]>([]);
  readonly busquedaCie10 = signal('');

  form: FormGroup = this.fb.group({
    personalId: ['', Validators.required],
    psicologoId: ['', Validators.required],
    motivoConsulta: ['', Validators.required],
    anamnesis: [''],
    evaluacionMental: [''],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarReferencias();
  }

  seleccionar(ficha: FichaClinicaDTO) {
    this.seleccionada.set(ficha);
    this.form.patchValue({
      personalId: ficha.personal.id,
      psicologoId: ficha.psicologo?.id || '',
      motivoConsulta: ficha.motivoConsulta,
      anamnesis: ficha.anamnesis,
      evaluacionMental: ficha.evaluacionMental,
      observaciones: ficha.observaciones
    });
    this.diagnosticos.set(ficha.diagnosticos || []);
  }

  cancelar() {
    this.seleccionada.set(null);
    this.form.reset();
    this.diagnosticos.set([]);
  }

  guardar() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload: FichaClinicaPayload = {
      ...(this.form.value as FichaClinicaPayload),
      diagnosticos: this.diagnosticos()
    };
    const request = this.seleccionada()
      ? this.fichasService.update(this.seleccionada()!.id, payload)
      : this.fichasService.create(payload);

    request.subscribe({
      next: () => {
        this.status.set('Ficha clínica guardada correctamente.');
        this.saving.set(false);
        this.cargar();
        this.cancelar();
      },
      error: (err) => {
        this.saving.set(false);
        this.status.set(err?.error?.message || 'No se pudo guardar la ficha.');
      }
    });
  }

  cerrarFicha() {
    if (!this.seleccionada()) return;
    this.fichasService.cerrarFicha(this.seleccionada()!.id, { observaciones: this.form.get('observaciones')?.value }).subscribe({
      next: () => {
        this.status.set('Ficha clínica cerrada.');
        this.cargar();
        this.cancelar();
      }
    });
  }

  buscarCie10() {
    const termino = this.busquedaCie10().trim();
    if (!termino || termino.length < 3) {
      this.status.set('Ingresa al menos 3 caracteres para buscar en CIE-10.');
      return;
    }
    this.catalogosService.buscarCIE10(termino).subscribe({
      next: (items) => this.resultadoCie10.set(items.slice(0, 10))
    });
  }

  agregarDiagnostico(item: CatalogoCIE10DTO) {
    const nuevo: DiagnosticoDTO = { cie10Codigo: item.codigo, descripcion: item.descripcion, tipo: 'PRINCIPAL' };
    const existentes = this.diagnosticos();
    if (existentes.some(d => d.cie10Codigo === item.codigo)) return;
    this.diagnosticos.set([...existentes, nuevo]);
    this.resultadoCie10.set([]);
    this.busquedaCie10.set('');
  }

  removerDiagnostico(index: number) {
    const list = [...this.diagnosticos()];
    list.splice(index, 1);
    this.diagnosticos.set(list);
  }

  actualizarBusqueda(valor: string) {
    this.busquedaCie10.set(valor);
  }

  cargar() {
    this.loading.set(true);
    this.fichasService.list({ page: 0, size: 25, estado: 'EN_PROCESO' }).subscribe({
      next: (response) => {
        this.fichas.set(response.content);
        this.loading.set(false);
      },
      error: () => {
        this.fichas.set([]);
        this.loading.set(false);
      }
    });
  }

  private cargarReferencias() {
    this.personalService.list({ page: 0, size: 50, estado: 'ACTIVO' }).subscribe({
      next: (response) => this.personalOptions.set(response.content)
    });
    this.psicologosService.list({ page: 0, size: 50, estado: 'ACTIVO' }).subscribe({
      next: (response) => this.psicologoOptions.set(response.content)
    });
  }
}
