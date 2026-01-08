import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FichasPsicologicasService } from '../../services/fichas-psicologicas.service';
import { PersonalMilitarDTO } from '../../models/personal-militar.models';
import {
  FichaPsicologicaCreacionInicialDTO,
  FichaObservacionClinicaPayload,
  FichaPsicoanamnesisPayload,
  FichaCondicionClinicaPayload,
  FichaPsicoanamnesisDTO,
  FichaCondicionClinicaDTO,
  FICHA_ESTADOS_CANONICOS,
  FICHA_TIPOS_EVALUACION_CANONICOS,
  FichaPsicologicaHistorialDTO,
  PSICOANAMNESIS_GRADOS_DISCAPACIDAD,
  PSICOANAMNESIS_GRADOS_SOCIABILIDAD,
  PSICOANAMNESIS_RELACION_FAMILIAR,
  FICHA_CONDICION_CLINICA_OPCIONES,
  FichaCondicionFinal,
  FICHA_PLAN_FRECUENCIAS,
  FICHA_PLAN_TIPOS_SESION
} from '../../models/fichas-psicologicas.models';
import { CatalogosService } from '../../services/catalogos.service';
import { CatalogoCIE10DTO } from '../../models/catalogo.models';

type StepId = 'generales' | 'observacion' | 'psicoanamnesis' | 'condicion';

type PsicoanamnesisFormValue = {
  prenatal: {
    condicionesBiologicasPadres: string;
    condicionesPsicologicasPadres: string;
    observacionPrenatal: string;
  };
  natal: {
    partoNormal: boolean | null;
    terminoParto: string;
    complicacionesParto: string;
    observacionNatal: string;
  };
  infancia: {
    gradoSociabilidad: string;
    relacionPadresHermanos: string;
    discapacidadIntelectual: boolean | null;
    gradoDiscapacidad: string;
    trastornos: string;
    tratamientosPsicologicosPsiquiatricos: boolean | null;
    observacionInfancia: string;
  };
};

type CondicionClinicaFormValue = {
  condicion: FichaCondicionFinal;
  diagnosticoCodigo: string;
  diagnosticoDescripcion: string;
  planFrecuencia: string;
  planTipoSesion: string;
  planDetalle: string;
};

type CondicionAgendaItem = { titulo: string; detalle: string };

const SOCIABILIDAD_CANONICAL = new Map<string, string>([
  ['introvertido', 'Introvertido'],
  ['introvertida', 'Introvertido'],
  ['reservado', 'Reservado'],
  ['reservada', 'Reservado'],
  ['neutral', 'Neutral'],
  ['comunicativo', 'Comunicativo'],
  ['comunicativa', 'Comunicativo'],
  ['extrovertido', 'Extrovertido'],
  ['extrovertida', 'Extrovertido'],
  ['otro', 'Otro']
]);

const RELACION_CANONICAL = new Map<string, string>([
  ['asertiva', 'Asertiva'],
  ['asertivo', 'Asertiva'],
  ['conflictiva', 'Conflictiva'],
  ['conflictivo', 'Conflictiva'],
  ['distante', 'Distante'],
  ['sobreprotectora', 'Sobreprotectora'],
  ['sobreprotector', 'Sobreprotectora'],
  ['inexistente', 'Inexistente'],
  ['otro', 'Otro']
]);

const DISCAPACIDAD_CANONICAL = new Map<string, string>([
  ['ninguna', 'Ninguna'],
  ['sin discapacidad', 'Ninguna'],
  ['leve', 'Leve'],
  ['moderado', 'Moderado'],
  ['moderada', 'Moderado'],
  ['grave', 'Grave'],
  ['graves', 'Grave'],
  ['profundo', 'Profundo'],
  ['profunda', 'Profundo']
]);

const CONDICION_CANONICAL = new Map<string, FichaCondicionFinal>([
  ['alta', 'ALTA'],
  ['alta definitiva', 'ALTA'],
  ['no presenta psicopatologia', 'ALTA'],
  ['seguimiento', 'SEGUIMIENTO'],
  ['transferencia', 'TRANSFERENCIA']
]);

const CONDICION_API_MAP: Record<FichaCondicionFinal, string> = {
  ALTA: 'Alta',
  SEGUIMIENTO: 'Seguimiento',
  TRANSFERENCIA: 'Transferencia'
};

const CONDICION_REQUIERE_DIAGNOSTICO = new Set<FichaCondicionFinal>(['SEGUIMIENTO', 'TRANSFERENCIA']);

@Component({
  selector: 'app-ficha-psicologica-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-8">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Gestion clinica</p>
        <h1 class="text-3xl font-semibold text-slate-900">Nueva ficha psicologica</h1>
        <p class="text-sm text-slate-500">
          @if (persona()) {
            <span>Registrando evaluacion general para {{ personaDescripcion() }}.</span>
          } @else {
            <span>Selecciona a la persona desde el historial para generar una ficha.</span>
          }
        </p>
      </header>

      <div class="flex items-center justify-between">
        <a routerLink="/psicologo/personal" class="text-sm font-semibold text-slate-600 transition hover:text-slate-900">Volver a la busqueda</a>
        @if (currentStep() === 'generales' && generalesGuardado()) {
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Datos generales guardados</span>
        } @else if (currentStep() === 'observacion' && observacionGuardado()) {
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Observacion clinica guardada</span>
        } @else if (currentStep() === 'psicoanamnesis' && psicoanamnesisGuardado()) {
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Psicoanamnesis guardada</span>
        }
      </div>

      <nav class="flex flex-col gap-3 md:flex-row">
        @for (step of steps; track step.id) {
          @let index = $index;
          <button type="button" (click)="goToStep(step.id)"
            class="flex-1 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition"
            [disabled]="!canAccessStep(step.id)"
            [class.bg-slate-900]="isStepActive(step.id)"
            [class.text-white]="isStepActive(step.id)"
            [class.border-slate-900]="isStepActive(step.id)"
            [class.border-slate-300]="!isStepActive(step.id)"
            [class.text-slate-500]="!isStepActive(step.id) && !isStepCompleted(step.id)"
            [class.text-slate-900]="isStepCompleted(step.id)">
            {{ index + 1 }}. {{ step.label }}
          </button>
        }
      </nav>

      @if (navigationMessage()) {
        <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {{ navigationMessage() }}
        </div>
      }

      @switch (currentStep()) {
        @case ('generales') {
          @if (generalesError()) {
            <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ generalesError() }}
            </div>
          }

          <form [formGroup]="generalesForm" (ngSubmit)="guardarDatosGenerales()" class="space-y-6">
            <section class="grid gap-5 md:grid-cols-2">
              <label class="block text-sm font-semibold text-slate-700">
                Fecha de evaluacion
                <input type="date" formControlName="fechaEvaluacion"
                  class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
              </label>

              <label class="block text-sm font-semibold text-slate-700">
                Tipo de evaluacion
                <select formControlName="tipoEvaluacion"
                  class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                  <option value="" disabled>Selecciona una opcion</option>
                  @for (tipo of tiposCanonicos; track tipo.value) {
                    <option [value]="tipo.value">{{ tipo.label }}</option>
                  }
                </select>
                @if (hasGeneralesError('tipoEvaluacion')) {
                  <span class="mt-1 block text-xs text-red-600">El tipo de evaluacion es obligatorio.</span>
                }
              </label>

              <label class="block text-sm font-semibold text-slate-700">
                Estado inicial
                <select formControlName="estado"
                  class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                  <option value="" disabled>Selecciona una opcion</option>
                  @for (estado of estadosCanonicos; track estado.value) {
                    <option [value]="estado.value">{{ estado.label }}</option>
                  }
                </select>
                @if (hasGeneralesError('estado')) {
                  <span class="mt-1 block text-xs text-red-600">Debes seleccionar el estado de la ficha.</span>
                }
              </label>
            </section>

            <footer class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p class="text-xs text-slate-500">
                Guarda esta seccion para generar el numero de evaluacion y habilitar el registro por secciones.
              </p>
              <div class="flex flex-wrap gap-3">
                <button type="button" (click)="goToStep('observacion')"
                  class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  [disabled]="!fichaCreada()">
                  Siguiente
                </button>
                <button type="submit"
                  class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  [disabled]="loadingGenerales()">
                  {{ loadingGenerales() ? 'Guardando...' : 'Guardar datos generales' }}
                </button>
              </div>
            </footer>
          </form>

          @if (fichaCreada()) {
            <section class="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
              <p class="font-semibold">Ficha generada correctamente.</p>
              <p class="mt-2">Numero asignado: <strong>{{ fichaCreada()?.numeroEvaluacion ?? fichaCreada()?.id ?? 'Pendiente' }}</strong>.</p>
              <p class="mt-1">Estado actual: <strong>{{ fichaCreada()?.estado ?? estadoSeleccionadoLabel() }}</strong>.</p>
              <p class="mt-1">Tipo de evaluacion: <strong>{{ fichaCreada()?.tipoEvaluacion ?? tipoSeleccionadoLabel() }}</strong>.</p>
              <p class="mt-1">Continua con la observacion clinica para completar la ficha.</p>
            </section>
          }
        }
        @case ('observacion') {
          @if (!fichaCreada()) {
            <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Guarda los datos generales para habilitar la observacion clinica.
            </div>
          } @else {
            @if (observacionError()) {
              <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ observacionError() }}
              </div>
            }

            <form [formGroup]="observacionForm" (ngSubmit)="guardarObservacion()" class="space-y-6">
              <section class="space-y-5">
                <div>
                  <label class="block text-sm font-semibold text-slate-700">
                    Observacion clinica
                    <textarea formControlName="observacionClinica" rows="3"
                      class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                  </label>
                  @if (hasObservacionError('observacionClinica')) {
                    <p class="mt-1 text-xs text-red-600">Describe la observacion clinica.</p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-700">
                    Motivo de consulta
                    <textarea formControlName="motivoConsulta" rows="3"
                      class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                  </label>
                  @if (hasObservacionError('motivoConsulta')) {
                    <p class="mt-1 text-xs text-red-600">Indica el motivo de la consulta.</p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-700">
                    Enfermedad actual (opcional)
                    <textarea formControlName="enfermedadActual" rows="3"
                      class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                  </label>
                </div>
              </section>

              <footer class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="flex flex-wrap gap-3">
                  <button type="button" (click)="goToStep('generales')"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    Anterior
                  </button>
                  <button type="button" (click)="limpiarObservacion()"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    Limpiar
                  </button>
                </div>
                <div class="flex flex-wrap gap-3">
                  <button type="button" (click)="cerrarFormulario()"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    Cerrar
                  </button>
                  <button type="button" (click)="irProximaSeccion()"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:cursor-not-allowed disabled:opacity-60"
                    [disabled]="!observacionGuardado()">
                    Siguiente
                  </button>
                  <button type="submit"
                    class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    [disabled]="observacionLoading()">
                    {{ observacionLoading() ? 'Guardando...' : 'Guardar observacion' }}
                  </button>
                </div>
              </footer>
            </form>
          }
        }
        @case ('psicoanamnesis') {
          @if (!fichaCreada()) {
            <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Guarda los datos generales para continuar con la psicoanamnesis.
            </div>
          } @else if (!observacionGuardado()) {
            <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Registra la observacion clinica para habilitar la psicoanamnesis.
            </div>
          } @else {
            @if (psicoanamnesisError()) {
              <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ psicoanamnesisError() }}
              </div>
            }

            <form [formGroup]="psicoanamnesisForm" (ngSubmit)="guardarPsicoanamnesis()" class="space-y-8">
              <section formGroupName="prenatal" class="space-y-4 rounded-2xl border border-slate-200 p-5">
                <h2 class="text-sm font-semibold text-slate-800">Antecedentes prenatales</h2>
                <label class="block text-sm font-semibold text-slate-700">
                  Condiciones biologicas de los padres
                  <textarea formControlName="condicionesBiologicasPadres" rows="3"
                    class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Condiciones psicologicas de los padres
                  <textarea formControlName="condicionesPsicologicasPadres" rows="3"
                    class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Observaciones prenatales
                  <textarea formControlName="observacionPrenatal" rows="3"
                    class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                </label>
              </section>

              <section formGroupName="natal" class="space-y-4 rounded-2xl border border-slate-200 p-5">
                <h2 class="text-sm font-semibold text-slate-800">Antecedentes del nacimiento</h2>
                <label class="block text-sm font-semibold text-slate-700">
                  Parto normal
                  <select formControlName="partoNormal"
                    class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                    <option [ngValue]="null">Sin informacion</option>
                    <option [ngValue]="true">Si</option>
                    <option [ngValue]="false">No</option>
                  </select>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Termino del parto
                  <input type="text" formControlName="terminoParto"
                    class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" />
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Complicaciones
                  <textarea formControlName="complicacionesParto" rows="3"
                    class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Observaciones del nacimiento
                  <textarea formControlName="observacionNatal" rows="3"
                    class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                </label>
              </section>

              <section formGroupName="infancia" class="space-y-4 rounded-2xl border border-slate-200 p-5">
                <h2 class="text-sm font-semibold text-slate-800">Historia en la infancia</h2>
                <label class="block text-sm font-semibold text-slate-700">
                  Grado de sociabilidad
                  <select formControlName="gradoSociabilidad"
                    class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                    <option value="">Sin seleccionar</option>
                    @for (opcion of sociabilidadOpciones; track opcion.label) {
                      <option [value]="opcion.value">{{ opcion.label }}</option>
                    }
                  </select>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Relacion con padres y hermanos
                  <select formControlName="relacionPadresHermanos"
                    class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                    <option value="">Sin seleccionar</option>
                    @for (opcion of relacionFamiliarOpciones; track opcion.label) {
                      <option [value]="opcion.value">{{ opcion.label }}</option>
                    }
                  </select>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Discapacidad intelectual
                  <select formControlName="discapacidadIntelectual"
                    class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                    <option [ngValue]="null">Sin informacion</option>
                    <option [ngValue]="true">Si</option>
                    <option [ngValue]="false">No</option>
                  </select>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Grado de discapacidad
                  <select formControlName="gradoDiscapacidad"
                    class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                    <option value="">Sin seleccionar</option>
                    @for (opcion of gradosDiscapacidadOpciones; track opcion.label) {
                      <option [value]="opcion.value">{{ opcion.label }}</option>
                    }
                  </select>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Trastornos diagnosticados
                  <textarea formControlName="trastornos" rows="3"
                    class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Tratamientos psicologicos o psiquiatricos
                  <select formControlName="tratamientosPsicologicosPsiquiatricos"
                    class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                    <option [ngValue]="null">Sin informacion</option>
                    <option [ngValue]="true">Si</option>
                    <option [ngValue]="false">No</option>
                  </select>
                </label>
                <label class="block text-sm font-semibold text-slate-700">
                  Observaciones de la infancia
                  <textarea formControlName="observacionInfancia" rows="3"
                    class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"></textarea>
                </label>
              </section>

              <footer class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="flex flex-wrap gap-3">
                  <button type="button" (click)="goToStep('observacion')"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    Anterior
                  </button>
                  <button type="button" (click)="limpiarPsicoanamnesis()"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    Limpiar
                  </button>
                </div>
                <div class="flex flex-wrap gap-3">
                  <button type="button" (click)="cerrarFormulario()"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                    Cerrar
                  </button>
                  <button type="button" (click)="irProximaSeccion()"
                    class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:cursor-not-allowed disabled:opacity-60"
                    [disabled]="!psicoanamnesisGuardado()">
                    Siguiente
                  </button>
                  <button type="submit"
                    class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    [disabled]="psicoanamnesisLoading()">
                    {{ psicoanamnesisLoading() ? 'Guardando...' : 'Guardar psicoanamnesis' }}
                  </button>
                </div>
              </footer>
            </form>
          }
        }
          @case ('condicion') {
            @if (!fichaCreada()) {
              <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Guarda los datos generales para habilitar la condicion clinica.
              </div>
            } @else if (!psicoanamnesisGuardado()) {
              <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Registra y guarda la psicoanamnesis para completar la condicion clinica.
              </div>
            } @else {
              @if (condicionError()) {
                <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {{ condicionError() }}
                </div>
              }

              @if (resumenError()) {
                <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  {{ resumenError() }}
                </div>
              }

              <form [formGroup]="condicionForm" (ngSubmit)="guardarCondicionClinica()" class="space-y-6">
                <section class="space-y-4">
                  <header class="flex items-center justify-between">
                    <h2 class="text-sm font-semibold text-slate-800">Selecciona la condicion final</h2>
                    @if (resumenLoading()) {
                      <span class="text-xs font-medium uppercase tracking-wide text-slate-500">Cargando datos...</span>
                    }
                  </header>
                  @for (opcion of condicionOpciones; track opcion.value) {
                    <label class="flex cursor-pointer flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400">
                      <div class="flex items-center gap-3">
                        <input type="radio" [value]="opcion.value" formControlName="condicion" class="h-4 w-4 text-slate-900 focus:ring-slate-900" />
                        <div>
                          <p class="text-base font-semibold text-slate-900">{{ opcion.label }}</p>
                          <p class="text-sm text-slate-500">{{ opcion.description }}</p>
                        </div>
                      </div>
                    </label>
                  }
                  @if (hasCondicionError('condicion')) {
                    <p class="text-xs text-red-600">Selecciona una condicion para continuar.</p>
                  }
                </section>

                @if (condicionRequiereDiagnostico()) {
                  <section class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                      <label class="block text-sm font-semibold text-slate-700">
                        Buscar diagnostico CIE-10
                        <input type="search" [value]="cie10Query()" (input)="onCie10Search($any($event.target).value)" autocomplete="off"
                          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring" placeholder="Ej.: F33" />
                      </label>
                      <p class="mt-1 text-xs text-slate-500">Escribe al menos 3 caracteres para buscar en el catalogo oficial.</p>
                    </div>

                    @if (cie10Error()) {
                      <div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{{ cie10Error() }}</div>
                    }

                    @if (cie10Loading()) {
                      <p class="text-xs text-slate-500">Buscando diagnosticos...</p>
                    }

                    @if (!cie10Loading()) {
                      @let resultados = cie10Resultados();
                      @if (resultados.length) {
                        <ul class="space-y-2">
                          @for (item of resultados; track item.id ?? item.codigo) {
                            <li>
                              <button type="button" (click)="seleccionarDiagnostico(item)"
                                class="flex w-full flex-col gap-1 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm transition hover:border-slate-400">
                                <span class="font-semibold text-slate-900">{{ item.codigo }}</span>
                                <span class="text-slate-600">{{ item.descripcion }}</span>
                              </button>
                            </li>
                          }
                        </ul>
                      } @else if (cie10Query().trim().length >= 3 && !cie10Error()) {
                        <p class="text-xs text-slate-500">No se encontraron coincidencias con la busqueda realizada.</p>
                      }
                    }

                    @if (diagnosticoSeleccionado()) {
                      @let seleccionado = diagnosticoSeleccionado();
                      <article class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div>
                          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Diagnostico seleccionado</p>
                          <p class="text-sm font-semibold text-slate-900">{{ seleccionado?.codigo }}</p>
                          <p class="text-xs text-slate-600">{{ seleccionado?.descripcion }}</p>
                        </div>
                        <button type="button" (click)="limpiarDiagnosticoSeleccionado()" class="text-xs font-semibold text-slate-600 transition hover:text-slate-900">
                          Cambiar
                        </button>
                      </article>
                    }

                    @if (hasCondicionError('diagnosticoCodigo')) {
                      <p class="text-xs text-red-600">Selecciona un diagnostico del catalogo CIE-10.</p>
                    }

                    <div class="grid gap-4 md:grid-cols-2">
                      <label class="block text-sm font-semibold text-slate-700">
                        Frecuencia del plan
                        <select formControlName="planFrecuencia"
                          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                          <option value="" disabled>Selecciona una opcion</option>
                          @for (item of planFrecuenciaOpciones; track item.value) {
                            <option [value]="item.value">{{ item.label }}</option>
                          }
                        </select>
                      </label>

                      <label class="block text-sm font-semibold text-slate-700">
                        Tipo de sesion
                        <select formControlName="planTipoSesion"
                          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring">
                          <option value="" disabled>Selecciona una opcion</option>
                          @for (item of planTipoSesionOpciones; track item.value) {
                            <option [value]="item.value">{{ item.label }}</option>
                          }
                        </select>
                      </label>
                    </div>

                    <div class="grid gap-2 md:grid-cols-2">
                      @if (hasCondicionError('planFrecuencia')) {
                        <p class="text-xs text-red-600">Indica la frecuencia del plan de seguimiento.</p>
                      }
                      @if (hasCondicionError('planTipoSesion')) {
                        <p class="text-xs text-red-600">Selecciona el tipo de sesion planificada.</p>
                      }
                    </div>

                    <label class="block text-sm font-semibold text-slate-700">
                      Detalle del plan (opcional)
                      <textarea formControlName="planDetalle" rows="3"
                        class="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring"
                        placeholder="Describe brevemente la agenda propuesta"></textarea>
                    </label>
                    @if (hasCondicionError('planDetalle')) {
                      <p class="text-xs text-red-600">El detalle del plan supera el maximo permitido.</p>
                    }
                  </section>
                }

                @if (agendaRecomendada().length) {
                  <section class="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <header class="text-xs font-semibold uppercase tracking-wide text-slate-500">Agenda sugerida</header>
                    <ul class="space-y-2">
                      @for (item of agendaRecomendada(); track item.titulo) {
                        <li class="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <p class="text-sm font-semibold text-slate-900">{{ item.titulo }}</p>
                          <p class="text-xs text-slate-600">{{ item.detalle }}</p>
                        </li>
                      }
                    </ul>
                  </section>
                }

                <footer class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div class="flex flex-wrap gap-3">
                    <button type="button" (click)="goToStep('psicoanamnesis')"
                      class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                      Anterior
                    </button>
                    <button type="button" (click)="limpiarCondicion()"
                      class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                      Limpiar
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <button type="button" (click)="cerrarFormulario()"
                      class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                      Cerrar
                    </button>
                    <button type="submit"
                      class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      [disabled]="condicionLoading()">
                      {{ condicionLoading() ? 'Guardando...' : 'Guardar condicion clinica' }}
                    </button>
                  </div>
                </footer>
              </form>
            }
          }
      }
    </section>
  `
})
export class FichaPsicologicaFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FichasPsicologicasService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogos = inject(CatalogosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly steps: ReadonlyArray<{ id: StepId; label: string }> = [
    { id: 'generales', label: 'Datos generales' },
    { id: 'observacion', label: 'Observacion clinica' },
    { id: 'psicoanamnesis', label: 'Psicoanamnesis' },
    { id: 'condicion', label: 'Condicion clinica' }
  ];

  readonly estadosCanonicos = FICHA_ESTADOS_CANONICOS;
  readonly tiposCanonicos = FICHA_TIPOS_EVALUACION_CANONICOS;
  readonly sociabilidadOpciones = PSICOANAMNESIS_GRADOS_SOCIABILIDAD;
  readonly relacionFamiliarOpciones = PSICOANAMNESIS_RELACION_FAMILIAR;
  readonly gradosDiscapacidadOpciones = PSICOANAMNESIS_GRADOS_DISCAPACIDAD;
  readonly condicionOpciones = FICHA_CONDICION_CLINICA_OPCIONES;
  readonly planFrecuenciaOpciones = FICHA_PLAN_FRECUENCIAS;
  readonly planTipoSesionOpciones = FICHA_PLAN_TIPOS_SESION;

  readonly currentStep = signal<StepId>('generales');
  readonly navigationMessage = signal<string | null>(null);

  readonly generalesForm = this.fb.group({
    fechaEvaluacion: [''],
    tipoEvaluacion: ['', Validators.required],
    estado: ['ABIERTA', Validators.required]
  });

  readonly observacionForm = this.fb.group({
    observacionClinica: ['', [Validators.required, Validators.maxLength(4000)]],
    motivoConsulta: ['', [Validators.required, Validators.maxLength(4000)]],
    enfermedadActual: ['', [Validators.maxLength(4000)]]
  });

  readonly psicoanamnesisForm = this.fb.group({
    prenatal: this.fb.group({
      condicionesBiologicasPadres: [''],
      condicionesPsicologicasPadres: [''],
      observacionPrenatal: ['']
    }),
    natal: this.fb.group({
      partoNormal: [null as boolean | null],
      terminoParto: [''],
      complicacionesParto: [''],
      observacionNatal: ['']
    }),
    infancia: this.fb.group({
      gradoSociabilidad: [''],
      relacionPadresHermanos: [''],
      discapacidadIntelectual: [null as boolean | null],
      gradoDiscapacidad: [''],
      trastornos: [''],
      tratamientosPsicologicosPsiquiatricos: [null as boolean | null],
      observacionInfancia: ['']
    })
  });

  readonly condicionForm = this.fb.group({
    condicion: ['ALTA', Validators.required],
    diagnosticoCodigo: [''],
    diagnosticoDescripcion: [''],
    planFrecuencia: [''],
    planTipoSesion: [''],
    planDetalle: ['', [Validators.maxLength(500)]]
  });

  readonly loadingGenerales = signal(false);
  readonly generalesError = signal<string | null>(null);
  readonly generalesGuardado = signal(false);

  readonly observacionLoading = signal(false);
  readonly observacionError = signal<string | null>(null);
  readonly observacionGuardado = signal(false);

  readonly psicoanamnesisLoading = signal(false);
  readonly psicoanamnesisError = signal<string | null>(null);
  readonly psicoanamnesisGuardado = signal(false);

  readonly condicionLoading = signal(false);
  readonly condicionError = signal<string | null>(null);
  readonly condicionGuardado = signal(false);

  readonly resumenLoading = signal(false);
  readonly resumenError = signal<string | null>(null);

  readonly condicionSeleccionada = signal<FichaCondicionFinal>('ALTA');
  readonly condicionRequiereDiagnostico = computed(() => CONDICION_REQUIERE_DIAGNOSTICO.has(this.condicionSeleccionada()));
  readonly cie10Query = signal('');
  readonly cie10Resultados = signal<readonly CatalogoCIE10DTO[]>([]);
  readonly cie10Loading = signal(false);
  readonly cie10Error = signal<string | null>(null);
  readonly diagnosticoSeleccionado = signal<CatalogoCIE10DTO | null>(null);
  readonly cie10Catalogo = signal<readonly CatalogoCIE10DTO[]>([]);
  readonly cie10CatalogoLoaded = signal(false);
  private readonly agendaConfig: Record<FichaCondicionFinal, ReadonlyArray<CondicionAgendaItem>> = {
    ALTA: [],
    SEGUIMIENTO: [
      { titulo: 'Control inicial (30 dias)', detalle: 'Programar seguimiento dentro de los proximos 30 dias.' },
      { titulo: 'Reevaluacion trimestral', detalle: 'Agendar controles cada 90 dias mientras se mantenga la condicion.' }
    ],
    TRANSFERENCIA: [
      { titulo: 'Coordinacion con unidad receptora', detalle: 'Contactar a la unidad receptora y agendar cita dentro de 14 dias.' },
      { titulo: 'Verificacion de traslado', detalle: 'Confirmar asistencia en la unidad receptora despues de 60 dias.' }
    ]
  };
  readonly agendaRecomendada = computed(() => this.agendaConfig[this.condicionSeleccionada()] ?? []);
  private cie10SearchHandle: ReturnType<typeof setTimeout> | null = null;

  readonly persona = signal<PersonalMilitarDTO | null>(null);
  readonly personalId = signal<number | null>(null);
  readonly fichaCreada = signal<FichaPsicologicaHistorialDTO | null>(null);
  readonly fichaDetallada = signal<FichaPsicologicaHistorialDTO | null>(null);

  readonly personaDescripcion = computed(() => {
    const data = this.persona();
    if (!data) {
      return 'personal sin informacion disponible';
    }
    const apellidos = data.apellidos?.trim() || 'Sin apellidos';
    const nombres = data.nombres?.trim() || 'Sin nombres';
    const grado = data.grado?.trim();
    return grado ? `${apellidos}, ${nombres} (${grado})` : `${apellidos}, ${nombres}`;
  });

  readonly estadoSeleccionadoLabel = computed(() => {
    const value = this.generalesForm.get('estado')?.value;
    const match = this.estadosCanonicos.find(item => item.value === value);
    return match?.label ?? value ?? 'Sin estado';
  });

  readonly tipoSeleccionadoLabel = computed(() => {
    const value = this.generalesForm.get('tipoEvaluacion')?.value;
    const match = this.tiposCanonicos.find(item => item.value === value);
    return match?.label ?? value ?? 'Sin tipo';
  });

  readonly condicionSeleccionadaLabel = computed(() => {
    const value = this.condicionForm.get('condicion')?.value;
    const match = this.condicionOpciones.find(item => item.value === value);
    return match?.label ?? value ?? 'Sin condicion';
  });

  readonly fichaResumen = computed(() => this.fichaDetallada() ?? this.fichaCreada());
  readonly resumenPsicoanamnesis = computed(() => this.extractPsicoanamnesis(this.fichaResumen()));
  readonly resumenCondicion = computed(() => this.extractCondicion(this.fichaResumen()));

  constructor() {
    const statePersona = (history.state?.persona ?? null) as PersonalMilitarDTO | null;
    if (statePersona && typeof statePersona === 'object') {
      this.persona.set(statePersona);
    }

    const param = Number(this.route.snapshot.paramMap.get('personalId') ?? Number.NaN);
    if (Number.isFinite(param)) {
      this.personalId.set(param);
    } else {
      this.generalesError.set('No se recibio un identificador valido del personal.');
      this.generalesForm.disable();
    }

    if (!this.generalesForm.get('estado')?.value) {
      this.generalesForm.get('estado')?.setValue('ABIERTA');
    }

    this.observacionForm.disable();
    this.psicoanamnesisForm.disable();
    this.condicionForm.disable();

    const condicionControl = this.condicionForm.controls.condicion;
    condicionControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      const condicionNormalizada = this.normalizeCondicion(value) ?? 'ALTA';
      this.condicionSeleccionada.set(condicionNormalizada);
      this.applyCondicionValidators(condicionNormalizada);
    });

    const condicionInicial = this.normalizeCondicion(condicionControl.value) ?? 'ALTA';
    this.condicionSeleccionada.set(condicionInicial);
    this.applyCondicionValidators(condicionInicial);
    this.resetCondicionFormValues();

    this.destroyRef.onDestroy(() => {
      if (this.cie10SearchHandle) {
        clearTimeout(this.cie10SearchHandle);
        this.cie10SearchHandle = null;
      }
    });
  }

  isStepActive(stepId: StepId): boolean {
    return this.currentStep() === stepId;
  }

  isStepCompleted(stepId: StepId): boolean {
    if (stepId === 'generales') {
      return this.generalesGuardado();
    }
    if (stepId === 'observacion') {
      return this.observacionGuardado();
    }
    if (stepId === 'psicoanamnesis') {
      return this.psicoanamnesisGuardado();
    }
    if (stepId === 'condicion') {
      return this.condicionGuardado();
    }
    return false;
  }

  canAccessStep(stepId: StepId): boolean {
    if (stepId === 'generales') {
      return true;
    }
    if (stepId === 'observacion') {
      return !!this.fichaCreada();
    }
    if (stepId === 'psicoanamnesis') {
      return !!this.fichaCreada() && this.observacionGuardado();
    }
    if (stepId === 'condicion') {
      return !!this.fichaCreada() && this.psicoanamnesisGuardado();
    }
    return false;
  }

  goToStep(stepId: StepId) {
    if (stepId === this.currentStep()) {
      return;
    }
    if (!this.canAccessStep(stepId)) {
      if (stepId === 'observacion') {
        this.navigationMessage.set('Guarda los datos generales para continuar con la observacion clinica.');
      }
      if (stepId === 'psicoanamnesis') {
        this.navigationMessage.set('Registra la observacion clinica para habilitar la psicoanamnesis.');
      }
      if (stepId === 'condicion') {
        this.navigationMessage.set('Guarda la psicoanamnesis para habilitar la condicion clinica.');
      }
      return;
    }
    this.navigationMessage.set(null);
    this.currentStep.set(stepId);
  }

  hasGeneralesError(controlName: string): boolean {
    const control = this.generalesForm.get(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && (control.touched || control.dirty);
  }

  hasObservacionError(controlName: string): boolean {
    const control = this.observacionForm.get(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && (control.touched || control.dirty);
  }

  hasCondicionError(controlName: string): boolean {
    const control = this.condicionForm.get(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && (control.touched || control.dirty);
  }

  guardarDatosGenerales() {
    this.generalesForm.markAllAsTouched();
    this.generalesError.set(null);
    this.navigationMessage.set(null);
    if (this.generalesForm.invalid) {
      this.generalesError.set('Completa los datos obligatorios para continuar.');
      return;
    }

    const payload = this.buildGeneralesPayload();
    if (!payload) {
      return;
    }

    this.loadingGenerales.set(true);
    this.generalesGuardado.set(false);
    let request$: Observable<FichaPsicologicaHistorialDTO>;
    try {
      request$ = this.service.crearFichaInicial(payload);
    } catch (err) {
      this.loadingGenerales.set(false);
      this.generalesError.set(this.resolveSubmitError(err));
      return;
    }

    request$.subscribe({
      next: (res) => {
        this.loadingGenerales.set(false);
        this.generalesGuardado.set(true);
        this.generalesForm.disable();
        this.fichaCreada.set(res ?? null);
        this.syncObservacionFromFicha(res ?? null);
        this.syncPsicoanamnesisFromFicha(res ?? null);
        this.resetCondicionFormValues();
        this.condicionForm.disable({ emitEvent: false });
        this.fichaDetallada.set(null);
        this.resumenLoading.set(false);
        this.resumenError.set(null);
        this.currentStep.set('observacion');
      },
      error: (err) => {
        this.loadingGenerales.set(false);
        this.generalesError.set(this.resolveSubmitError(err));
      }
    });
  }

  guardarObservacion() {
    this.observacionForm.markAllAsTouched();
    this.observacionError.set(null);
    this.navigationMessage.set(null);
    if (this.observacionForm.invalid) {
      this.observacionError.set('Completa los campos obligatorios antes de continuar.');
      return;
    }

    const ficha = this.fichaCreada();
    const fichaId = ficha?.id;
    if (!Number.isFinite(fichaId)) {
      this.observacionError.set('Genera primero la ficha para registrar la observacion clinica.');
      return;
    }

    const payload = this.buildObservacionPayload();
    if (!payload) {
      return;
    }

    this.observacionLoading.set(true);
    this.observacionGuardado.set(false);
    let request$: Observable<FichaPsicologicaHistorialDTO>;
    try {
      request$ = this.service.actualizarObservacionClinica(Number(fichaId), payload);
    } catch (err) {
      this.observacionLoading.set(false);
      this.observacionError.set(this.resolveSubmitError(err));
      return;
    }

    request$.subscribe({
      next: (res) => {
        this.observacionLoading.set(false);
        const fichaActualizada = res ?? ficha ?? null;
        this.fichaCreada.set(fichaActualizada);
        this.syncObservacionFromFicha(fichaActualizada);
        this.observacionGuardado.set(true);
        this.syncPsicoanamnesisFromFicha(fichaActualizada);
        this.currentStep.set('psicoanamnesis');
      },
      error: (err) => {
        this.observacionLoading.set(false);
        this.observacionError.set(this.resolveSubmitError(err));
      }
    });
  }

  limpiarObservacion() {
    this.observacionForm.reset({
      observacionClinica: '',
      motivoConsulta: '',
      enfermedadActual: ''
    });
    this.observacionGuardado.set(false);
    this.observacionError.set(null);
    this.psicoanamnesisGuardado.set(false);
    this.updatePsicoanamnesisAccess();
    this.updateCondicionAccess();
    this.resetCondicionFormValues();
  }

  guardarPsicoanamnesis() {
    this.psicoanamnesisForm.markAllAsTouched();
    this.psicoanamnesisError.set(null);
    this.navigationMessage.set(null);

    const ficha = this.fichaCreada();
    const fichaId = ficha?.id;
    if (!Number.isFinite(fichaId)) {
      this.psicoanamnesisError.set('Genera y registra las secciones anteriores antes de guardar la psicoanamnesis.');
      return;
    }

    const payload = this.buildPsicoanamnesisPayload();
    if (!payload) {
      return;
    }

    this.psicoanamnesisLoading.set(true);
    this.psicoanamnesisGuardado.set(false);
    let request$: Observable<FichaPsicologicaHistorialDTO>;
    try {
      request$ = this.service.actualizarPsicoanamnesis(Number(fichaId), payload);
    } catch (err) {
      this.psicoanamnesisLoading.set(false);
      this.psicoanamnesisError.set(this.resolveSubmitError(err));
      return;
    }

    request$.subscribe({
      next: (res) => {
        this.psicoanamnesisLoading.set(false);
        const fichaActualizada = res ?? ficha ?? null;
        this.fichaCreada.set(fichaActualizada);
        this.syncPsicoanamnesisFromFicha(fichaActualizada);
        this.psicoanamnesisGuardado.set(true);
        this.updateCondicionAccess();
        this.resumenError.set(null);
        this.currentStep.set('condicion');
        this.resumenLoading.set(true);
        const fichaIdActualizado = fichaActualizada?.id ?? fichaId;
        if (Number.isFinite(fichaIdActualizado)) {
          this.fetchFichaCompleta(Number(fichaIdActualizado));
        } else {
          this.resumenLoading.set(false);
        }
      },
      error: (err) => {
        this.psicoanamnesisLoading.set(false);
        this.psicoanamnesisError.set(this.resolveSubmitError(err));
      }
    });
  }

  limpiarPsicoanamnesis() {
    this.psicoanamnesisForm.reset({
      prenatal: {
        condicionesBiologicasPadres: '',
        condicionesPsicologicasPadres: '',
        observacionPrenatal: ''
      },
      natal: {
        partoNormal: null,
        terminoParto: '',
        complicacionesParto: '',
        observacionNatal: ''
      },
      infancia: {
        gradoSociabilidad: '',
        relacionPadresHermanos: '',
        discapacidadIntelectual: null,
        gradoDiscapacidad: '',
        trastornos: '',
        tratamientosPsicologicosPsiquiatricos: null,
        observacionInfancia: ''
      }
    });
    this.psicoanamnesisGuardado.set(false);
    this.psicoanamnesisError.set(null);
    this.updatePsicoanamnesisAccess();
    this.updateCondicionAccess();
    this.resetCondicionFormValues();
  }

  guardarCondicionClinica() {
    this.condicionForm.markAllAsTouched();
    this.condicionError.set(null);
    this.navigationMessage.set(null);

    if (this.condicionForm.invalid) {
      this.condicionError.set('Completa la informacion requerida antes de guardar.');
      return;
    }

    const ficha = this.fichaCreada();
    const fichaId = ficha?.id;
    if (!Number.isFinite(fichaId)) {
      this.condicionError.set('Genera y completa las secciones previas para registrar la condicion clinica.');
      return;
    }

    const payload = this.buildCondicionPayload();
    if (!payload) {
      return;
    }

    this.condicionLoading.set(true);
    this.condicionGuardado.set(false);
    let request$: Observable<FichaPsicologicaHistorialDTO>;
    try {
      request$ = this.service.actualizarCondicionClinica(Number(fichaId), payload);
    } catch (err) {
      this.condicionLoading.set(false);
      this.condicionError.set(this.resolveSubmitError(err));
      return;
    }

    request$.subscribe({
      next: (res) => {
        this.condicionLoading.set(false);
        const fichaActualizada = res ?? ficha ?? null;
        this.fichaCreada.set(fichaActualizada);
        this.fichaDetallada.set(fichaActualizada);
        this.syncCondicionFromFicha(fichaActualizada);
        this.condicionGuardado.set(true);
        this.resumenError.set(null);
        this.resumenLoading.set(false);
        const destino = this.resolvePersonalId(fichaActualizada);
        const mensaje = this.buildCondicionMensaje(fichaActualizada);
        if (Number.isFinite(destino)) {
          this.redirigirAHistorial(Number(destino), mensaje);
        }
      },
      error: (err) => {
        this.condicionLoading.set(false);
        this.condicionError.set(this.resolveSubmitError(err));
      }
    });
  }

  private buildCondicionMensaje(ficha: FichaPsicologicaHistorialDTO | null | undefined): string {
    const condicion = this.normalizeCondicion(ficha?.condicion) ?? this.condicionSeleccionada();
    if (condicion === 'ALTA') {
      return 'Condicion registrada como Alta.';
    }
    if (condicion === 'TRANSFERENCIA') {
      return 'Condicion registrada como Transferencia.';
    }
    return 'Condicion clinica y plan de seguimiento actualizados.';
  }

  private resolvePersonalId(ficha: FichaPsicologicaHistorialDTO | null | undefined): number | null {
    if (ficha && typeof ficha.personalMilitarId === 'number') {
      return ficha.personalMilitarId;
    }
    const fromPersona = this.persona()?.id;
    if (typeof fromPersona === 'number') {
      return fromPersona;
    }
    const stored = this.personalId();
    return Number.isFinite(stored) ? Number(stored) : null;
  }

  private redirigirAHistorial(personalId: number, mensaje: string) {
    const extras = { state: { mensaje } } as const;
    this.router.navigate(['/psicologo/personal', personalId, 'historial'], extras).catch(() => {
      this.navigationMessage.set('Condicion registrada, pero no fue posible abrir el historial automaticamente.');
    });
  }

  limpiarCondicion() {
    this.resetCondicionFormValues();
    this.condicionForm.markAsPristine();
    this.condicionForm.markAsUntouched();
    this.condicionError.set(null);
  }

  cerrarFormulario() {
    this.router.navigate(['/psicologo/personal']).catch(() => {
      this.navigationMessage.set('No fue posible cerrar el formulario.');
    });
  }

  irProximaSeccion() {
    const order: StepId[] = ['generales', 'observacion', 'psicoanamnesis', 'condicion'];
    const current = this.currentStep();
    const index = order.indexOf(current);
    if (index === -1) {
      return;
    }
    const next = order[index + 1];
    if (next) {
      this.goToStep(next);
    } else {
      this.navigationMessage.set('Ya registraste todas las secciones disponibles.');
    }
  }

  private buildGeneralesPayload(): FichaPsicologicaCreacionInicialDTO | null {
    const personalId = this.personalId();
    if (!Number.isFinite(personalId)) {
      this.generalesError.set('No se puede registrar la ficha sin un personal asociado.');
      return null;
    }

    const { fechaEvaluacion, tipoEvaluacion, estado } = this.generalesForm.getRawValue();
    const tipo = typeof tipoEvaluacion === 'string' ? tipoEvaluacion.trim() : '';
    const estadoValor = typeof estado === 'string' ? estado.trim() : '';

    if (!tipo.length || !estadoValor.length) {
      this.generalesError.set('Completa los datos obligatorios para continuar.');
      return null;
    }

    const estadoCanonico = this.estadosCanonicos.find(item => item.value === estadoValor || item.label === estadoValor);
    const estadoParaApi = estadoCanonico?.label ?? estadoValor;
    const tipoCanonico = this.tiposCanonicos.find(item => item.value === tipo || item.label === tipo);
    const tipoParaApi = tipoCanonico?.value ?? tipo;

    return {
      personalMilitarId: Number(personalId),
      tipoEvaluacion: tipoParaApi,
      estado: estadoParaApi,
      fechaEvaluacion: this.cleanOptionalText(fechaEvaluacion)
    };
  }

  private buildObservacionPayload(): FichaObservacionClinicaPayload | null {
    const { observacionClinica, motivoConsulta, enfermedadActual } = this.observacionForm.getRawValue();
    const observacion = this.cleanRequiredText(observacionClinica);
    const motivo = this.cleanRequiredText(motivoConsulta);
    if (!observacion || !motivo) {
      this.observacionError.set('Completa los campos obligatorios antes de continuar.');
      return null;
    }
    return {
      observacionClinica: observacion,
      motivoConsulta: motivo,
      enfermedadActual: this.cleanOptionalText(enfermedadActual)
    };
  }

  private buildPsicoanamnesisPayload(): FichaPsicoanamnesisPayload | null {
    const raw = this.psicoanamnesisForm.getRawValue() as PsicoanamnesisFormValue;

    const prenatal = this.buildSectionPayload({
      condicionesBiologicasPadres: this.toNullableString(raw.prenatal.condicionesBiologicasPadres),
      condicionesPsicologicasPadres: this.toNullableString(raw.prenatal.condicionesPsicologicasPadres),
      observacionPrenatal: this.toNullableString(raw.prenatal.observacionPrenatal)
    });

    const natal = this.buildSectionPayload({
      partoNormal: this.toNullableBoolean(raw.natal.partoNormal),
      terminoParto: this.toNullableString(raw.natal.terminoParto),
      complicacionesParto: this.toNullableString(raw.natal.complicacionesParto),
      observacionNatal: this.toNullableString(raw.natal.observacionNatal)
    });

    const infancia = this.buildSectionPayload({
      gradoSociabilidad: this.normalizeSociabilidad(raw.infancia.gradoSociabilidad),
      relacionPadresHermanos: this.normalizeRelacionFamiliar(raw.infancia.relacionPadresHermanos),
      discapacidadIntelectual: this.toNullableBoolean(raw.infancia.discapacidadIntelectual),
      gradoDiscapacidad: this.normalizeGradoDiscapacidad(raw.infancia.gradoDiscapacidad),
      trastornos: this.toNullableString(raw.infancia.trastornos),
      tratamientosPsicologicosPsiquiatricos: this.toNullableBoolean(raw.infancia.tratamientosPsicologicosPsiquiatricos),
      observacionInfancia: this.toNullableString(raw.infancia.observacionInfancia)
    });

    const payload: FichaPsicoanamnesisPayload = {};
    if (prenatal) {
      payload.prenatal = prenatal as FichaPsicoanamnesisPayload['prenatal'];
    }
    if (natal) {
      payload.natal = natal as FichaPsicoanamnesisPayload['natal'];
    }
    if (infancia) {
      payload.infancia = infancia as FichaPsicoanamnesisPayload['infancia'];
    }

    if (!this.hasPsicoanamnesisPayloadData(payload)) {
      this.psicoanamnesisError.set('Registra informacion en al menos una seccion de la psicoanamnesis.');
      return null;
    }

    return payload;
  }

  private buildCondicionPayload(): FichaCondicionClinicaPayload | null {
    const raw = this.condicionForm.getRawValue() as CondicionClinicaFormValue;
    const condicion = this.normalizeCondicion(raw.condicion);
    if (!condicion) {
      this.condicionError.set('Selecciona la condicion clinica.');
      return null;
    }

    const requiereDiagnostico = this.requiereDiagnostico(condicion);
    const diagnosticoCodigo = this.cleanOptionalText(raw.diagnosticoCodigo);
    const diagnosticoDescripcion = this.cleanOptionalText(raw.diagnosticoDescripcion);
    const planFrecuencia = this.cleanOptionalText(raw.planFrecuencia);
    const planTipoSesion = this.cleanOptionalText(raw.planTipoSesion);
    const planDetalle = this.cleanOptionalText(raw.planDetalle);

    if (requiereDiagnostico) {
      if (!diagnosticoCodigo || !diagnosticoDescripcion) {
        this.condicionError.set('Selecciona un diagnostico CIE-10 para esta condicion.');
        return null;
      }
      if (!planFrecuencia || !planTipoSesion) {
        this.condicionError.set('Completa la frecuencia y el tipo de sesion del plan de seguimiento.');
        return null;
      }
    }

    const payload: FichaCondicionClinicaPayload = { condicion: CONDICION_API_MAP[condicion] };
    if (requiereDiagnostico) {
      payload.diagnosticoCie10Codigo = diagnosticoCodigo;
      payload.diagnosticoCie10Descripcion = diagnosticoDescripcion;
      payload.planFrecuencia = planFrecuencia;
      payload.planTipoSesion = planTipoSesion;
      payload.planDetalle = planDetalle ?? null;
    } else {
      payload.diagnosticoCie10Codigo = null;
      payload.diagnosticoCie10Descripcion = null;
      payload.planFrecuencia = null;
      payload.planTipoSesion = null;
      payload.planDetalle = null;
    }

    return payload;
  }

  onCie10Search(rawValue = '') {
    const value = rawValue;
    const query = value.trim();
    this.cie10Query.set(value);
    this.cie10Error.set(null);

    if (this.cie10SearchHandle) {
      clearTimeout(this.cie10SearchHandle);
      this.cie10SearchHandle = null;
    }

    const catalogoPreviamenteCargado = this.cie10CatalogoLoaded();
    if (!catalogoPreviamenteCargado) {
      this.ensureCatalogoCargado();
    }

    if (query.length < 3) {
      if (catalogoPreviamenteCargado) {
        const locales = this.filtrarCatalogoLocal(query);
        this.cie10Resultados.set(locales);
        this.cie10Loading.set(false);
      }
      return;
    }

    this.cie10Loading.set(true);
    const currentQuery = query;
    this.cie10SearchHandle = setTimeout(() => {
      this.catalogos.buscarCIE10(currentQuery).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (items) => {
          if (this.cie10Query().trim() !== currentQuery) {
            return;
          }
          const listado = Array.isArray(items) ? items : [];
          this.cie10Resultados.set(listado);
          this.cie10Loading.set(false);
        },
        error: () => {
          if (this.cie10Query().trim() !== currentQuery) {
            return;
          }
          this.cie10Resultados.set(this.filtrarCatalogoLocal(currentQuery));
          this.cie10Loading.set(false);
          this.cie10Error.set('No se pudo ejecutar la busqueda en el catalogo CIE-10. Intenta nuevamente.');
        }
      });
    }, 300);
  }

  seleccionarDiagnostico(item: CatalogoCIE10DTO) {
    if (!item) {
      return;
    }
    this.diagnosticoSeleccionado.set(item);
    this.condicionForm.patchValue(
      {
        diagnosticoCodigo: item.codigo ?? '',
        diagnosticoDescripcion: item.descripcion ?? ''
      },
      { emitEvent: false }
    );
    const controles = this.condicionForm.controls;
    controles.diagnosticoCodigo.markAsDirty();
    controles.diagnosticoDescripcion.markAsDirty();
    controles.diagnosticoCodigo.markAsTouched();
    controles.diagnosticoDescripcion.markAsTouched();
    controles.diagnosticoCodigo.updateValueAndValidity({ emitEvent: false });
    controles.diagnosticoDescripcion.updateValueAndValidity({ emitEvent: false });
    this.cie10Resultados.set([]);
    this.cie10Loading.set(false);
    this.cie10Query.set(`${item.codigo} - ${item.descripcion}`.trim());
  }

  limpiarDiagnosticoSeleccionado() {
    this.diagnosticoSeleccionado.set(null);
    this.condicionForm.patchValue({ diagnosticoCodigo: '', diagnosticoDescripcion: '' }, { emitEvent: false });
    this.condicionForm.controls.diagnosticoCodigo.updateValueAndValidity({ emitEvent: false });
    this.condicionForm.controls.diagnosticoDescripcion.updateValueAndValidity({ emitEvent: false });
    if (this.requiereDiagnostico(this.condicionSeleccionada())) {
      this.cie10Query.set('');
      if (this.cie10CatalogoLoaded()) {
        this.cie10Resultados.set(this.filtrarCatalogoLocal(''));
        this.cie10Loading.set(false);
      } else {
        this.ensureCatalogoCargado();
      }
    } else {
      this.cie10Resultados.set([]);
    }
    if (this.cie10SearchHandle) {
      clearTimeout(this.cie10SearchHandle);
      this.cie10SearchHandle = null;
    }
    if (!this.requiereDiagnostico(this.condicionSeleccionada())) {
      this.cie10Loading.set(false);
    }
  }

  private syncObservacionFromFicha(ficha: FichaPsicologicaHistorialDTO | null) {
    const seccion = ficha?.seccionObservacion;
    const valores = {
      observacionClinica: seccion?.observacionClinica ?? '',
      motivoConsulta: seccion?.motivoConsulta ?? '',
      enfermedadActual: seccion?.enfermedadActual ?? ''
    };
    this.observacionForm.reset(valores);
    if (ficha) {
      this.observacionForm.enable();
      const guardado = Boolean(valores.observacionClinica && valores.motivoConsulta);
      this.observacionGuardado.set(guardado);
    } else {
      this.observacionForm.disable();
      this.observacionGuardado.set(false);
    }
    this.updatePsicoanamnesisAccess();
  }

  private syncPsicoanamnesisFromFicha(ficha: FichaPsicologicaHistorialDTO | null) {
    const seccion = this.extractPsicoanamnesis(ficha);
    const valores: PsicoanamnesisFormValue = {
      prenatal: {
        condicionesBiologicasPadres: seccion?.prenatal?.condicionesBiologicasPadres ?? '',
        condicionesPsicologicasPadres: seccion?.prenatal?.condicionesPsicologicasPadres ?? '',
        observacionPrenatal: seccion?.prenatal?.observacionPrenatal ?? ''
      },
      natal: {
        partoNormal: seccion?.natal?.partoNormal ?? null,
        terminoParto: seccion?.natal?.terminoParto ?? '',
        complicacionesParto: seccion?.natal?.complicacionesParto ?? '',
        observacionNatal: seccion?.natal?.observacionNatal ?? ''
      },
      infancia: {
        gradoSociabilidad: this.normalizeSociabilidad(seccion?.infancia?.gradoSociabilidad) ?? '',
        relacionPadresHermanos: this.normalizeRelacionFamiliar(seccion?.infancia?.relacionPadresHermanos) ?? '',
        discapacidadIntelectual: seccion?.infancia?.discapacidadIntelectual ?? null,
        gradoDiscapacidad: this.normalizeGradoDiscapacidad(seccion?.infancia?.gradoDiscapacidad) ?? '',
        trastornos: seccion?.infancia?.trastornos ?? '',
        tratamientosPsicologicosPsiquiatricos: seccion?.infancia?.tratamientosPsicologicosPsiquiatricos ?? null,
        observacionInfancia: seccion?.infancia?.observacionInfancia ?? ''
      }
    };

    this.psicoanamnesisForm.reset(valores);

    const guardado = this.sectionHasContent(seccion?.prenatal) || this.sectionHasContent(seccion?.natal) || this.sectionHasContent(seccion?.infancia);
    this.psicoanamnesisGuardado.set(guardado);
    this.updatePsicoanamnesisAccess();
    this.updateCondicionAccess();
  }

  private syncCondicionFromFicha(ficha: FichaPsicologicaHistorialDTO | null) {
    const seccion = this.extractCondicion(ficha);
    const condicion = this.normalizeCondicion(seccion?.condicion) ?? 'ALTA';
    const valores: CondicionClinicaFormValue = {
      condicion,
      diagnosticoCodigo: seccion?.diagnosticoCie10Codigo ?? '',
      diagnosticoDescripcion: seccion?.diagnosticoCie10Descripcion ?? '',
      planFrecuencia: seccion?.planFrecuencia ?? '',
      planTipoSesion: seccion?.planTipoSesion ?? '',
      planDetalle: seccion?.planDetalle ?? ''
    };

    this.condicionForm.reset(valores, { emitEvent: false });
    this.condicionSeleccionada.set(condicion);
    if (valores.diagnosticoCodigo && valores.diagnosticoDescripcion) {
      this.diagnosticoSeleccionado.set({
        codigo: valores.diagnosticoCodigo,
        descripcion: valores.diagnosticoDescripcion
      });
      this.cie10Query.set(`${valores.diagnosticoCodigo} - ${valores.diagnosticoDescripcion}`.trim());
    } else {
      this.diagnosticoSeleccionado.set(null);
      if (!this.condicionRequiereDiagnostico()) {
        this.cie10Query.set('');
      }
    }
    this.applyCondicionValidators(condicion);
    const guardado = Boolean(seccion?.condicion);
    this.condicionGuardado.set(guardado);
    this.updateCondicionAccess();
  }

  private cleanOptionalText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private cleanRequiredText(value: unknown): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) {
        return trimmed;
      }
    }
    return '';
  }

  private toNullableString(value: unknown): string | null | undefined {
    if (value === null) {
      return null;
    }
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private toNullableBoolean(value: unknown): boolean | null | undefined {
    if (value === null) {
      return null;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
      if (!value.trim().length) {
        return null;
      }
    }
    return undefined;
  }

  private buildSectionPayload<T extends Record<string, string | boolean | null | undefined>>(section: T): T | undefined {
    const entries = Object.entries(section).filter(([, value]) => value !== undefined);
    if (!entries.length) {
      return undefined;
    }
    return Object.fromEntries(entries) as T;
  }

  private hasPsicoanamnesisPayloadData(payload: FichaPsicoanamnesisPayload): boolean {
    return Boolean(payload.prenatal || payload.natal || payload.infancia);
  }

  private sectionHasContent(section: unknown): boolean {
    if (!section || typeof section !== 'object') {
      return false;
    }
    return Object.values(section as Record<string, unknown>).some((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (typeof value === 'boolean') {
        return true;
      }
      return value !== null && value !== undefined;
    });
  }

  private updatePsicoanamnesisAccess() {
    if (this.fichaCreada() && this.observacionGuardado()) {
      this.psicoanamnesisForm.enable({ emitEvent: false });
    } else {
      this.psicoanamnesisForm.disable({ emitEvent: false });
    }
  }

  private updateCondicionAccess() {
    if (this.fichaCreada() && this.psicoanamnesisGuardado()) {
      this.condicionForm.enable({ emitEvent: false });
    } else {
      this.condicionForm.disable({ emitEvent: false });
    }
  }

  private normalizeSociabilidad(value: unknown): string | null | undefined {
    return this.normalizeEnum(value, SOCIABILIDAD_CANONICAL);
  }

  private normalizeRelacionFamiliar(value: unknown): string | null | undefined {
    return this.normalizeEnum(value, RELACION_CANONICAL);
  }

  private normalizeGradoDiscapacidad(value: unknown): string | null | undefined {
    return this.normalizeEnum(value, DISCAPACIDAD_CANONICAL);
  }

  private normalizeEnum<T extends string>(value: unknown, map: ReadonlyMap<string, T>): T | null | undefined {
    if (value === null) {
      return null;
    }
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    if (!trimmed.length) {
      return null;
    }
    const canonical = map.get(trimmed.toLowerCase());
    if (canonical) {
      return canonical;
    }
    const normalizedLower = trimmed.toLowerCase();
    for (const valueCanonical of map.values()) {
      const normalizedCanonical = valueCanonical.toLowerCase();
      if (normalizedLower.startsWith(normalizedCanonical)) {
        return valueCanonical;
      }
    }
    return trimmed as T;
  }

  private normalizeCondicion(value: unknown): FichaCondicionFinal | null | undefined {
    return this.normalizeEnum(value, CONDICION_CANONICAL);
  }

  private requiereDiagnostico(value: FichaCondicionFinal | null | undefined): boolean {
    if (!value) {
      return false;
    }
    return CONDICION_REQUIERE_DIAGNOSTICO.has(value);
  }

  private ensureCatalogoCargado() {
    if (this.cie10CatalogoLoaded()) {
      this.cie10Resultados.set(this.filtrarCatalogoLocal(this.cie10Query()));
      return;
    }
    this.cie10Loading.set(true);
    this.catalogos.listarCIE10({ soloActivos: true }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (items) => {
        const listado = Array.isArray(items) ? items : [];
        this.cie10Catalogo.set(listado);
        this.cie10CatalogoLoaded.set(true);
        this.cie10Resultados.set(this.filtrarCatalogoLocal(this.cie10Query()));
        this.cie10Loading.set(false);
      },
      error: () => {
        this.cie10Catalogo.set([]);
        this.cie10CatalogoLoaded.set(false);
        this.cie10Resultados.set([]);
        this.cie10Loading.set(false);
        this.cie10Error.set('No se pudo cargar el catalogo CIE-10. Intenta nuevamente.');
      }
    });
  }

  private filtrarCatalogoLocal(queryRaw: string): readonly CatalogoCIE10DTO[] {
    const catalogo = this.cie10Catalogo();
    if (!catalogo.length) {
      return [];
    }
    const query = queryRaw?.trim().toLowerCase() ?? '';
    if (!query.length) {
      return catalogo;
    }
    return catalogo.filter((item) => {
      const codigo = item.codigo?.toLowerCase() ?? '';
      const descripcion = item.descripcion?.toLowerCase() ?? '';
      return codigo.includes(query) || descripcion.includes(query);
    });
  }

  private applyCondicionValidators(value: unknown) {
    const condicion = this.normalizeCondicion(value) ?? 'ALTA';
    const requiereDiagnostico = this.requiereDiagnostico(condicion);
    const controles = this.condicionForm.controls;

    controles.diagnosticoCodigo.clearValidators();
    controles.diagnosticoDescripcion.clearValidators();
    controles.planFrecuencia.clearValidators();
    controles.planTipoSesion.clearValidators();

    controles.planFrecuencia.enable({ emitEvent: false });
    controles.planTipoSesion.enable({ emitEvent: false });
    controles.planDetalle.enable({ emitEvent: false });

    if (requiereDiagnostico) {
      controles.diagnosticoCodigo.addValidators(Validators.required);
      controles.diagnosticoDescripcion.addValidators(Validators.required);
      controles.planFrecuencia.addValidators(Validators.required);
      controles.planTipoSesion.addValidators(Validators.required);
      this.ensureCatalogoCargado();
    } else {
      this.limpiarDiagnosticoSeleccionado();
      this.cie10Query.set('');
      this.cie10Resultados.set([]);
      this.cie10Error.set(null);
      this.cie10Loading.set(false);
      controles.planFrecuencia.setValue('', { emitEvent: false });
      controles.planTipoSesion.setValue('', { emitEvent: false });
      controles.planDetalle.setValue('', { emitEvent: false });
      controles.planFrecuencia.disable({ emitEvent: false });
      controles.planTipoSesion.disable({ emitEvent: false });
      controles.planDetalle.disable({ emitEvent: false });
    }

    controles.diagnosticoCodigo.updateValueAndValidity({ emitEvent: false });
    controles.diagnosticoDescripcion.updateValueAndValidity({ emitEvent: false });
    controles.planFrecuencia.updateValueAndValidity({ emitEvent: false });
    controles.planTipoSesion.updateValueAndValidity({ emitEvent: false });
    controles.planDetalle.updateValueAndValidity({ emitEvent: false });
  }

  private resetCondicionFormValues() {
    this.condicionForm.reset({
      condicion: 'ALTA',
      diagnosticoCodigo: '',
      diagnosticoDescripcion: '',
      planFrecuencia: '',
      planTipoSesion: '',
      planDetalle: ''
    }, { emitEvent: false });
    this.condicionSeleccionada.set('ALTA');
    this.applyCondicionValidators('ALTA');
    this.condicionError.set(null);
    this.condicionGuardado.set(false);
  }

  private extractPsicoanamnesis(ficha: FichaPsicologicaHistorialDTO | null): FichaPsicoanamnesisDTO | null {
    if (!ficha) {
      return null;
    }
    if (ficha.seccionPsicoanamnesis) {
      return ficha.seccionPsicoanamnesis;
    }

    const prenatal = ficha.seccionPrenatal ? {
      condicionesBiologicasPadres: ficha.seccionPrenatal.condicionesBiologicasPadres ?? null,
      condicionesPsicologicasPadres: ficha.seccionPrenatal.condicionesPsicologicasPadres ?? null,
      observacionPrenatal: (ficha.seccionPrenatal as { observacion?: string; observacionPrenatal?: string }).observacionPrenatal
        ?? (ficha.seccionPrenatal as { observacion?: string }).observacion
        ?? null
    } : undefined;

    const natal = ficha.seccionNatal ? {
      partoNormal: ficha.seccionNatal.partoNormal ?? null,
      terminoParto: (ficha.seccionNatal as { termino?: string; terminoParto?: string }).terminoParto
        ?? (ficha.seccionNatal as { termino?: string }).termino
        ?? null,
      complicacionesParto: (ficha.seccionNatal as { complicaciones?: string; complicacionesParto?: string }).complicacionesParto
        ?? (ficha.seccionNatal as { complicaciones?: string }).complicaciones
        ?? null,
      observacionNatal: (ficha.seccionNatal as { observacion?: string; observacionNatal?: string }).observacionNatal
        ?? (ficha.seccionNatal as { observacion?: string }).observacion
        ?? null
    } : undefined;

    const infancia = ficha.seccionInfancia ? {
      gradoSociabilidad: ficha.seccionInfancia.gradoSociabilidad ?? null,
      relacionPadresHermanos: ficha.seccionInfancia.relacionPadresHermanos ?? null,
      discapacidadIntelectual: ficha.seccionInfancia.discapacidadIntelectual ?? null,
      gradoDiscapacidad: ficha.seccionInfancia.gradoDiscapacidad ?? null,
      trastornos: ficha.seccionInfancia.trastornos ?? null,
      tratamientosPsicologicosPsiquiatricos: ficha.seccionInfancia.tratamientosPsicologicosPsiquiatricos ?? null,
      observacionInfancia: (ficha.seccionInfancia as { observacion?: string; observacionInfancia?: string }).observacionInfancia
        ?? (ficha.seccionInfancia as { observacion?: string }).observacion
        ?? null
    } : undefined;

    if (prenatal || natal || infancia) {
      return { prenatal, natal, infancia };
    }

    return null;
  }

  private extractCondicion(ficha: FichaPsicologicaHistorialDTO | null): FichaCondicionClinicaDTO | null {
    if (!ficha) {
      return null;
    }
    if (ficha.seccionCondicionClinica) {
      return ficha.seccionCondicionClinica;
    }

    const condicion = ficha.condicion ?? null;
    const diagnosticoCodigo = ficha.diagnosticoCie10Codigo ?? null;
    const diagnosticoDescripcion = ficha.diagnosticoCie10Descripcion ?? null;
    const planFrecuencia = ficha.planFrecuencia ?? null;
    const planTipoSesion = ficha.planTipoSesion ?? null;
    const planDetalle = ficha.planDetalle ?? null;

    if (condicion || diagnosticoCodigo || diagnosticoDescripcion || planFrecuencia || planTipoSesion || planDetalle) {
      return {
        condicion,
        diagnosticoCie10Codigo: diagnosticoCodigo,
        diagnosticoCie10Descripcion: diagnosticoDescripcion,
        planFrecuencia,
        planTipoSesion,
        planDetalle
      };
    }

    return null;
  }

  private fetchFichaCompleta(fichaId: number) {
    let request$: Observable<FichaPsicologicaHistorialDTO>;
    try {
      request$ = this.service.obtenerFichaCompleta(fichaId);
    } catch (err) {
      this.resumenLoading.set(false);
      this.resumenError.set(this.resolveSubmitError(err));
      return;
    }

    request$.subscribe({
      next: (res) => {
        this.resumenLoading.set(false);
        const ficha = res ?? null;
        if (ficha) {
          this.fichaCreada.set(ficha);
          this.fichaDetallada.set(ficha);
          this.syncObservacionFromFicha(ficha);
          this.syncPsicoanamnesisFromFicha(ficha);
          this.syncCondicionFromFicha(ficha);
        } else {
          this.fichaDetallada.set(null);
        }
      },
      error: (err) => {
        this.resumenLoading.set(false);
        this.resumenError.set(this.resolveSubmitError(err));
      }
    });
  }

  private resolveSubmitError(err: unknown): string {
    const statusMessage = this.extractStatusMessage(err);
    if (statusMessage) {
      return statusMessage;
    }

    const payloadMessage = this.extractPayloadMessage(err);
    if (payloadMessage) {
      return payloadMessage;
    }

    if (err instanceof Error && err.message === 'Valor requerido para la ficha psicologica no proporcionado') {
      return 'Completa los datos obligatorios para continuar.';
    }

    return 'No fue posible registrar la ficha. Intenta nuevamente.';
  }

  private extractStatusMessage(err: unknown): string | null {
    if (!(err && typeof err === 'object' && 'status' in err)) {
      return null;
    }
    const status = (err as { status?: number }).status;
    if (status === 400) {
      return 'La informacion enviada es invalida. Revisa los campos obligatorios.';
    }
    if (status === 403) {
      return 'No cuentas con permisos para registrar fichas psicologicas.';
    }
    return null;
  }

  private extractPayloadMessage(err: unknown): string | null {
    if (!(err && typeof err === 'object' && 'error' in err)) {
      return null;
    }
    const payload = err as { error?: unknown };
    if (typeof payload.error === 'string' && payload.error.trim().length) {
      return payload.error.trim();
    }
    if (payload.error && typeof payload.error === 'object' && 'message' in payload.error) {
      const message = (payload.error as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length) {
        return message.trim();
      }
    }
    return null;
  }
}
