import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export interface TableColumn<T> { key: keyof T | string; label: string; class?: string; }

@Component({
  selector: 'app-table',
  template: `
    <div class="overflow-auto rounded-xl border border-neutral-200 dark:border-neutral-700" role="table" aria-label="Tabla">
      <table class="min-w-full text-sm">
        <thead class="bg-neutral-100 dark:bg-neutral-700 text-left">
          <tr>
            @for (c of columns(); track c) { <th class="font-semibold px-3 py-2" scope="col">{{ c.label }}</th> }
            <th class="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (row of data(); track row) {
            <tr class="border-t border-neutral-200 dark:border-neutral-700">
              @for (c of columns(); track c) { <td class="px-3 py-2" [class]="c.class || ''">{{ resolve(row, c.key) }}</td> }
              <td class="px-3 py-2"><ng-content select="[row-actions]"></ng-content></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T extends Record<string, any>> {
  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();

  resolve(row: T, key: keyof T | string): any {
    return (row as any)[key];
  }
}
