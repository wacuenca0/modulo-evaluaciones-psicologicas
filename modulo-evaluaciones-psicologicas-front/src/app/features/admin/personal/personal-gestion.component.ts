import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonalMilitarService } from '../../../services/personal-militar.service';
import { PersonalMilitarDTO, PersonalMilitarPayload } from '../../../models/personal-militar.models';

@Component({
  selector: 'app-personal-gestion',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Gestión administrativa</p>
        <h1 class="text-2xl font-semibold text-slate-900">Personal Militar</h1>
        <p class="text-sm text-slate-500">Administra el registro y la actualización de datos del personal militar evaluado.</p>
      </header>

      @if (status()) {
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{{ status() }}</div>
      }

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form [formGroup]="filterForm" (ngSubmit)="buscar()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cédula
            <input type="text" formControlName="cedula" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            NUP
            <input type="text" formControlName="nup" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Grado
            <input type="text" formControlName="grado" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Unidad
            <input type="text" formControlName="unidad" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
          </label>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Estado
            <select formControlName="estado" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </label>
          <div class="flex items-end gap-2 md:col-span-2">
            <button type="submit" class="inline-flex items-center justify-center rounded-md bg-militar-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-militar-accent transition">Buscar</button>
            <button type="button" (click)="limpiarFiltro()" class="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Limpiar</button>
          </div>
        </form>
      </div>

      <div class="flex flex-col gap-4 lg:flex-row">
        <div class="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-lg font-semibold text-slate-900">Registros</h2>
            <button type="button" (click)="nuevo()" class="rounded-md border border-militar-primary px-3 py-1 text-sm font-semibold text-militar-primary hover:bg-militar-primary hover:text-white transition">Nuevo</button>
          </div>

          @if (loading()) {
            <div class="py-10 text-center text-sm text-slate-500">Cargando registros...</div>
          } @else if (!personal().length) {
            <div class="py-10 text-center text-sm text-slate-500">No se encontraron resultados.</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm">
                <thead class="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-4 py-3">Nombre</th>
                    <th class="px-4 py-3">Identificación</th>
                    <th class="px-4 py-3">Grado</th>
                    <th class="px-4 py-3">Unidad</th>
                    <th class="px-4 py-3">Estado</th>
                    <th class="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (item of personal(); track item.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3">
                        <div class="font-medium text-slate-900">{{ item.nombres }} {{ item.apellidos }}</div>
                        <p class="text-xs text-slate-500">{{ item.profesion || 'Sin profesión' }}</p>
                      </td>
                      <td class="px-4 py-3">
                        <p class="text-sm font-medium">{{ item.cedula }}</p>
                        <p class="text-xs text-slate-500">NUP: {{ item.nup || 'N/D' }}</p>
                      </td>
                      <td class="px-4 py-3">{{ item.grado }}</td>
                      <td class="px-4 py-3">{{ item.unidad || '—' }}</td>
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

        <div class="w-full lg:w-96 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">{{ seleccionada() ? 'Editar registro' : 'Nuevo registro' }}</h2>
          <p class="mb-4 text-xs text-slate-500">Completa la información requerida para registrar o actualizar al personal militar.</p>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-3">
            <div class="grid grid-cols-1 gap-3">
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
                NUP
                <input type="text" formControlName="nup" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Grado
                <input type="text" formControlName="grado" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unidad
                <input type="text" formControlName="unidad" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Dependencia
                <input type="text" formControlName="dependencia" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Profesión
                <input type="text" formControlName="profesion" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Situación
                <select formControlName="situacion" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                  <option value="ACTIVO">Activo</option>
                  <option value="PASIVO">Pasivo</option>
                </select>
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
                <select formControlName="estado" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring">
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Teléfono
                <input type="tel" formControlName="telefono" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Correo institucional
                <input type="email" formControlName="correoInstitucional" autocomplete="off" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
              </label>
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Observaciones
                <textarea formControlName="observaciones" rows="3" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
              </label>
            </div>

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
export class PersonalGestionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly personalService = inject(PersonalMilitarService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly status = signal<string | null>(null);
  readonly personal = signal<PersonalMilitarDTO[]>([]);
  readonly seleccionada = signal<PersonalMilitarDTO | null>(null);

  filterForm: FormGroup = this.fb.group({
    cedula: [''],
    nup: [''],
    grado: [''],
    unidad: [''],
    estado: ['']
  });

  form: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    cedula: ['', [Validators.required, Validators.minLength(10)]],
    nup: [''],
    grado: ['', Validators.required],
    unidad: [''],
    dependencia: [''],
    profesion: [''],
    situacion: ['ACTIVO', Validators.required],
    estado: ['ACTIVO', Validators.required],
    telefono: [''],
    correoInstitucional: ['', Validators.email],
    observaciones: ['']
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
    this.seleccionada.set(null);
    this.form.reset({ situacion: 'ACTIVO', estado: 'ACTIVO' });
  }

  editar(item: PersonalMilitarDTO) {
    this.seleccionada.set(item);
    this.form.patchValue(item);
  }

  cambiarEstado(item: PersonalMilitarDTO) {
    const nuevoEstado = item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.personalService.updateEstado(item.id, nuevoEstado).subscribe({
      next: () => {
        this.status.set(`El registro ${item.nombres} ${item.apellidos} cambió a estado ${nuevoEstado}.`);
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
    const payload = this.form.value as PersonalMilitarPayload;
    const request = this.seleccionada()
      ? this.personalService.update(this.seleccionada()!.id, payload)
      : this.personalService.create(payload);

    request.subscribe({
      next: () => {
        this.status.set('Información guardada correctamente.');
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
    this.personalService.list(filtros).subscribe({
      next: (response) => {
        this.personal.set(response.content);
        this.loading.set(false);
      },
      error: () => {
        this.personal.set([]);
        this.loading.set(false);
      }
    });
  }
}
