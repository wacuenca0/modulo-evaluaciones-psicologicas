import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SECCIONES_ORDEN } from '../../entrevista.models';
import { FormDatosIdentificacionComponent } from '../../forms/form-datos-identificacion.component';
import { FormFamiliogramaComponent } from '../../forms/form-familiograma.component';
import { FormResultadosBateriasComponent } from '../../forms/form-resultados-baterias.component';
import { FormAnamnesisComponent } from '../../forms/form-anamnesis.component';
import { AnamnesisPathologyComponent } from '../../forms/form-anamnesis-patologia.component';
import { FormHistoriaVitalComponent } from '../../forms/form-historia-vital.component';
import { FormHabitosVidaComponent } from '../../forms/form-habitos-vida.component';
import { FormRecursosAfrontamientoComponent } from '../../forms/form-recursos-afrontamiento.component';
import { FormRedesApoyoSocialComponent } from '../../forms/form-redes-apoyo-social.component';
import { FormRelacionesSocialesComponent } from '../../forms/form-relaciones-sociales.component';
import { FormSituacionLaboralComponent } from '../../forms/form-situacion-laboral.component';
import { FormSituacionEconomicaComponent } from '../../forms/form-situacion-economica.component';
import { FormSituacionLegalComponent } from '../../forms/form-situacion-legal.component';
import { FormFuncionesMentalesSuperioresComponent } from '../../forms/form-funciones-mentales-superiores.component';
import { FormDiagnosticoInicialComponent } from '../../forms/form-diagnostico-inicial.component';

@Component({
  selector: 'app-entrevista-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormDatosIdentificacionComponent,
    FormFamiliogramaComponent,
    FormResultadosBateriasComponent,
    FormAnamnesisComponent,
    AnamnesisPathologyComponent,
    FormHistoriaVitalComponent,
    FormHabitosVidaComponent,
    FormRecursosAfrontamientoComponent,
    FormRedesApoyoSocialComponent,
    FormRelacionesSocialesComponent,
    FormSituacionLaboralComponent,
    FormSituacionEconomicaComponent,
    FormSituacionLegalComponent,
    FormFuncionesMentalesSuperioresComponent,
    FormDiagnosticoInicialComponent
  ],
  template: `
    <section class="space-y-6 p-6">
      <header class="space-y-1">
        <p class="text-xs uppercase tracking-widest text-slate-500">Entrevistas</p>
        <h1 class="text-2xl font-semibold text-slate-900">Editor de entrevista clínica</h1>
        <p class="text-sm text-slate-500">Este módulo está en construcción. Los formularios se muestran como vistas de referencia.</p>
      </header>

      <div class="grid gap-4 md:grid-cols-2">
        <app-form-datos-identificacion></app-form-datos-identificacion>
        <app-form-familiograma></app-form-familiograma>
        <app-form-resultados-baterias></app-form-resultados-baterias>
        <app-form-anamnesis></app-form-anamnesis>
        <app-form-anamnesis-patologia></app-form-anamnesis-patologia>
        <app-form-historia-vital></app-form-historia-vital>
        <app-form-habitos-vida></app-form-habitos-vida>
        <app-form-recursos-afrontamiento></app-form-recursos-afrontamiento>
        <app-form-redes-apoyo-social></app-form-redes-apoyo-social>
        <app-form-relaciones-sociales></app-form-relaciones-sociales>
        <app-form-situacion-laboral></app-form-situacion-laboral>
        <app-form-situacion-economica></app-form-situacion-economica>
        <app-form-situacion-legal></app-form-situacion-legal>
        <app-form-funciones-mentales-superiores></app-form-funciones-mentales-superiores>
        <app-form-diagnostico-inicial></app-form-diagnostico-inicial>
      </div>
    </section>
  `
})
export class EntrevistaEditorComponent {
  readonly secciones = signal(SECCIONES_ORDEN);
}
