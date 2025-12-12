import { Component, ChangeDetectionStrategy, output, input } from '@angular/core';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-destroyable-card',
  template: `
    <div class="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-md border border-neutral-200 dark:border-neutral-700 relative" aria-label="Tarjeta" role="group">
      <button type="button" aria-label="Eliminar" (click)="openConfirm()" class="absolute top-2 right-2 text-sm text-red-600 hover:text-red-800">✕</button>
      <h3 class="text-lg font-semibold mb-1">{{ title() }}</h3>
      @if (subtitle()) { <p class="text-sm text-neutral-500">{{ subtitle() }}</p> }
      <ng-content></ng-content>
      @if (confirmVisible) {
        <app-confirm-modal [title]="'Eliminar'" [message]="'¿Confirmas eliminar este elemento?'" (confirm)="onConfirm()" (cancelAction)="onCancel()" />
      }
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConfirmModalComponent]
})
export class DestroyableCardComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>();
  meta = input<any>();
  delete = output<void>();

  confirmVisible = false;

  openConfirm() { this.confirmVisible = true; }
  onCancel() { this.confirmVisible = false; }
  onConfirm() { this.confirmVisible = false; this.delete.emit(); }
}
