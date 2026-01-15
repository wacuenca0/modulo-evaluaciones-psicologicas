import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogoCIE10DTO } from '../../models/catalogo.models';
import { Cie10LookupComponent } from '../../reports/shared/cie10-lookup.component';
import {
  FICHA_CONDICION_CLINICA_OPCIONES,
  FICHA_PLAN_FRECUENCIAS,
  FICHA_PLAN_TIPOS_SESION,
  FichaCondicionFinal,
  FichaPlanFrecuencia,
  FichaPlanTipoSesion
} from '../../models/fichas-psicologicas.models';

type SeguimientoModalResult = {
  success: boolean;
  condicion?: FichaCondicionFinal;
  diagnostico?: any;
  plan?: any;
  transferencia?: any;
};

@Component({
  selector: 'app-seguimiento-modal',
  templateUrl: './seguimiento-modal.component.html',
  // styleUrls eliminado para evitar error NG2008
  imports: [CommonModule, ReactiveFormsModule, Cie10LookupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeguimientoModalComponent {
  // ============ SERVICIOS ============
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  // ============ INPUTS ============
  readonly visible = input(false);
  readonly fichaId = input<number | null>(null);
  readonly guardando = input(false);
  readonly personalMilitarId = input<number | null>(null);

  // ============ OUTPUTS ============
  readonly cancel = output<void>();
  readonly submit = output<SeguimientoModalResult>();

  // ============ SEÑALES ============
  readonly submitError = signal<string | null>(null);
  readonly intentoEnvio = signal(false);
  readonly diagnosticoSeleccionado = signal<any>(null);
  readonly condicionSignal = signal<FichaCondicionFinal>('SEGUIMIENTO');

  // ============ DATOS CONSTANTES ============
  readonly condicionOpciones = FICHA_CONDICION_CLINICA_OPCIONES.filter(opcion =>
    opcion.value === 'ALTA' || opcion.value === 'SEGUIMIENTO' || opcion.value === 'TRANSFERENCIA'
  );
  readonly planFrecuenciaOpciones = FICHA_PLAN_FRECUENCIAS;
  readonly planTipoSesionOpciones = FICHA_PLAN_TIPOS_SESION;

  // ============ FORMULARIO ============
  readonly form = this.fb.group({
    condicion: this.fb.nonNullable.control<FichaCondicionFinal>('SEGUIMIENTO', { validators: [Validators.required] }),
    observaciones: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.minLength(5), Validators.maxLength(4000)] }),
    diagnosticoId: this.fb.control<string | null>(null),
    planFrecuencia: this.fb.control<FichaPlanFrecuencia | null>(null),
    planTipoSesion: this.fb.control<FichaPlanTipoSesion | null>(null),
    planDetalle: this.fb.control<string | null>(null, { validators: [Validators.maxLength(2000)] }),
    proximoSeguimiento: this.fb.control<string | null>(null),
    transferenciaUnidad: this.fb.control<string | null>(null, { validators: [Validators.maxLength(500)] }),
    transferenciaObservacion: this.fb.control<string | null>(null, { validators: [Validators.maxLength(2000)] })
  });

  // ============ COMPUTED PROPERTIES ============
  readonly condicionSeleccionada = computed(() => this.condicionSignal());
  readonly requiereDiagnostico = computed(() => 
    this.condicionSeleccionada() === 'SEGUIMIENTO' || this.condicionSeleccionada() === 'TRANSFERENCIA'
  );
  readonly diagnosticoRequerido = computed(() => this.requiereDiagnostico());
  readonly mostrarPlan = computed(() => this.condicionSeleccionada() === 'SEGUIMIENTO');
  readonly mostrarTransferencia = computed(() => this.condicionSeleccionada() === 'TRANSFERENCIA');
  readonly requiereProximo = computed(() => (this.form.controls.planFrecuencia.value ?? null) === 'PERSONALIZADA');

  readonly titulo = computed(() => 'Asignar Condición y Diagnóstico');

  // ============ CONSTRUCTOR Y SETUP ============
  constructor() {
    // Suscripción a cambios de condición
    this.form.controls.condicion.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      const condicion = (value as FichaCondicionFinal | null) ?? 'SEGUIMIENTO';
      this.condicionSignal.set(condicion);
      
      if (condicion !== 'SEGUIMIENTO') {
        this.form.controls.planFrecuencia.setValue(null, { emitEvent: false });
        this.form.controls.planTipoSesion.setValue(null, { emitEvent: false });
        this.form.controls.planDetalle.setValue(null, { emitEvent: false });
        this.form.controls.proximoSeguimiento.setValue(null, { emitEvent: false });
      }
      
      if (condicion !== 'TRANSFERENCIA') {
        this.form.controls.transferenciaUnidad.setValue(null, { emitEvent: false });
        this.form.controls.transferenciaObservacion.setValue(null, { emitEvent: false });
      }
      
      if (condicion === 'ALTA') {
        this.limpiarDiagnostico();
      }
      
      this.cdr.markForCheck();
    });

    // Suscripción a cambios de frecuencia
    this.form.controls.planFrecuencia.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.requiereProximo()) {
        this.form.controls.proximoSeguimiento.setValue(null, { emitEvent: false });
      }
    });

    // Efecto para resetear al abrir
    effect(() => {
      if (this.visible()) {
        this.resetForm();
        this.verificarDatos();
      }
    });
  }

  // ============ MÉTODOS PÚBLICOS ============
  seleccionarCondicion(condicion: FichaCondicionFinal) {
    this.submitError.set(null);
    this.condicionSignal.set(condicion);
    this.form.controls.condicion.setValue(condicion);
    this.cdr.markForCheck();
  }

  onCie10Selection(item: CatalogoCIE10DTO | null) {
    if (!item) {
      this.diagnosticoSeleccionado.set(null);
      return;
    }
    this.diagnosticoSeleccionado.set(this.toDiagnosticoSnapshot(item));
  }

  limpiarDiagnostico() {
    this.form.controls.diagnosticoId.reset(null);
    this.diagnosticoSeleccionado.set(null);
  }

  handleCancel() {
    if (this.guardando()) return;
    this.cancel.emit();
  }

  async handleSubmit(event?: Event) {
    if (event) event.preventDefault();
    
    this.intentoEnvio.set(true);
    this.submitError.set(null);
    this.form.markAllAsTouched();

    // 1. Validación de IDs
    const fichaId = this.fichaId();
    const personalMilitarId = this.personalMilitarId();
    
    console.log('[MODAL] Validando IDs:', { fichaId, personalMilitarId });
    
    if (!fichaId || !personalMilitarId) {
      this.submitError.set(`
        ❌ Faltan datos esenciales:
        ${!fichaId ? '• ID de ficha no disponible' : ''}
        ${!personalMilitarId ? '• ID de personal no disponible' : ''}
        
        Por favor, guarda la ficha completa antes de asignar condiciones.
      `);
      return;
    }

    // 2. Validación del formulario
    if (this.form.invalid) {
      this.submitError.set('Revisa la información del seguimiento.');
      return;
    }

    // 3. Validación específica por condición
    if (this.requiereDiagnostico() && !this.diagnosticoSeleccionado()?.id) {
      this.submitError.set('Selecciona un diagnóstico válido del catálogo CIE-10.');
      return;
    }

    if (this.mostrarPlan()) {
      if (!this.planFrecuenciaValida()) {
        this.submitError.set('Indica la frecuencia del plan de seguimiento.');
        return;
      }
      if (!this.planTipoSesionValido()) {
        this.submitError.set('Selecciona el tipo de sesión planificada.');
        return;
      }
      if (this.requiereProximo() && !this.proximoValido()) {
        this.submitError.set('Ingresa la fecha del próximo seguimiento.');
        return;
      }
    }

    if (this.mostrarTransferencia()) {
      if (!this.transferenciaUnidadValida()) {
        this.submitError.set('Registra la unidad de destino para la transferencia.');
        return;
      }
      if (!this.transferenciaObservacionValida()) {
        this.submitError.set('Describe las observaciones de la transferencia.');
        return;
      }
    }

    // 4. Construir payload SOLO si la condición es válida y seleccionada
    const condicion = this.condicionSeleccionada();
    if (!condicion || !['ALTA', 'SEGUIMIENTO', 'TRANSFERENCIA'].includes(condicion)) {
      this.submitError.set('Debes seleccionar una condición válida.');
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      this.submitError.set('Error al construir los datos para enviar.');
      return;
    }

    // 5. Enviar al backend
    try {
      const token = this.authService.getToken?.() || localStorage.getItem('access_token') || '';
      const endpoint = `http://localhost:8082/gestion/api/fichas-psicologicas/${fichaId}/condicion`;
      
      console.log('[MODAL] Enviando a:', endpoint);
      console.log('[MODAL] Payload:', payload);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = 'No se pudo asignar la condición';
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.message) errorMsg = errorJson.message;
          else if (typeof errorJson === 'string') errorMsg = errorJson;
        } catch {
          const errorText = await response.text();
          if (errorText) errorMsg = errorText;
        }
        console.error('[MODAL] Error en respuesta:', errorMsg);
        this.submitError.set(`Error: ${errorMsg}`);
        return;
      }

      // 6. Éxito - emitir resultado
      console.log('[MODAL] Condición asignada exitosamente');
      this.submit.emit({
        success: true,
        condicion: this.condicionSeleccionada(),
        diagnostico: this.diagnosticoSeleccionado(),
        plan: this.mostrarPlan() ? {
          frecuencia: this.form.controls.planFrecuencia.value,
          tipoSesion: this.form.controls.planTipoSesion.value,
          detalle: this.form.controls.planDetalle.value,
          proximoSeguimiento: this.form.controls.proximoSeguimiento.value
        } : null,
        transferencia: this.mostrarTransferencia() ? {
          unidad: this.form.controls.transferenciaUnidad.value,
          observacion: this.form.controls.transferenciaObservacion.value
        } : null
      });
    } catch (err: any) {
      console.error('[MODAL] Error en fetch:', err);
      this.submitError.set(`Error de red: ${err?.message || 'No se pudo conectar con el servidor'}`);
    }
  }

  // ============ MÉTODOS PRIVADOS ============
  private resetForm() {
    this.intentoEnvio.set(false);
    this.submitError.set(null);
    
    this.form.reset({
      condicion: 'SEGUIMIENTO',
      observaciones: '',
      diagnosticoId: null,
      planFrecuencia: null,
      planTipoSesion: null,
      planDetalle: null,
      proximoSeguimiento: null,
      transferenciaUnidad: null,
      transferenciaObservacion: null
    });
    
    this.condicionSignal.set('SEGUIMIENTO');
    this.diagnosticoSeleccionado.set(null);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private verificarDatos() {
    const fichaId = this.fichaId();
    const personalMilitarId = this.personalMilitarId();
    
    if (!fichaId || !personalMilitarId) {
      console.error('[MODAL] Error: Faltan datos:', { fichaId, personalMilitarId });
      this.submitError.set('Error: No se recibieron los datos necesarios. Cierra y vuelve a intentar.');
    }
  }

  private buildPayload(): any {
    if (this.condicionSeleccionada() === 'ALTA') {
      return {
        condicion: 'Alta',
        diagnosticoCie10Codigo: null,
        diagnosticoCie10Nombre: null,
        diagnosticoCie10CategoriaPadre: null,
        diagnosticoCie10Nivel: null,
        diagnosticoCie10Descripcion: null,
        planFrecuencia: null,
        planTipoSesion: null,
        planDetalle: null,
        proximoSeguimiento: null,
        transferenciaUnidad: null,
        transferenciaObservacion: null
      };
    }
    
    if (this.condicionSeleccionada() === 'SEGUIMIENTO') {
      return {
        condicion: 'Seguimiento',
        diagnosticoCie10Id: this.diagnosticoSeleccionado()?.id,
        diagnosticoCie10Codigo: this.diagnosticoSeleccionado()?.codigo,
        diagnosticoCie10Nombre: this.diagnosticoSeleccionado()?.nombre,
        diagnosticoCie10CategoriaPadre: this.diagnosticoSeleccionado()?.categoriaPadre,
        diagnosticoCie10Nivel: this.diagnosticoSeleccionado()?.nivel,
        diagnosticoCie10Descripcion: this.diagnosticoSeleccionado()?.descripcion,
        planFrecuencia: this.form.controls.planFrecuencia.value,
        planTipoSesion: this.form.controls.planTipoSesion.value,
        planDetalle: this.form.controls.planDetalle.value,
        proximoSeguimiento: this.form.controls.proximoSeguimiento.value,
        transferenciaUnidad: null,
        transferenciaObservacion: null
      };
    }
    
    if (this.condicionSeleccionada() === 'TRANSFERENCIA') {
      return {
        condicion: 'Transferencia',
        diagnosticoCie10Id: this.diagnosticoSeleccionado()?.id,
        diagnosticoCie10Codigo: this.diagnosticoSeleccionado()?.codigo,
        diagnosticoCie10Nombre: this.diagnosticoSeleccionado()?.nombre,
        diagnosticoCie10CategoriaPadre: this.diagnosticoSeleccionado()?.categoriaPadre,
        diagnosticoCie10Nivel: this.diagnosticoSeleccionado()?.nivel,
        diagnosticoCie10Descripcion: this.diagnosticoSeleccionado()?.descripcion,
        planFrecuencia: null,
        planTipoSesion: null,
        planDetalle: null,
        proximoSeguimiento: null,
        transferenciaUnidad: this.form.controls.transferenciaUnidad.value,
        transferenciaObservacion: this.form.controls.transferenciaObservacion.value
      };
    }
    
    return null;
  }

  private toDiagnosticoSnapshot(item: CatalogoCIE10DTO): any {
    return {
      id: item.id ?? null,
      codigo: item.codigo ?? null,
      nombre: item.nombre ?? null,
      descripcion: item.descripcion ?? null,
      categoriaPadre: item.categoriaPadre ?? null,
      nivel: item.nivel ?? null
    };
  }

  private redirectToHistorial(personalMilitarId: number) {
    // Opcional: Redirigir al historial después de éxito
    setTimeout(() => {
      window.location.href = `/psicologo/personal/${personalMilitarId}/historial`;
    }, 1000);
  }

  // ============ VALIDACIONES ESPECÍFICAS ============
  planFrecuenciaValida(): boolean {
    const value = this.form.controls.planFrecuencia.value;
    return value !== null && value !== undefined && String(value).trim().length > 0;
  }

  planTipoSesionValido(): boolean {
    const value = this.form.controls.planTipoSesion.value;
    return value !== null && value !== undefined && String(value).trim().length > 0;
  }

  proximoValido(): boolean {
    const value = this.form.controls.proximoSeguimiento.value;
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed.length) return false;
      return /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
    }
    return false;
  }

  transferenciaUnidadValida(): boolean {
    const value = this.form.controls.transferenciaUnidad.value;
    return typeof value === 'string' && value.trim().length > 2;
  }

  transferenciaObservacionValida(): boolean {
    const value = this.form.controls.transferenciaObservacion.value;
    return typeof value === 'string' && value.trim().length > 5;
  }
}