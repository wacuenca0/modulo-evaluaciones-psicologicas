import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsignacionesService } from '../../../services/asignaciones.service';
import { PersonalMilitarService } from '../../../services/personal-militar.service';
import { PsicologosService } from '../../../services/psicologos.service';
import { AsignacionDTO, AsignacionPayload, EstadoAsignacion } from '../../../models/asignacion.models';
import { PersonalMilitarDTO } from '../../../models/personal-militar.models';
import { PsicologoDTO } from '../../../models/psicologo.models';

@Component({
  selector: 'app-asignaciones-admin',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Gestión operativa</p>
        <h1 class="text-2xl font-semibold text-slate-900">Asignaciones de casos</h1>
        <p class="text-sm text-slate-500">Controla la derivación de personal militar hacia los profesionales disponibles.</p>
      </header>

      @if (status()) {
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{{ status() }}</div>
      }

      <div class="grid gap-4 lg:grid-cols-[1fr,25rem]">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-lg font-semibold text-slate-900">Asignaciones activas</h2>
            <div class="flex gap-2 text-xs">
              <button type="button" (click)="filtrar('PENDIENTE')" class="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition">Pendientes</button>
              <button type="button" (click)="filtrar('EN_PROCESO')" class="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition">En proceso</button>
              <button type="button" (click)="filtrar('FINALIZADA')" class="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition">Finalizadas</button>
            </div>
          </div>

          @if (loading()) {
            <div class="py-10 text-center text-sm text-slate-500">Cargando asignaciones...</div>
          } @else if (!asignaciones().length) {
            <div class="py-10 text-center text-sm text-slate-500">No hay asignaciones registradas.</div>
          } @else {
            <ul class="divide-y divide-slate-100">
              @for (item of asignaciones(); track item.id) {
                <li class="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ item.personal.nombres }} {{ item.personal.apellidos }}</p>
                    <p class="text-xs text-slate-500">Asignado a {{ item.psicologo.nombres }} {{ item.psicologo.apellidos }}</p>
                    <p class="text-xs text-slate-500 mt-1">Prioridad: {{ item.prioridad || 'MEDIA' }} • Fecha: {{ item.fechaAsignacion | date:'shortDate' }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <select
                      #estadoSelect
                      class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                      [value]="item.estado"
                      (change)="actualizarEstado(item, estadoSelect.value)"
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROCESO">En proceso</option>
                      <option value="FINALIZADA">Finalizada</option>
                      <option value="ANULADA">Anulada</option>
                    </select>
                    <button type="button" (click)="reasignar(item)" class="rounded-md border border-militar-primary px-3 py-1 text-xs font-semibold text-militar-primary hover:bg-militar-primary hover:text-white transition">Reasignar</button>
                  </div>
                </li>
              }
            </ul>
          }
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Nueva asignación</h2>
          <p class="mb-4 text-xs text-slate-500">Selecciona al personal militar a evaluar y al profesional responsable.</p>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-3">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Personal militar
              <select formControlName="personalId" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="">Seleccionar</option>
                @for (persona of personalOptions(); track persona.id) {
                  <option [value]="persona.id">{{ persona.nombres }} {{ persona.apellidos }} • {{ persona.grado }}</option>
                }
              </select>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Psicólogo responsable
              <select formControlName="psicologoId" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="">Seleccionar</option>
                @for (psicologo of psicologoOptions(); track psicologo.id) {
                  <option [value]="psicologo.id">{{ psicologo.nombres }} {{ psicologo.apellidos }} • {{ psicologo.especialidad || 'General' }}</option>
                }
              </select>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Prioridad
              <select formControlName="prioridad" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Observaciones
              <textarea formControlName="observaciones" rows="4" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
            </label>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" (click)="limpiarFormulario()" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Limpiar</button>
              <button type="submit" [disabled]="form.invalid || saving()" class="rounded-md bg-militar-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-militar-accent transition disabled:cursor-not-allowed disabled:opacity-60">
                {{ saving() ? 'Asignando...' : 'Asignar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class AsignacionesAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly asignacionesService = inject(AsignacionesService);
  private readonly personalService = inject(PersonalMilitarService);
  private readonly psicologosService = inject(PsicologosService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly status = signal<string | null>(null);
  readonly asignaciones = signal<AsignacionDTO[]>([]);
  readonly personalOptions = signal<PersonalMilitarDTO[]>([]);
  readonly psicologoOptions = signal<PsicologoDTO[]>([]);
  private estadoFiltro: EstadoAsignacion | undefined;

  form: FormGroup = this.fb.group({
    personalId: ['', Validators.required],
    psicologoId: ['', Validators.required],
    prioridad: ['MEDIA', Validators.required],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.cargarReferencias();
    this.cargarAsignaciones();
  }

  filtrar(estado: EstadoAsignacion) {
    this.estadoFiltro = estado;
    this.cargarAsignaciones();
  }

  guardar() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = this.form.value as AsignacionPayload;
    this.asignacionesService.create(payload).subscribe({
      next: () => {
        this.status.set('Asignación registrada correctamente.');
        this.saving.set(false);
        this.cargarAsignaciones();
        this.limpiarFormulario();
      },
      error: (err) => {
        this.saving.set(false);
        this.status.set(err?.error?.message || 'No se pudo registrar la asignación.');
      }
    });
  }

  limpiarFormulario() {
    this.form.reset({ prioridad: 'MEDIA' });
  }

  actualizarEstado(item: AsignacionDTO, estado: string) {
    const estadoTyped = estado as EstadoAsignacion;
    this.asignacionesService.actualizarEstado(item.id, estadoTyped).subscribe({
      next: () => {
        this.status.set(`Asignación actualizada a estado ${estadoTyped}.`);
        this.cargarAsignaciones();
      }
    });
  }

  reasignar(item: AsignacionDTO) {
    const nuevoPsicologo = this.psicologoOptions()[0];
    if (!nuevoPsicologo) return;
    this.asignacionesService.reasignar(item.id, { psicologoId: nuevoPsicologo.id }).subscribe({
      next: () => {
        this.status.set('Caso reasignado con éxito.');
        this.cargarAsignaciones();
      }
    });
  }

  private cargarAsignaciones() {
    this.loading.set(true);
    const filter = { page: 0, size: 25, estado: this.estadoFiltro };
    this.asignacionesService.list(filter).subscribe({
      next: (response) => {
        this.asignaciones.set(response.content);
        this.loading.set(false);
      },
      error: () => {
        this.asignaciones.set([]);
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
