import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Confirmación">
      <div class="absolute inset-0 bg-black/40" (click)="cancelAction.emit()"></div>
      <div class="relative bg-white dark:bg-neutral-800 rounded-xl shadow-lg w-full max-w-sm p-6 border border-neutral-200 dark:border-neutral-700">
        <h2 class="text-lg font-semibold mb-2">{{ title() }}</h2>
        <p class="text-sm mb-4">{{ message() }}</p>
        <div class="flex gap-3 justify-end">
          <button type="button" (click)="cancelAction.emit()" class="px-3 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 text-sm">Cancelar</button>
          <button type="button" (click)="confirm.emit()" class="px-3 py-2 rounded-md bg-red-600 text-white text-sm">Confirmar</button>
        </div>
      </div>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent {
  title = input<string>('Confirmación');
  message = input<string>('¿Estás seguro?');
  confirm = output<void>();
  // usar nombre alternativo para evitar conflicto con evento DOM 'cancel'
  cancelAction = output<void>();
}
