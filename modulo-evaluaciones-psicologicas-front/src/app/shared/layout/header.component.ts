import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  template: `
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <div class="px-4 md:px-6 h-14 flex items-center gap-3">
        <button type="button" (click)="toggleSidebar.emit()" aria-label="Alternar menú" class="px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">☰</button>
        <div class="flex-1 flex items-center gap-3">
          <input type="search" aria-label="Búsqueda global" [(ngModel)]="query" (ngModelChange)="onSearch()" placeholder="Buscar..." class="w-full md:w-96 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1 text-sm" />
        </div>
        <div class="flex items-center gap-2 text-sm">
          <button class="px-2 py-1 rounded bg-green-600 text-white" (click)="quickCreate.emit('paciente')">+ Paciente</button>
          <button class="px-2 py-1 rounded bg-blue-600 text-white" (click)="quickCreate.emit('curso')">+ Curso</button>
          <span class="ml-3">{{ userName() }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class HeaderComponent {
  userName = input<string>('Usuario');
  toggleSidebar = output<void>();
  quickCreate = output<'paciente'|'curso'>();
  query = '';
  searchQuery = output<string>();
  onSearch(){ this.searchQuery.emit(this.query); }
}
