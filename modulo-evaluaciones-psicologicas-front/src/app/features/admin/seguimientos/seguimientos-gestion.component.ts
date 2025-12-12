import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeguimientosService } from '../../../services/seguimientos.service';
import { FichasClinicasService } from '../../../services/fichas-clinicas.service';
import { SeguimientoDTO, SeguimientoPayload, EstadoSeguimiento } from '../../../models/seguimiento.models';
import { FichaClinicaDTO } from '../../../models/ficha-clinica.models';

@Component({
  selector: 'app-seguimientos-gestion',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Seguimiento clínico</p>
        <h1 class="text-2xl font-semibold text-slate-900">Registros de seguimiento</h1>
        <p class="text-sm text-slate-500">Documenta las sesiones y acuerdos derivados del proceso terapéutico.</p>
      </header>

      @if (status()) {
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{{ status() }}</div>
      }

      <div class="grid gap-4 lg:grid-cols-[1fr,26rem]">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-lg font-semibold text-slate-900">Seguimientos registrados</h2>
            <div class="flex gap-2 text-xs">
              <button type="button" (click)="filtrar('PENDIENTE')" class="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition">Pendientes</button>
              <button type="button" (click)="filtrar('EN_CURSO')" class="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition">En curso</button>
              <button type="button" (click)="filtrar('COMPLETADO')" class="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition">Completados</button>
            </div>
          </div>

          @if (loading()) {
            <div class="py-10 text-center text-sm text-slate-500">Cargando seguimientos...</div>
          } @else if (!seguimientos().length) {
            <div class="py-10 text-center text-sm text-slate-500">No hay registros para mostrar.</div>
          } @else {
            <ul class="divide-y divide-slate-100">
              @for (item of seguimientos(); track item.id) {
                <li class="flex flex-col gap-2 py-4">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold text-slate-900">Ficha {{ item.fichaId }}</p>
                    <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{{ item.estado }}</span>
                  </div>
                  <p class="text-xs text-slate-500">Sesión del {{ item.fecha | date:'shortDate' }}</p>
                  <p class="text-xs text-slate-500">Observaciones: {{ item.observaciones || '—' }}</p>
                  <div class="flex justify-end gap-2 text-xs">
                    <button type="button" (click)="editar(item)" class="rounded-md border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition">Editar</button>
                  </div>
                </li>
              }
            </ul>
          }
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">{{ seleccionado() ? 'Actualizar seguimiento' : 'Nuevo seguimiento' }}</h2>
          <p class="mb-4 text-xs text-slate-500">Registra la evolución del caso clínico.</p>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-3">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ficha clínica
              <select formControlName="fichaId" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="">Seleccionar ficha</option>
                @for (ficha of fichas(); track ficha.id) {
                  <option [value]="ficha.id">{{ ficha.codigo }} • {{ ficha.personal.nombres }} {{ ficha.personal.apellidos }}</option>
                }
              </select>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Observaciones
              <textarea formControlName="observaciones" rows="3" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recomendaciones
              <textarea formControlName="recomendaciones" rows="3" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Próxima cita
              <input type="date" formControlName="proximaCita" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Estado
              <select formControlName="estado" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_CURSO">En curso</option>
                <option value="COMPLETADO">Completado</option>
              </select>
            </label>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" (click)="cancelar()" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Cancelar</button>
              <button type="submit" [disabled]="form.invalid || saving()" class="rounded-md bg-militar-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-militar-accent transition disabled:cursor-not-allowed disabled:opacity-60">
                {{ saving() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class SeguimientosGestionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly seguimientosService = inject(SeguimientosService);
  private readonly fichasService = inject(FichasClinicasService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly status = signal<string | null>(null);
  readonly seguimientos = signal<SeguimientoDTO[]>([]);
  readonly fichas = signal<FichaClinicaDTO[]>([]);
  readonly seleccionado = signal<SeguimientoDTO | null>(null);
  private estadoFiltro: EstadoSeguimiento | undefined;

  form: FormGroup = this.fb.group({
    fichaId: ['', Validators.required],
    observaciones: ['', Validators.required],
    recomendaciones: [''],
    proximaCita: [''],
    estado: ['PENDIENTE', Validators.required]
  });

  ngOnInit(): void {
    this.cargarSeguimientos();
    this.cargarFichas();
  }

  filtrar(estado: EstadoSeguimiento) {
    this.estadoFiltro = estado;
    this.cargarSeguimientos();
  }

  editar(item: SeguimientoDTO) {
    this.seleccionado.set(item);
    this.form.patchValue({
      fichaId: item.fichaId,
      observaciones: item.observaciones,
      recomendaciones: item.recomendaciones,
      proximaCita: item.proximaCita?.substring(0, 10) || '',
      estado: item.estado
    });
  }

  cancelar() {
    this.seleccionado.set(null);
    this.form.reset({ estado: 'PENDIENTE' });
  }

  guardar() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = this.form.value as SeguimientoPayload;
    const request = this.seleccionado()
      ? this.seguimientosService.update(this.seleccionado()!.id, payload)
      : this.seguimientosService.create(payload);

    request.subscribe({
      next: () => {
        this.status.set('Seguimiento guardado correctamente.');
        this.saving.set(false);
        this.cargarSeguimientos();
        this.cancelar();
      },
      error: (err) => {
        this.saving.set(false);
        this.status.set(err?.error?.message || 'No se pudo guardar el seguimiento.');
      }
    });
  }

  private cargarSeguimientos() {
    this.loading.set(true);
    const filter = { page: 0, size: 25, estado: this.estadoFiltro };
    this.seguimientosService.list(filter).subscribe({
      next: (response) => {
        this.seguimientos.set(response.content);
        this.loading.set(false);
      },
      error: () => {
        this.seguimientos.set([]);
        this.loading.set(false);
      }
    });
  }

  private cargarFichas() {
    this.fichasService.list({ page: 0, size: 50, estado: 'EN_PROCESO' }).subscribe({
      next: (response) => this.fichas.set(response.content)
    });
  }
}
