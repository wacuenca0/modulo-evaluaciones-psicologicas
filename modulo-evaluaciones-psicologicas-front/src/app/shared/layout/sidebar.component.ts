import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="h-screen sticky top-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900" [class.w-16]="collapsed()" [class.w-64]="!collapsed()" aria-label="Barra lateral">
      <nav class="p-3 space-y-1 text-sm">
        <a routerLink="/dashboard" routerLinkActive="!bg-neutral-200/50 dark:!bg-neutral-800" class="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Home</a>
        <a routerLink="/pacientes" routerLinkActive="!bg-neutral-200/50 dark:!bg-neutral-800" class="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Pacientes</a>
        <a routerLink="/cursos" routerLinkActive="!bg-neutral-200/50 dark:!bg-neutral-800" class="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Cursos</a>
        <a routerLink="/entrevistas" routerLinkActive="!bg-neutral-200/50 dark:!bg-neutral-800" class="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Entrevistas</a>
        <a routerLink="/audits" routerLinkActive="!bg-neutral-200/50 dark:!bg-neutral-800" class="block px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Configuración</a>
      </nav>
      <button type="button" (click)="toggleSidebar.emit()" aria-label="Colapsar" class="m-3 text-xs px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800">{{ collapsed() ? 'Expandir' : 'Colapsar' }}</button>
    </aside>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive]
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  toggleSidebar = output<void>();
}
