import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PsicologosService } from '../../../services/psicologos.service';
import { PsicologoDTO, PsicologoPayload } from '../../../models/psicologo.models';

@Component({
  selector: 'app-psicologos-gestion',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Equipo clínico</p>
        <h1 class="text-2xl font-semibold text-slate-900">Psicólogos</h1>
        <p class="text-sm text-slate-500">Controla la disponibilidad y detalle de los profesionales de salud mental.</p>
      </header>

      @if (status()) {
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{{ status() }}</div>
      }

      <div class="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form [formGroup]="filterForm" (ngSubmit)="buscar()" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cédula
              <input type="text" formControlName="cedula" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nombre
              <input type="text" formControlName="nombres" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Estado
              <select formControlName="estado" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </label>
            <div class="md:col-span-3 flex justify-end gap-2">
              <button type="submit" class="rounded-md bg-militar-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-militar-accent transition">Buscar</button>
              <button type="button" (click)="limpiarFiltro()" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Limpiar</button>
            </div>
          </form>

          @if (loading()) {
            <div class="py-10 text-center text-sm text-slate-500">Cargando profesionales...</div>
          } @else if (!psicologos().length) {
            <div class="py-10 text-center text-sm text-slate-500">No hay profesionales registrados.</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm">
                <thead class="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3">Profesional</th>
                    <th class="px-4 py-3">Especialidad</th>
                    <th class="px-4 py-3">Contacto</th>
                    <th class="px-4 py-3">Estado</th>
                    <th class="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (item of psicologos(); track item.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3">
                        <div class="font-medium text-slate-900">{{ item.nombres }} {{ item.apellidos }}</div>
                        <p class="text-xs text-slate-500">Registro: {{ item.numeroRegistro || '—' }}</p>
                      </td>
                      <td class="px-4 py-3">{{ item.especialidad || 'General' }}</td>
                      <td class="px-4 py-3">
                        <p class="text-sm">{{ item.correoInstitucional || 'Sin correo' }}</p>
                        <p class="text-xs text-slate-500">{{ item.telefono || 'Sin teléfono' }}</p>
                      </td>
                      <td class="px-4 py-3">
                        <span class="rounded-full px-2 py-1 text-xs font-semibold" [class]="item.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">{{ item.estado }}</span>
                      </td>
                      <td class="px-4 py-3 text-right space-x-2">
                        <button type="button" (click)="editar(item)" class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Editar</button>
                        <button type="button" (click)="cambiarEstado(item)" class="rounded-md border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition">
                          {{ item.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">{{ seleccionado() ? 'Editar profesional' : 'Nuevo profesional' }}</h2>
          <p class="mb-4 text-xs text-slate-500">Registra los datos de identificación y contacto para el equipo clínico.</p>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-3">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Nombres
              <input type="text" formControlName="nombres" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Apellidos
              <input type="text" formControlName="apellidos" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cédula
              <input type="text" formControlName="cedula" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Especialidad
              <input type="text" formControlName="especialidad" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Registro profesional
              <input type="text" formControlName="numeroRegistro" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Correo institucional
              <input type="email" formControlName="correoInstitucional" autocomplete="off" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Teléfono
              <input type="tel" formControlName="telefono" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Estado
              <select formControlName="estado" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
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
export class PsicologosGestionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly psicologosService = inject(PsicologosService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly status = signal<string | null>(null);
  readonly psicologos = signal<PsicologoDTO[]>([]);
  readonly seleccionado = signal<PsicologoDTO | null>(null);

  filterForm: FormGroup = this.fb.group({
    cedula: [''],
    nombres: [''],
    estado: ['']
  });

  form: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    cedula: ['', [Validators.required, Validators.minLength(10)]],
    especialidad: [''],
    numeroRegistro: [''],
    correoInstitucional: ['', Validators.email],
    telefono: [''],
    estado: ['ACTIVO', Validators.required]
  });

  ngOnInit(): void {
    this.cargar();
  }

  buscar() {
    this.cargar();
  }

  limpiarFiltro() {
    this.filterForm.reset({ estado: '' });
    this.cargar();
  }

  nuevo() {
    this.seleccionado.set(null);
    this.form.reset({ estado: 'ACTIVO' });
  }

  editar(item: PsicologoDTO) {
    this.seleccionado.set(item);
    this.form.patchValue(item);
  }

  cambiarEstado(item: PsicologoDTO) {
    const nuevoEstado = item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.psicologosService.updateEstado(item.id, nuevoEstado).subscribe({
      next: () => {
        this.status.set(`El profesional ${item.nombres} ${item.apellidos} cambió a estado ${nuevoEstado}.`);
        this.cargar();
      }
    });
  }

  cancelar() {
    this.nuevo();
  }

  guardar() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = this.form.value as PsicologoPayload;
    const request = this.seleccionado()
      ? this.psicologosService.update(this.seleccionado()!.id, payload)
      : this.psicologosService.create(payload);

    request.subscribe({
      next: () => {
        this.status.set('Profesional guardado correctamente.');
        this.saving.set(false);
        this.cargar();
        this.nuevo();
      },
      error: (err) => {
        this.saving.set(false);
        this.status.set(err?.error?.message || 'No se pudo guardar la información.');
      }
    });
  }

  private cargar() {
    this.loading.set(true);
    const filtros = { ...this.filterForm.value, page: 0, size: 25 };
    this.psicologosService.list(filtros).subscribe({
      next: (response) => {
        this.psicologos.set(response.content);
        this.loading.set(false);
      },
      error: () => {
        this.psicologos.set([]);
        this.loading.set(false);
      }
    });
  }
}
