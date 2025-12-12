import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogosService } from '../../../services/catalogos.service';
import { CatalogoCIE10DTO } from '../../../models/catalogo.models';

@Component({
  selector: 'app-catalogos-admin',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-widest text-slate-500">Configuración del sistema</p>
        <h1 class="text-2xl font-semibold text-slate-900">Catálogo CIE-10</h1>
        <p class="text-sm text-slate-500">Administra los diagnósticos clínicos permitidos en las fichas psicológicas.</p>
      </header>

      <section class="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <header class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-slate-900">Diagnósticos registrados</h2>
              <label class="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input type="checkbox" [checked]="soloActivos()" (change)="toggleSoloActivos($any($event.target).checked)" class="h-4 w-4 rounded border border-slate-300 text-militar-primary focus:ring-militar-accent"/>
                Solo activos
              </label>
            </div>
            <div class="flex gap-3">
              <input
                #busquedaInput
                type="text"
                [value]="busqueda()"
                (input)="actualizarBusqueda(busquedaInput.value)"
                placeholder="Buscar por código o descripción"
                class="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"
              />
              <button type="button" (click)="recargar()" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Buscar</button>
            </div>
          </header>

          @if (loading()) {
            <p class="py-6 text-center text-sm text-slate-500">Cargando diagnósticos...</p>
          } @else if (!cie10Listado().length) {
            <p class="py-6 text-center text-sm text-slate-500">No se encontraron diagnósticos que coincidan con la búsqueda.</p>
          } @else {
            <ul class="divide-y divide-slate-100 rounded-xl border border-slate-200">
              @for (item of cie10Listado(); track item.id ?? item.codigo) {
                <li class="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50">
                  <div class="flex flex-col">
                    <span class="font-semibold text-slate-900">{{ item.codigo }} • {{ item.descripcion }}</span>
                    <span class="text-xs text-slate-500">{{ item.categoria || 'Sin categoría' }}</span>
                  </div>
                  <button type="button" (click)="seleccionar(item)" class="rounded-md border border-militar-primary px-3 py-1 text-xs font-semibold text-militar-primary hover:bg-militar-primary hover:text-white transition">Editar</button>
                </li>
              }
            </ul>
          }
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <header class="flex flex-col gap-1">
            <h2 class="text-lg font-semibold text-slate-900">{{ modoEdicion() ? 'Editar diagnóstico' : 'Nuevo diagnóstico' }}</h2>
            <p class="text-xs text-slate-500">Completa los campos obligatorios según la especificación CIE-10.</p>
          </header>

          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-3">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Código
              <input formControlName="codigo" type="text" maxlength="10" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring" />
            </label>
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Descripción
              <textarea formControlName="descripcion" rows="4" class="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-militar-accent focus:outline-none focus:ring"></textarea>
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" formControlName="activo" class="h-4 w-4 rounded border border-slate-300 text-militar-primary focus:ring-militar-accent" /> Activo
            </label>
            <div class="flex justify-end gap-2">
              <button type="button" (click)="reset()" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Cancelar</button>
              <button type="submit" [disabled]="form.invalid || saving()" class="rounded-md bg-militar-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-militar-accent transition disabled:cursor-not-allowed disabled:opacity-60">
                {{ saving() ? 'Guardando…' : (modoEdicion() ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </article>
      </section>
    </section>
  `
})
export class CatalogosAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogosService = inject(CatalogosService);

  readonly cie10Listado = signal<CatalogoCIE10DTO[]>([]);
  readonly seleccionado = signal<CatalogoCIE10DTO | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly soloActivos = signal(true);
  readonly busqueda = signal('');
  readonly modoEdicion = computed(() => this.seleccionado() !== null);

  form: FormGroup = this.fb.group({
    id: [null as number | null],
    codigo: ['', [Validators.required, Validators.maxLength(10)]],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    categoria: [''],
    activo: [true]
  });

  ngOnInit(): void {
    this.recargar();
  }

  recargar() {
    this.loading.set(true);
    this.catalogosService.listarCIE10({
      soloActivos: this.soloActivos(),
      termino: this.busqueda().trim() || undefined
    }).subscribe({
      next: (items) => {
        this.cie10Listado.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.cie10Listado.set([]);
        this.loading.set(false);
      }
    });
  }

  seleccionar(item: CatalogoCIE10DTO) {
    this.seleccionado.set(item);
    this.form.patchValue({
      id: (item as any)?.id ?? null,
      codigo: item.codigo,
      descripcion: item.descripcion,
      categoria: (item as any)?.categoria ?? '',
      activo: (item as any)?.activo ?? true
    });
  }

  guardar() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload: CatalogoCIE10DTO = {
      codigo: value.codigo,
      descripcion: value.descripcion,
      categoria: value.categoria,
      activo: value.activo
    } as CatalogoCIE10DTO;
    const request = value.id
      ? this.catalogosService.actualizarCIE10(value.id, payload)
      : this.catalogosService.crearCIE10(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.reset();
        this.recargar();
      },
      error: () => this.saving.set(false)
    });
  }

  reset() {
    this.seleccionado.set(null);
    this.form.reset({ id: null, codigo: '', descripcion: '', categoria: '', activo: true });
  }

  actualizarBusqueda(valor: string) {
    this.busqueda.set(valor);
  }

  toggleSoloActivos(valor: boolean | undefined | null) {
    this.soloActivos.set(!!valor);
    this.recargar();
  }
}
