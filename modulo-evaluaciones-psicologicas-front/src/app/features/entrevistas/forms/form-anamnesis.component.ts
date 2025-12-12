import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-anamnesis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <section class="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
      <p>Formulario de anamnesis sin contenido todavía.</p>
    </section>
  `
})
export class FormAnamnesisComponent {}
