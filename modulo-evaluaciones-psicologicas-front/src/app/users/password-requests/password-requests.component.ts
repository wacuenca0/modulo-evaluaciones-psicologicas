import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersTabsComponent } from '../users-tabs.component';
import {
  PasswordChangeRequestDTO,
  PasswordChangeStatus
} from '../../models/password-change-request.models';
import { PasswordChangeRequestsService } from '../../services/password-change-requests.service';

const STATUS_LABEL: Record<PasswordChangeStatus, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADO: 'Completado',
  RECHAZADO: 'Rechazado'
};

type FilterOption = PasswordChangeStatus | 'TODAS';

@Component({
  selector: 'app-password-requests',
  imports: [CommonModule, ReactiveFormsModule, UsersTabsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Atención a usuarios</p>
        <h1 class="text-3xl font-semibold text-slate-900">Solicitudes de cambio de contraseña</h1>
        <p class="text-sm text-slate-500 max-w-2xl">
          Gestiona de forma integral las solicitudes de restablecimiento. Filtra por estado, revisa los detalles y completa o rechaza cada caso con total trazabilidad.
        </p>
      </header>

      <app-users-tabs></app-users-tabs>

      @if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error() }}
        </div>
      }

      <div class="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Bandeja de solicitudes</h2>
              <p class="text-sm text-slate-500">{{ statusDescription() }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              @for (option of filterOptions; track option) {
                <button
                  type="button"
                  (click)="setFilter(option)"
                  [class.bg-slate-900]="statusFilter() === option"
                  [class.text-white]="statusFilter() === option"
                  class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-900 hover:text-white transition"
                >
                  {{ filterLabel(option) }}
                </button>
              }
            </div>
          </div>

          <div class="mt-6">
            @if (loading()) {
              <div class="space-y-3">
                @for (_ of [0,1,2,3]; track $index) {
                  <div class="h-16 animate-pulse rounded-2xl bg-slate-100"></div>
                }
              </div>
            } @else if (!requests().length) {
              <div class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No hay solicitudes registradas con el filtro seleccionado.
              </div>
            } @else {
              <ul class="space-y-3">
                @for (request of requests(); track request.id) {
                  <li>
                    <button
                      type="button"
                      (click)="select(request)"
                      [class.border-slate-900]="selected()?.id === request.id"
                      [class.shadow-lg]="selected()?.id === request.id"
                      class="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-400 hover:shadow"
                    >
                      <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p class="text-sm font-semibold text-slate-900">{{ request.username }}</p>
                          <p class="text-xs text-slate-500">Registrada {{ request.requestedAt | date: 'short' }}</p>
                        </div>
                        <span
                          class="rounded-full px-3 py-1 text-xs font-semibold"
                          [class.bg-amber-100]="request.status === 'PENDIENTE'"
                          [class.text-amber-700]="request.status === 'PENDIENTE'"
                          [class.bg-emerald-100]="request.status === 'COMPLETADO'"
                          [class.text-emerald-700]="request.status === 'COMPLETADO'"
                          [class.bg-rose-100]="request.status === 'RECHAZADO'"
                          [class.text-rose-700]="request.status === 'RECHAZADO'"
                        >
                          {{ filterLabel(request.status) }}
                        </span>
                      </div>
                      <p class="mt-3 line-clamp-2 text-sm text-slate-600" [class.italic]="!request.motivo">
                        {{ request.motivo || 'Sin motivo especificado' }}
                      </p>
                    </button>
                  </li>
                }
              </ul>
            }
          </div>
        </article>

        <article class="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
          @if (!selected()) {
            <div class="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
              <h3 class="text-base font-semibold text-slate-600">Selecciona una solicitud</h3>
              <p class="text-sm">Elige una tarjeta de la bandeja para ver los detalles y procesarla.</p>
            </div>
          } @else {
            <div class="space-y-4">
              <header class="space-y-1">
                <h2 class="text-xl font-semibold text-slate-900">{{ selected()?.username }}</h2>
                <p class="text-sm text-slate-500">Solicitada {{ selected()?.requestedAt | date: 'medium' }}</p>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase">
                  <span class="rounded-full bg-slate-900 px-3 py-1 text-white">{{ filterLabel(selected()!.status) }}</span>
                  @if (selected()?.processedBy) {
                    <span class="rounded-full bg-slate-200 px-2 py-1 text-slate-600">Atendida por {{ selected()?.processedBy }}</span>
                  }
                </div>
              </header>

              <dl class="grid gap-3 text-sm">
                <div class="rounded-2xl border border-slate-200 bg-white p-3">
                  <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Correo de contacto</dt>
                  <dd class="mt-1 text-slate-900">{{ selected()?.contactEmail || 'No especificado' }}</dd>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-white p-3">
                  <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas del solicitante</dt>
                  <dd class="mt-1 whitespace-pre-line text-slate-900">{{ selected()?.motivo || 'Sin comentarios adicionales' }}</dd>
                </div>
                @if (selected()?.adminNotes) {
                  <div class="rounded-2xl border border-slate-200 bg-white p-3">
                    <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas administrativas</dt>
                    <dd class="mt-1 whitespace-pre-line text-slate-900">{{ selected()?.adminNotes }}</dd>
                  </div>
                }
              </dl>

              @if (selected()?.status === 'PENDIENTE') {
                <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-600">Completar solicitud</h3>
                  <form [formGroup]="completeForm" (ngSubmit)="complete()" class="space-y-3">
                    <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nueva contraseña
                      <input formControlName="newPassword" type="password" autocomplete="off" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
                    </label>
                    <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Notas para el usuario
                      <textarea formControlName="adminNotes" rows="3" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                    </label>
                    <label class="flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" formControlName="unlockAccount" class="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900" />
                      Desbloquear cuenta al completar
                    </label>
                    <button type="submit" [disabled]="completeForm.invalid || completing()" class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700 transition disabled:cursor-not-allowed disabled:opacity-60">
                      {{ completing() ? 'Guardando cambios…' : 'Completar solicitud' }}
                    </button>
                  </form>

                  <div class="relative">
                    <div class="absolute inset-0 flex items-center" aria-hidden="true">
                      <div class="w-full border-t border-dashed border-slate-200"></div>
                    </div>
                    <div class="relative flex justify-center">
                      <span class="bg-white px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">O</span>
                    </div>
                  </div>

                  <form [formGroup]="rejectForm" (ngSubmit)="reject()" class="space-y-3">
                    <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Motivo del rechazo
                      <textarea formControlName="adminNotes" rows="3" class="mt-1 w-full rounded-md border border-rose-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring"></textarea>
                    </label>
                    <button type="submit" [disabled]="rejectForm.invalid || rejecting()" class="w-full rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:border-rose-400 hover:bg-rose-50 transition disabled:cursor-not-allowed disabled:opacity-60">
                      {{ rejecting() ? 'Registrando rechazo…' : 'Rechazar solicitud' }}
                    </button>
                  </form>
                </section>
              } @else {
                <section class="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <h3 class="text-sm font-semibold text-emerald-900">Solicitud atendida</h3>
                  <p>
                    Procesada el {{ selected()?.processedAt | date: 'medium' }} por {{ selected()?.processedBy || '—' }}.
                  </p>
                </section>
              }
            </div>
          }
        </article>
      </div>

      <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Registrar nueva solicitud (uso operativo)</h2>
        <p class="mt-1 text-sm text-slate-500">Simula el flujo que el usuario final realiza para solicitar el restablecimiento de su contraseña.</p>
        <form [formGroup]="createForm" (ngSubmit)="create()" class="mt-4 grid gap-4 md:grid-cols-3">
          <label class="md:col-span-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Usuario
            <input formControlName="username" type="text" autocomplete="off" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
          </label>
          <label class="md:col-span-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Correo de contacto
            <input formControlName="contactEmail" type="email" autocomplete="off" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
          </label>
          <label class="md:col-span-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Motivo de la solicitud
            <textarea formControlName="motivo" rows="2" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
          </label>
          <div class="md:col-span-3 flex justify-end">
            <button type="submit" [disabled]="createForm.invalid || creating()" class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition disabled:cursor-not-allowed disabled:opacity-60">
              {{ creating() ? 'Registrando…' : 'Generar solicitud' }}
            </button>
          </div>
        </form>
      </article>
    </section>
  `
})
export class PasswordRequestsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PasswordChangeRequestsService);

  private readonly defaultFilter: FilterOption = 'PENDIENTE';
  readonly filterOptions: FilterOption[] = ['PENDIENTE', 'COMPLETADO', 'RECHAZADO', 'TODAS'];

  readonly statusFilter = signal<FilterOption>(this.defaultFilter);
  readonly requests = signal<PasswordChangeRequestDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selected = signal<PasswordChangeRequestDTO | null>(null);

  readonly creating = signal(false);
  readonly completing = signal(false);
  readonly rejecting = signal(false);

  readonly statusDescription = computed(() => {
    const filter = this.statusFilter();
    switch (filter) {
      case 'PENDIENTE':
        return 'Solicitudes en espera de atención.';
      case 'COMPLETADO':
        return 'Historial de solicitudes completadas.';
      case 'RECHAZADO':
        return 'Solicitudes rechazadas con su justificación.';
      default:
        return 'Visualiza todas las solicitudes registradas.';
    }
  });

  readonly completeForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    adminNotes: [''],
    unlockAccount: [true]
  });

  readonly rejectForm = this.fb.group({
    adminNotes: ['']
  });

  readonly createForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    contactEmail: ['', Validators.email],
    motivo: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  setFilter(option: FilterOption) {
    if (this.statusFilter() === option) return;
    this.statusFilter.set(option);
    this.selected.set(null);
    this.load();
  }

  filterLabel(option: FilterOption): string {
    if (option === 'TODAS') return 'Todas';
    return STATUS_LABEL[option];
  }

  select(request: PasswordChangeRequestDTO) {
    this.selected.set(request);
    this.completeForm.reset({ newPassword: '', adminNotes: '', unlockAccount: true });
    this.rejectForm.reset({ adminNotes: '' });
  }

  create() {
    if (this.createForm.invalid) return;
    this.error.set(null);
    this.creating.set(true);
    const payload = this.createForm.getRawValue();
    this.service.create({
      username: payload.username!,
      contactEmail: payload.contactEmail || undefined,
      motivo: payload.motivo || undefined
    }).subscribe({
      next: () => {
        this.creating.set(false);
        this.createForm.reset({ username: '', contactEmail: '', motivo: '' });
        this.statusFilter.set('PENDIENTE');
        this.load();
      },
      error: (err) => {
        this.creating.set(false);
        this.error.set(this.resolveError(err, 'No se pudo registrar la solicitud.'));
      }
    });
  }

  complete() {
    const current = this.selected();
    if (!current || this.completeForm.invalid) return;
    this.error.set(null);
    this.completing.set(true);
    const value = this.completeForm.getRawValue();
    this.service.complete(current.id, {
      newPassword: value.newPassword!,
      adminNotes: value.adminNotes || undefined,
      unlockAccount: !!value.unlockAccount
    }).subscribe({
      next: () => {
        this.completing.set(false);
        this.completeForm.reset({ newPassword: '', adminNotes: '', unlockAccount: true });
        this.load();
      },
      error: (err) => {
        this.completing.set(false);
        this.error.set(this.resolveError(err, 'No se pudo completar la solicitud.'));
      }
    });
  }

  reject() {
    const current = this.selected();
    if (!current) return;
    this.error.set(null);
    this.rejecting.set(true);
    const value = this.rejectForm.getRawValue();
    this.service.reject(current.id, { adminNotes: value.adminNotes || undefined }).subscribe({
      next: () => {
        this.rejecting.set(false);
        this.rejectForm.reset({ adminNotes: '' });
        this.load();
      },
      error: (err) => {
        this.rejecting.set(false);
        this.error.set(this.resolveError(err, 'No se pudo rechazar la solicitud.'));
      }
    });
  }

  private load() {
    this.loading.set(true);
    this.error.set(null);
    const status = this.statusFilter();
    const statusParam: PasswordChangeStatus | undefined = status === 'TODAS' ? undefined : status;
    this.service.list(statusParam).subscribe({
      next: (list) => {
        this.loading.set(false);
        this.requests.set(list);
        this.syncSelected(list);
      },
      error: (err) => {
        this.loading.set(false);
        this.requests.set([]);
        this.selected.set(null);
        this.error.set(this.resolveError(err, 'No se pudieron obtener las solicitudes.'));
      }
    });
  }

  private syncSelected(list: PasswordChangeRequestDTO[]) {
    const current = this.selected();
    if (!list.length) {
      this.selected.set(null);
      return;
    }
    if (!current) {
      this.selected.set(list[0]);
      return;
    }
    const updated = list.find(item => item.id === current.id);
    this.selected.set(updated ?? list[0]);
  }

  private resolveError(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const anyErr = err as { error?: any };
      const message = typeof anyErr.error === 'string' ? anyErr.error : anyErr.error?.message;
      if (typeof message === 'string' && message.trim().length) {
        return message;
      }
    }
    return fallback;
  }
}
