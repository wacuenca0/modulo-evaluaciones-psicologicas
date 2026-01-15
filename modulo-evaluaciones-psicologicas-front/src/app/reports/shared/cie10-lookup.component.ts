import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { input, output } from '@angular/core';
import { CatalogoCIE10DTO } from '../../models/catalogo.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Cie10CacheService } from './cie10-cache.service';

type Nullable<T> = T | null;

type PropagateChangeFn = (value: string) => void;

type PropagateTouchedFn = () => void;

@Component({
  selector: 'app-cie10-lookup',
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Cie10LookupComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <div class="relative">
        <input
          type="search"
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 pr-16 text-sm focus:border-slate-900 focus:outline-none focus:ring disabled:cursor-not-allowed disabled:opacity-70"
          [attr.placeholder]="placeholder()"
          autocomplete="off"
          [value]="inputDisplay()"
          [disabled]="disabled()"
          (input)="onSearchInput($any($event.target).value)"
          (blur)="markAsTouched()"
        />
        @if (selected() && !disabled()) {
          <button
            type="button"
            (click)="clearSelection()"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-100"
          >
            Limpiar
          </button>
        }
      </div>

      @if (helperText()) {
        <p class="text-xs text-slate-500">{{ helperText() }}</p>
      }

      @if (error()) {
        <div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ error() }}</div>
      }

      @if (loading()) {
        <p class="text-xs text-slate-500">Buscando diagnósticos...</p>
      }

      @if (!loading() && results().length) {
        <ul class="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          @for (item of results(); track item.id ?? item.codigo) {
            <li>
              <button
                type="button"
                (click)="selectOption(item)"
                class="flex w-full flex-col gap-1 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm transition hover:border-slate-400"
              >
                <span class="font-semibold text-slate-900">{{ item.codigo }}</span>
                <span class="text-slate-600">{{ item.descripcion }}</span>
              </button>
            </li>
          }
        </ul>
      } @else if (!loading() && query().trim().length >= 3 && !results().length && !error()) {
        <p class="text-xs text-slate-500">No se encontraron coincidencias con la búsqueda realizada.</p>
      }

      @if (selectedLabel()) {
        <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span class="font-semibold text-slate-900">{{ selectedLabel() }}</span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cie10LookupComponent implements ControlValueAccessor {
  private readonly cache = inject(Cie10CacheService);
  private readonly destroyRef = inject(DestroyRef);

  readonly placeholder = input('Buscar diagnóstico CIE-10');
  readonly helperText = input<string | null>(null);
  readonly selectionChange = output<Nullable<CatalogoCIE10DTO>>();

  private propagateChange: PropagateChangeFn = () => {};
  private propagateTouched: PropagateTouchedFn = () => {};

  private searchHandle: ReturnType<typeof setTimeout> | null = null;
  private lastRequestedId: number | null = null;

  readonly disabled = signal(false);
  readonly query = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly results = signal<readonly CatalogoCIE10DTO[]>([]);
  readonly selected = signal<Nullable<CatalogoCIE10DTO>>(null);
  readonly catalogoInicial = signal<readonly CatalogoCIE10DTO[]>([]);

  readonly selectedLabel = computed(() => this.selected() ? this.formatLabel(this.selected()) : '');
  readonly inputDisplay = computed(() => {
    const seleccionado = this.selected();
    if (seleccionado) {
      return this.formatLabel(seleccionado);
    }
    return this.query();
  });

  constructor() {
    this.cache
      .preloadActivos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(listado => {
        if (Array.isArray(listado)) {
          this.catalogoInicial.set(listado);
          if (!this.query().trim().length && !this.selected()) {
            this.results.set(this.filtrarLocal(''));
          }
        }
      });
  }

  writeValue(value: unknown): void {
    const normalized = this.normalizeId(value);
    if (normalized === null) {
      this.resetState();
      this.selectionChange.emit(null);
      return;
    }
    if (this.selected()?.id === normalized) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.results.set([]);
    this.lastRequestedId = normalized;
    this.cache.obtenerPorId(normalized).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (item) => {
        if (this.lastRequestedId !== normalized) {
          return;
        }
        this.setSelection(item ?? null, false, true);
        this.loading.set(false);
      },
      error: () => {
        if (this.lastRequestedId !== normalized) {
          return;
        }
        this.loading.set(false);
        this.error.set('No se pudo cargar el diagnóstico seleccionado.');
        this.setSelection(null, false, true);
      }
    });
  }

  registerOnChange(fn: PropagateChangeFn): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: PropagateTouchedFn): void {
    this.propagateTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(Boolean(isDisabled));
  }

  onSearchInput(value: string): void {
    if (this.disabled()) {
      return;
    }

    const trimmed = value ?? '';
    const selected = this.selected();
    if (selected) {
      const etiqueta = this.formatLabel(selected);
      if (trimmed.trim() !== etiqueta) {
        this.setSelection(null, true, true);
      }
    }

    this.query.set(trimmed);
    this.error.set(null);

    if (this.searchHandle) {
      clearTimeout(this.searchHandle);
      this.searchHandle = null;
    }

    const criterio = trimmed.trim();
    if (criterio.length < 3) {
      this.loading.set(false);
      this.results.set(this.filtrarLocal(criterio));
      return;
    }

    this.loading.set(true);
    this.searchHandle = setTimeout(() => {
      this.cache.buscar(criterio).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (items) => {
          if (this.query().trim() !== criterio) {
            return;
          }
          this.results.set(Array.isArray(items) ? items : []);
          this.loading.set(false);
        },
        error: () => {
          if (this.query().trim() !== criterio) {
            return;
          }
          this.results.set([]);
          this.loading.set(false);
          this.error.set('No se pudo ejecutar la búsqueda. Intenta nuevamente.');
        }
      });
    }, 300);
  }

  selectOption(item: CatalogoCIE10DTO): void {
    if (this.disabled()) {
      return;
    }
    this.setSelection(item, true, true);
    this.propagateTouched();
  }

  clearSelection(): void {
    if (this.disabled()) {
      return;
    }
    this.setSelection(null, true, true);
    this.query.set('');
    this.results.set(this.filtrarLocal(''));
    this.error.set(null);
    this.propagateTouched();
  }

  markAsTouched(): void {
    this.propagateTouched();
  }

  private setSelection(item: Nullable<CatalogoCIE10DTO>, emitChange: boolean, emitSelection: boolean): void {
    this.selected.set(item);
    this.query.set('');
    this.results.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.lastRequestedId = this.normalizeId(item?.id ?? null);

    const id = this.normalizeId(item?.id ?? null);
    const value = id !== null ? String(id) : '';
    if (emitChange) {
      this.propagateChange(value);
    }
    if (emitSelection) {
      this.selectionChange.emit(item ?? null);
    }
  }

  private resetState(): void {
    this.selected.set(null);
    this.query.set('');
    this.results.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.lastRequestedId = null;
  }

  private filtrarLocal(queryRaw: string): readonly CatalogoCIE10DTO[] {
    const catalogo = this.catalogoInicial();
    const listado = Array.isArray(catalogo) ? [...catalogo] : [];
    if (!listado.length) {
      return [];
    }
    const criterio = queryRaw?.trim().toUpperCase() ?? '';
    if (!criterio.length) {
      return listado.slice(0, 20);
    }
    return listado
      .filter(item => this.coincide(item, criterio))
      .slice(0, 20);
  }

  private coincide(item: CatalogoCIE10DTO, criterio: string): boolean {
    const codigo = item.codigo?.toUpperCase() ?? '';
    const descripcion = item.descripcion?.toUpperCase() ?? '';
    return codigo.includes(criterio) || descripcion.includes(criterio);
  }

  private normalizeId(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
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

  private formatLabel(item: Nullable<CatalogoCIE10DTO>): string {
    if (!item) {
      return '';
    }
    const codigo = item.codigo?.trim() ?? '';
    const descripcion = item.descripcion?.trim() ?? '';
    if (codigo && descripcion) {
      return `${codigo} · ${descripcion}`;
    }
    return codigo || descripcion;
  }
}
