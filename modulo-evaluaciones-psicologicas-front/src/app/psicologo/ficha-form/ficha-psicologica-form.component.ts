import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FichasPsicologicasService } from '../../services/fichas-psicologicas.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PersonalMilitarDTO } from '../../models/personal-militar.models';
import {
  FICHA_ESTADOS_CANONICOS,
  FICHA_TIPOS_EVALUACION_CANONICOS,
  PSICOANAMNESIS_GRADOS_SOCIABILIDAD,
  PSICOANAMNESIS_RELACION_FAMILIAR,
  PSICOANAMNESIS_GRADOS_DISCAPACIDAD,
  FichaPsicologicaHistorialDTO,
  FichaPsicologicaCreacionInicialDTO,
  FichaPsicoanamnesisPayload,
  FichaPsicoanamnesisDTO
} from '../../models/fichas-psicologicas.models';
import { SeguimientoModalComponent } from './seguimiento-modal.component';

type ObservacionClinicaFormValue = {
  observacionClinica: string;
  motivoConsulta: string;
  enfermedadActual?: string;
  historiaPasadaEnfermedad?: {
    descripcion?: string;
    tomaMedicacion?: boolean | null;
    tipoMedicacion?: string;
    hospitalizacionRehabilitacion?: {
      requiere?: boolean | null;
      tipo?: string;
      duracion?: string;
    };
  };
};

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

type StepId = 'generales' | 'observacion' | 'psicoanamnesis' | 'documentos';

@Component({
  selector: 'app-ficha-psicologica-form',
  templateUrl: './ficha-psicologica-form.component.html',
  styleUrls: ['./ficha-psicologica-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SeguimientoModalComponent],
})
export class FichaPsicologicaFormComponent implements OnInit {
  
  // ============ SERVICIOS ============
  private readonly service = inject(FichasPsicologicasService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  // ============ SEÑALES DE ESTADO ============
  readonly currentStep = signal<StepId>('generales');
  readonly navigationMessage = signal<string | null>(null);
  readonly numeroEvaluacion = signal<string | null>(null);
  readonly persona = signal<PersonalMilitarDTO | null>(null);
  readonly personalId = signal<number | null>(null);
  readonly fichaCreada = signal<FichaPsicologicaHistorialDTO | null>(null);
  readonly fichaDetallada = signal<FichaPsicologicaHistorialDTO | null>(null);
  readonly mostrarAsignarCondicionModal = signal(false);

  // ============ SEÑALES DE GUARDADO ============
  readonly generalesGuardado = signal(false);
  readonly observacionGuardado = signal(false);
  readonly psicoanamnesisGuardado = signal(false);
  readonly documentosActualizados = signal(false);

  // ============ SEÑALES DE LOADING ============
  readonly loadingGenerales = signal(false);
  readonly observacionLoading = signal(false);
  readonly psicoanamnesisLoading = signal(false);
  readonly resumenLoading = signal(false);
  readonly documentoSubiendo = signal(false);

  // ============ SEÑALES DE ERROR ============
  readonly generalesError = signal<string | null>(null);
  readonly observacionError = signal<string | null>(null);
  readonly psicoanamnesisError = signal<string | null>(null);
  readonly resumenError = signal<string | null>(null);
  readonly documentoFormularioError = signal<string | null>(null);

  // ============ SEÑALES DE UI CONDICIONAL ============
  readonly mostrarMedicacionDetalle = signal(false);
  readonly mostrarHospitalizacionDetalle = signal(false);
  readonly mostrarGradoDiscapacidad = signal(false);

  // ============ DOCUMENTOS ============
  readonly documentos = signal<readonly any[]>([]);
  readonly documentosLoading = signal(false);
  readonly documentosError = signal<string | null>(null);
  readonly documentosCargados = signal(false);
  readonly documentoEliminandoId = signal<number | null>(null);
  private readonly _documentoArchivo = signal<File | null>(null);

  // ============ VARIABLES DE ESTADO ============
  readonly estadosFicha: string[] = ['Abierta', 'Cerrada', 'Observación'];
  nuevoEstado: string = 'Abierta';
  cambiandoEstado = false;
  estadoActualizado = false;
  errorCambioEstado: string | null = null;

  // ============ DATOS CONSTANTES ============
  readonly steps: ReadonlyArray<{ id: StepId; label: string }> = [
    { id: 'generales', label: 'Datos generales' },
    { id: 'observacion', label: 'Observación clínica' },
    { id: 'psicoanamnesis', label: 'Psicoanamnesis' },
    { id: 'documentos', label: 'Documentos de respaldo' }
  ];
  private readonly stepSequence: ReadonlyArray<StepId> = this.steps.map(step => step.id);

  readonly estadosCanonicos = FICHA_ESTADOS_CANONICOS;
  readonly tiposCanonicos = FICHA_TIPOS_EVALUACION_CANONICOS;
  readonly sociabilidadOpciones = PSICOANAMNESIS_GRADOS_SOCIABILIDAD;
  readonly relacionFamiliarOpciones = PSICOANAMNESIS_RELACION_FAMILIAR;
  readonly gradosDiscapacidadOpciones = PSICOANAMNESIS_GRADOS_DISCAPACIDAD;

  // ============ FORMULARIOS ============
  readonly generalesForm = this.fb.group({
    fechaEvaluacion: [''],
    tipoEvaluacion: ['', Validators.required],
    estado: ['ABIERTA', Validators.required]
  });

  readonly observacionForm = this.fb.group({
    observacionClinica: ['', [Validators.required, Validators.maxLength(4000)]],
    motivoConsulta: ['', [Validators.required, Validators.maxLength(4000)]],
    enfermedadActual: ['', [Validators.maxLength(4000)]],
    historiaPasadaEnfermedad: this.fb.group({
      descripcion: ['', [Validators.maxLength(4000)]],
      tomaMedicacion: [null as boolean | null],
      tipoMedicacion: ['', [Validators.maxLength(2000)]],
      hospitalizacionRehabilitacion: this.fb.group({
        requiere: [null as boolean | null],
        tipo: ['', [Validators.maxLength(2000)]],
        duracion: ['', [Validators.maxLength(1000)]]
      })
    })
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

  readonly documentoForm = this.fb.group({
    archivo: this.fb.control<File | null>(null, { validators: [Validators.required] }),
    descripcion: this.fb.control('', [Validators.maxLength(500)])
  });

  // ============ COMPUTED PROPERTIES ============
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

  readonly documentoArchivo = (): File | null => this._documentoArchivo();
  readonly documentoArchivoNombre = computed(() => this.documentoArchivo()?.name ?? null);

  // ============ LIFECYCLE ============
  ngOnInit(): void {
    this.obtenerNumeroPreview();
    this.inicializarDatosPersona();
    this.setupObservacionConditionalValidation();
    this.setupPsicoanamnesisConditionalValidation();
  }

  private obtenerNumeroPreview(): void {
    this.service.obtenerNumeroPreview().subscribe({
      next: (resp: { numeroEvaluacion: string }) => {
        this.numeroEvaluacion.set(resp.numeroEvaluacion);
      },
      error: (err) => {
        console.warn('[WARN] No se pudo obtener el número de ficha preview:', err);
        this.numeroEvaluacion.set(null);
      }
    });
  }

  private inicializarDatosPersona(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { persona?: PersonalMilitarDTO } | undefined;
    const routeId = this.route.snapshot.paramMap.get('personalId');

    let persona: PersonalMilitarDTO | null = null;
    let idNum: number | null = null;

    if (state?.persona) {
      persona = { ...state.persona };
      if (routeId && !persona.id && Number.isFinite(Number(routeId))) {
        persona.id = Number(routeId);
      }
      this.persona.set(persona);
      if (persona.id) {
        this.personalId.set(persona.id);
      }
    } else if (routeId && Number.isFinite(Number(routeId))) {
      idNum = Number(routeId);
      this.personalId.set(idNum);
      persona = { id: idNum } as PersonalMilitarDTO;
      this.persona.set(persona);
    }

    if (!this.persona() || !this.personalId()) {
      this.navigationMessage.set('⚠️ Debes seleccionar a una persona desde el historial antes de registrar la ficha.');
    }
  }

  // ============ MÉTODOS DEL MODAL ============
  abrirAsignarCondicionModal() {
    const fichaId = this.fichaCreada()?.id;
    const personalId = this.personalId();
    
    console.log('[DEBUG] Abriendo modal con:', { fichaId, personalId });
    
    if (!fichaId || !personalId) {
      this.navigationMessage.set(`
        ⚠️ No se puede abrir el modal de condición porque:
        ${!fichaId ? '\n• La ficha no ha sido guardada' : ''}
        ${!personalId ? '\n• No hay una persona seleccionada' : ''}
        
        Por favor:
        1. Guarda la ficha primero (pestaña "Datos generales")
        2. Asegúrate de tener una persona seleccionada
        3. Completa las secciones obligatorias
      `);
      
      if (!fichaId) {
        this.currentStep.set('generales');
      }
      
      return;
    }
    
    this.mostrarAsignarCondicionModal.set(true);
  }

  cerrarAsignarCondicionModal() {
    this.mostrarAsignarCondicionModal.set(false);
  }

  onAsignarCondicionSubmit(result: any) {
    console.log('[DEBUG] Resultado del modal recibido:', result);
    this.cerrarAsignarCondicionModal();
    this.navigationMessage.set('✅ Condición asignada correctamente.');
    // Redirigir al historial de fichas después de éxito
    const personalId = this.personalId();
    if (personalId) {
      setTimeout(() => {
        this.router.navigate(['/psicologo/personal', personalId, 'historial']);
      }, 1200); // Espera breve para mostrar el mensaje
    }
  }

  // ============ NAVEGACIÓN ENTRE PASOS ============
  isStepActive(stepId: StepId): boolean {
    return this.currentStep() === stepId;
  }

  isStepCompleted(stepId: StepId): boolean {
    if (stepId === 'generales') return this.generalesGuardado();
    if (stepId === 'observacion') return this.observacionGuardado();
    if (stepId === 'psicoanamnesis') return this.psicoanamnesisGuardado();
    if (stepId === 'documentos') return this.documentosActualizados();
    return false;
  }

  canAccessStep(stepId: StepId): boolean {
    if (stepId === 'generales') return !this.generalesGuardado();
    if (['observacion', 'psicoanamnesis', 'documentos'].includes(stepId)) return !!this.fichaCreada();
    return false;
  }

  goToStep(stepId: StepId) {
    const current = this.currentStep();
    if (stepId === current) return;
    
    if (stepId === 'generales' && this.generalesGuardado()) return;
    
    if (['observacion', 'psicoanamnesis', 'documentos'].includes(stepId) && !!this.fichaCreada()) {
      this.navigationMessage.set(null);
      this.currentStep.set(stepId);
      return;
    }
    
    if (this.canAccessStep(stepId)) {
      this.navigationMessage.set(null);
      this.currentStep.set(stepId);
    }
  }

  goToPreviousStep(): void {
    const idx = this.stepSequence.indexOf(this.currentStep());
    if (idx > 0) {
      const target = this.stepSequence[idx - 1];
      if (target === 'generales' && this.generalesGuardado()) return;
      this.goToStep(target);
    }
  }

  goToNextStep(): void {
    const idx = this.stepSequence.indexOf(this.currentStep());
    if (idx < this.stepSequence.length - 1 && this.canGoToNextStep()) {
      const target = this.stepSequence[idx + 1];
      this.goToStep(target);
    }
  }

  canGoToNextStep(): boolean {
    const current = this.currentStep();
    if (current === 'generales') return this.generalesGuardado();
    if (current === 'observacion') return this.observacionGuardado();
    if (current === 'psicoanamnesis') return this.psicoanamnesisGuardado();
    return false;
  }

  getProgressPercentage(): number {
    let completed = 0;
    if (this.generalesGuardado()) completed++;
    if (this.observacionGuardado()) completed++;
    if (this.psicoanamnesisGuardado()) completed++;
    if (this.documentosActualizados()) completed++;
    return Math.round((completed / this.steps.length) * 100);
  }

  // ============ VALIDACIÓN CONDICIONAL ============
  private setupObservacionConditionalValidation() {
    const historiaGroup = this.observacionForm.get('historiaPasadaEnfermedad');
    const tomaMedicacionControl = historiaGroup?.get('tomaMedicacion');
    const tipoMedicacionControl = historiaGroup?.get('tipoMedicacion');
    const hospitalGroup = historiaGroup?.get('hospitalizacionRehabilitacion');
    const requiereControl = hospitalGroup?.get('requiere');
    const tipoControl = hospitalGroup?.get('tipo');
    const duracionControl = hospitalGroup?.get('duracion');

    const applyMedicacionRules = (value: boolean | null, reset = false) => {
      if (!tipoMedicacionControl) return;
      const validators = value === true
        ? [Validators.required, Validators.maxLength(2000)]
        : [Validators.maxLength(2000)];
      tipoMedicacionControl.setValidators(validators);
      tipoMedicacionControl.updateValueAndValidity({ emitEvent: false });
      this.mostrarMedicacionDetalle.set(value === true);
      if (reset) tipoMedicacionControl.setValue('', { emitEvent: false });
    };
    
    applyMedicacionRules(tomaMedicacionControl?.value ?? null, false);
    tomaMedicacionControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      applyMedicacionRules(value, value !== true);
    });

    const applyHospitalRules = (value: boolean | null, reset = false) => {
      if (!tipoControl || !duracionControl) return;
      const tipoValidators = value === true
        ? [Validators.required, Validators.maxLength(2000)]
        : [Validators.maxLength(2000)];
      const duracionValidators = value === true
        ? [Validators.required, Validators.maxLength(1000)]
        : [Validators.maxLength(1000)];
      tipoControl.setValidators(tipoValidators);
      duracionControl.setValidators(duracionValidators);
      tipoControl.updateValueAndValidity({ emitEvent: false });
      duracionControl.updateValueAndValidity({ emitEvent: false });
      this.mostrarHospitalizacionDetalle.set(value === true);
      if (reset) {
        tipoControl.setValue('', { emitEvent: false });
        duracionControl.setValue('', { emitEvent: false });
      }
    };
    
    applyHospitalRules(requiereControl?.value ?? null, false);
    requiereControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      applyHospitalRules(value, value !== true);
    });
  }

  private setupPsicoanamnesisConditionalValidation() {
    const infanciaGroup = this.psicoanamnesisForm.get('infancia');
    const discapacidadControl = infanciaGroup?.get('discapacidadIntelectual');
    const gradoControl = infanciaGroup?.get('gradoDiscapacidad');

    const applyDiscapacidadRules = (value: boolean | null, reset = false) => {
      if (!gradoControl) return;
      const validators = value === true ? [Validators.required] : [];
      gradoControl.setValidators(validators);
      gradoControl.updateValueAndValidity({ emitEvent: false });
      this.mostrarGradoDiscapacidad.set(value === true);
      if (reset) gradoControl.setValue('', { emitEvent: false });
    };
    
    applyDiscapacidadRules(discapacidadControl?.value ?? null, false);
    discapacidadControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      applyDiscapacidadRules(value, value !== true);
    });
  }

  // ============ MÉTODOS DE GUARDADO ============
  guardarDatosGenerales() {
    const payload = this.buildGeneralesPayload();
    if (!payload) return;
    
    this.loadingGenerales.set(true);
    this.generalesError.set(null);
    const token = this.authService.getToken();
    
    fetch('http://localhost:8080/api/fichas-psicologicas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        this.loadingGenerales.set(false);
        if (!res.ok) {
          const errorText = await res.text();
          this.generalesError.set(errorText || 'Error al registrar la ficha');
          return;
        }
        const data = await res.json();
        this.fichaCreada.set(data);
        this.generalesGuardado.set(true);
        
        // Establecer personalId si viene en la respuesta
        if (data.personalMilitarId) {
          this.personalId.set(data.personalMilitarId);
        }
        
        this.navigationMessage.set('✅ Ficha registrada correctamente. Ahora puedes continuar con las demás secciones.');
        this.currentStep.set('observacion');
      })
      .catch((err) => {
        this.loadingGenerales.set(false);
        this.generalesError.set(err?.message || 'Error de red');
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

    const fichaId = this.fichaCreada()?.id;
    if (!Number.isFinite(fichaId)) {
      this.observacionError.set('Genera primero la ficha para registrar la observacion clinica.');
      return;
    }

    const payload = this.buildObservacionPayload();
    if (!payload) return;

    this.observacionLoading.set(true);
    this.observacionGuardado.set(false);
    const token = this.authService.getToken();
    
    fetch(`http://localhost:8080/api/fichas-psicologicas/${fichaId}/observacion`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        this.observacionLoading.set(false);
        if (!res.ok) {
          const errorText = await res.text();
          this.observacionError.set(errorText || 'Error al guardar la observación clínica');
          return;
        }
        const data = await res.json();
        this.fichaCreada.set(data);
        this.syncObservacionFromFicha(data);
        this.observacionGuardado.set(true);
        this.currentStep.set('psicoanamnesis');
        this.navigationMessage.set('✅ Observación clínica guardada correctamente.');
      })
      .catch((err) => {
        this.observacionLoading.set(false);
        this.observacionError.set(err?.message || 'Error de red');
      });
  }

  guardarPsicoanamnesis() {
    this.psicoanamnesisForm.markAllAsTouched();
    this.psicoanamnesisError.set(null);
    this.navigationMessage.set(null);

    const fichaId = this.fichaCreada()?.id;
    if (!Number.isFinite(fichaId)) {
      this.psicoanamnesisError.set('Genera y registra las secciones anteriores antes de guardar la psicoanamnesis.');
      return;
    }

    const payload = this.buildPsicoanamnesisPayload();
    if (!payload) return;

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
        const fichaActualizada = res ?? this.fichaCreada() ?? null;
        this.fichaCreada.set(fichaActualizada);
        this.syncPsicoanamnesisFromFicha(fichaActualizada);
        this.psicoanamnesisGuardado.set(true);
        this.navigationMessage.set('✅ ¡Psicoanamnesis guardada correctamente!');
        
        this.currentStep.set('documentos');
        this.cargarDocumentos();
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

  // ============ MÉTODOS DE LIMPIEZA ============
  limpiarObservacion() {
    this.observacionForm.reset({
      observacionClinica: '',
      motivoConsulta: '',
      enfermedadActual: '',
      historiaPasadaEnfermedad: {
        descripcion: '',
        tomaMedicacion: null,
        tipoMedicacion: '',
        hospitalizacionRehabilitacion: {
          requiere: null,
          tipo: '',
          duracion: ''
        }
      }
    });
    this.observacionGuardado.set(false);
    this.observacionError.set(null);
    this.psicoanamnesisGuardado.set(false);
    this.updatePsicoanamnesisAccess();
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
  }

  // ============ CAMBIO DE ESTADO ============
  cambiarEstadoFicha(): void {
    const fichaId = this.fichaCreada()?.id;
    if (!fichaId) {
      this.errorCambioEstado = 'No hay ficha creada.';
      return;
    }
    
    if (!this.estadosFicha.includes(this.nuevoEstado)) {
      this.errorCambioEstado = 'Estado no permitido.';
      return;
    }
    
    this.cambiandoEstado = true;
    this.errorCambioEstado = null;
    
    this.service.cambiarEstadoFicha(fichaId, this.nuevoEstado).subscribe({
      next: () => {
        this.cambiandoEstado = false;
        this.estadoActualizado = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.estadoActualizado = false;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: () => {
        this.cambiandoEstado = false;
        this.errorCambioEstado = 'No se pudo actualizar el estado.';
        this.cdr.detectChanges();
      }
    });
  }

  // ============ MÉTODOS DE UTILIDAD ============
  generalesSuccess(): string | null {
    return this.generalesGuardado() ? '✅ Ficha registrada correctamente.' : null;
  }

  psicoanamnesisSuccess(): string | null {
    return this.psicoanamnesisGuardado() ? '✅ Psicoanamnesis guardada correctamente.' : null;
  }

  hasGeneralesError(controlName: string): boolean {
    const control = this.generalesForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  hasObservacionError(controlName: string): boolean {
    const control = this.observacionForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  hasPsicoanamnesisError(controlPath: string): boolean {
    const control = this.psicoanamnesisForm.get(controlPath);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  cerrarFormulario() {
    this.router.navigate(['/psicologo/personal']).catch(() => {
      this.navigationMessage.set('No fue posible cerrar el formulario.');
    });
  }

  // ============ MÉTODOS PRIVADOS ============
  private buildGeneralesPayload(): FichaPsicologicaCreacionInicialDTO | null {
    const personalId = this.personalId();
    if (!Number.isFinite(personalId)) {
      this.generalesError.set('No se puede registrar la ficha sin un personal asociado.');
      return null;
    }

    let psicologoId: number | null = null;
    try {
      const usuario = this.authService.getCurrentUser();
      if (usuario && Number.isFinite(usuario.id)) {
        psicologoId = Number(usuario.id);
      }
    } catch {}

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

    const payload: any = {
      personalMilitarId: Number(personalId),
      tipoEvaluacion: tipoParaApi,
      estado: estadoParaApi,
      fechaEvaluacion: this.cleanOptionalText(fechaEvaluacion)
    };
    
    if (psicologoId) {
      payload.psicologoId = psicologoId;
    }
    
    return payload;
  }

  private buildObservacionPayload(): any | null {
    const raw = this.observacionForm.getRawValue() as ObservacionClinicaFormValue;
    const observacion = this.cleanRequiredText(raw.observacionClinica);
    const motivo = this.cleanRequiredText(raw.motivoConsulta);
    
    if (!observacion || !motivo) {
      this.observacionError.set('Completa los campos obligatorios antes de continuar.');
      return null;
    }
    
    const payload: any = {
      observacion_clinica: observacion,
      motivo_consulta: motivo
    };

    const enfermedad = this.toNullableString(raw.enfermedadActual);
    if (enfermedad !== undefined) {
      payload.enfermedad_actual = enfermedad;
    }

    const historia = this.buildHistoriaPasadaPayload(raw.historiaPasadaEnfermedad);
    if (historia) {
      payload.historia_pasada_enfermedad = historia;
    }

    return payload;
  }

  private buildHistoriaPasadaPayload(
    data: ObservacionClinicaFormValue['historiaPasadaEnfermedad'] | undefined
  ): any | undefined {
    if (!data) {
      return undefined;
    }

    const payload: any = {};
    const descripcion = this.toNullableString(data.descripcion);
    if (descripcion !== undefined) {
      payload.descripcion = descripcion;
    }

    if (typeof data.tomaMedicacion === 'boolean') {
      payload.tomaMedicacion = data.tomaMedicacion;
    } else if (data.tomaMedicacion === null) {
      payload.tomaMedicacion = null;
    }

    if (data.tomaMedicacion === true) {
      const tipoMedicacion = this.toNullableString(data.tipoMedicacion);
      if (tipoMedicacion !== undefined && tipoMedicacion !== null) {
        payload.tipoMedicacion = tipoMedicacion;
      }
    }

    const hospitalizacion = this.buildHistoriaHospitalizacionPayload(data.hospitalizacionRehabilitacion);
    if (hospitalizacion && Object.keys(hospitalizacion).length > 0) {
      payload.hospitalizacionRehabilitacion = hospitalizacion;
    }

    return Object.keys(payload).length > 0 ? payload : undefined;
  }

  private buildHistoriaHospitalizacionPayload(
    data: {
      requiere?: boolean | null;
      tipo?: string;
      duracion?: string;
    } | undefined
  ): any | undefined {
    if (!data) {
      return undefined;
    }

    const payload: any = {};

    if ('requiere' in data && (typeof data.requiere === 'boolean' || data.requiere === null)) {
      payload.requiere = data.requiere;
    }

    if (data.requiere === true) {
      if ('tipo' in data) {
        const tipo = this.toNullableString(data.tipo);
        if (tipo !== undefined && tipo !== null) {
          payload.tipo = tipo;
        }
      }

      if ('duracion' in data) {
        const duracion = this.toNullableString(data.duracion);
        if (duracion !== undefined && duracion !== null) {
          payload.duracion = duracion;
        }
      }
    }

    return Object.keys(payload).length > 0 ? payload : undefined;
  }

  private buildPsicoanamnesisPayload(): any | null {
    const raw = this.psicoanamnesisForm.getRawValue() as PsicoanamnesisFormValue;
    
    const payload: any = {
      prenatal: {
        condiciones_biologicas_padres: raw.prenatal?.condicionesBiologicasPadres ?? '',
        condiciones_psicologicas_padres: raw.prenatal?.condicionesPsicologicasPadres ?? '',
        observacion_prenatal: raw.prenatal?.observacionPrenatal ?? ''
      },
      natal: {
        parto_normal: raw.natal?.partoNormal ?? false,
        termino_parto: raw.natal?.terminoParto ?? '',
        complicaciones_parto: raw.natal?.complicacionesParto ?? '',
        observacion_natal: raw.natal?.observacionNatal ?? ''
      },
      infancia: {
        grado_sociabilidad: raw.infancia?.gradoSociabilidad ?? '',
        relacion_padres_hermanos: raw.infancia?.relacionPadresHermanos ?? '',
        discapacidad_intelectual: raw.infancia?.discapacidadIntelectual ?? false,
        grado_discapacidad: raw.infancia?.gradoDiscapacidad ?? '',
        trastornos: raw.infancia?.trastornos ?? '',
        tratamientos_psicologicos_psiquiatricos: raw.infancia?.tratamientosPsicologicosPsiquiatricos ?? false,
        observacion_infancia: raw.infancia?.observacionInfancia ?? ''
      }
    };
    
    return payload;
  }

  private syncObservacionFromFicha(ficha: FichaPsicologicaHistorialDTO | null) {
    const seccion = ficha?.seccionObservacion;
    const historia = seccion?.historiaPasadaEnfermedad;
    const hospitalizacion = historia?.hospitalizacionRehabilitacion;
    
    const valores: ObservacionClinicaFormValue = {
      observacionClinica: seccion?.observacionClinica ?? '',
      motivoConsulta: seccion?.motivoConsulta ?? '',
      enfermedadActual: seccion?.enfermedadActual ?? '',
      historiaPasadaEnfermedad: {
        descripcion: historia?.descripcion ?? '',
        tomaMedicacion: this.toNullableBoolean(historia?.tomaMedicacion) ?? null,
        tipoMedicacion: historia?.tipoMedicacion ?? '',
        hospitalizacionRehabilitacion: {
          requiere: this.toNullableBoolean(hospitalizacion?.requiere) ?? null,
          tipo: hospitalizacion?.tipo ?? '',
          duracion: hospitalizacion?.duracion ?? ''
        }
      }
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
  }

  private syncGeneralesFromFicha(ficha: FichaPsicologicaHistorialDTO | null) {
    if (!ficha) return;

    const fecha = this.formatFechaEvaluacion(ficha.fechaEvaluacion);
    const tipo = this.resolveTipoEvaluacionValue(ficha.tipoEvaluacion);
    const estado = this.resolveEstadoValue(ficha.estado);

    this.generalesForm.patchValue({
      fechaEvaluacion: fecha,
      tipoEvaluacion: tipo,
      estado
    }, { emitEvent: false });
  }

  private updatePsicoanamnesisAccess() {
    if (this.fichaCreada() && this.observacionGuardado()) {
      this.psicoanamnesisForm.enable({ emitEvent: false });
    } else {
      this.psicoanamnesisForm.disable({ emitEvent: false });
    }
  }

  private cleanOptionalText(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private cleanRequiredText(value: unknown): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) return trimmed;
    }
    return '';
  }

  private toNullableString(value: unknown): string | null | undefined {
    if (value === null) return null;
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private toNullableBoolean(value: unknown): boolean | null | undefined {
    if (value === null) return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
      if (!value.trim().length) return null;
    }
    return undefined;
  }

  private normalizeSociabilidad(value: unknown): string | null | undefined {
    if (typeof value !== 'string' || !value.trim()) return null;
    const map: Record<string, string> = {
      'Introvertido': 'INTROVERTIDO',
      'Reservado': 'RESERVADO',
      'Neutral': 'NEUTRAL',
      'Comunicativo': 'COMUNICATIVO',
      'Extrovertido': 'EXTROVERTIDO',
      'Otro': 'OTRO',
      'Alta': 'ALTA',
      'Baja': 'BAJA',
    };
    return map[value] ?? value.toUpperCase();
  }

  private normalizeGradoDiscapacidad(value: unknown): string | null | undefined {
    if (typeof value !== 'string' || !value.trim()) return null;
    const map: Record<string, string> = {
      'Ninguna': 'NINGUNA',
      'Leve': 'LEVE',
      'Moderado': 'MODERADO',
      'Moderada': 'MODERADO',
      'Grave': 'GRAVE',
      'Graves': 'GRAVE',
      'Profundo': 'PROFUNDO',
      'Profunda': 'PROFUNDO',
    };
    return map[value] ?? value.toUpperCase();
  }

  private normalizeRelacionFamiliar(value: unknown): string | null | undefined {
    return undefined; // Implementar según necesidades
  }

  private sectionHasContent(section: unknown): boolean {
    if (!section || typeof section !== 'object') return false;
    return Object.values(section as Record<string, unknown>).some((value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'boolean') return true;
      return value !== null && value !== undefined;
    });
  }

  private formatFechaEvaluacion(value: unknown): string {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed.length) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  }

  private resolveTipoEvaluacionValue(value: unknown): string {
    if (typeof value !== 'string') return this.generalesForm.get('tipoEvaluacion')?.value ?? '';
    const trimmed = value.trim();
    if (!trimmed.length) return this.generalesForm.get('tipoEvaluacion')?.value ?? '';
    const match = this.tiposCanonicos.find(item => item.value === trimmed || item.label === trimmed);
    return match?.value ?? trimmed;
  }

  private resolveEstadoValue(value: unknown): string {
    if (typeof value !== 'string') return this.generalesForm.get('estado')?.value ?? 'ABIERTA';
    const trimmed = value.trim();
    if (!trimmed.length) return this.generalesForm.get('estado')?.value ?? 'ABIERTA';
    const match = this.estadosCanonicos.find(item => item.value === trimmed || item.label === trimmed);
    return match?.value ?? trimmed;
  }

  private extractPsicoanamnesis(ficha: FichaPsicologicaHistorialDTO | null): FichaPsicoanamnesisDTO | null {
    if (!ficha) return null;
    if (ficha.seccionPsicoanamnesis) return ficha.seccionPsicoanamnesis;

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
          this.syncGeneralesFromFicha(ficha);
          this.generalesGuardado.set(true);
          this.generalesForm.enable({ emitEvent: false });
          this.generalesForm.markAsPristine();
          this.generalesForm.markAsUntouched();
          this.syncObservacionFromFicha(ficha);
          this.syncPsicoanamnesisFromFicha(ficha);
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
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status?: number }).status;
      if (status === 400) return 'La informacion enviada es invalida. Revisa los campos obligatorios.';
      if (status === 403) return 'No cuentas con permisos para registrar fichas psicologicas.';
    }

    if (err && typeof err === 'object' && 'error' in err) {
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
    }

    if (err instanceof Error && err.message === 'Valor requerido para la ficha psicologica no proporcionado') {
      return 'Completa los datos obligatorios para continuar.';
    }

    return 'No fue posible registrar la ficha. Intenta nuevamente.';
  }

  private cargarDocumentos() {
    const fichaId = this.resolveFichaIdActual();
    if (!Number.isFinite(fichaId)) return;
    this.documentosCargados.set(true);
    // Implementar carga de documentos
  }

  private resolveFichaIdActual(): number | null {
    const ficha = this.fichaDetallada() ?? this.fichaCreada();
    if (ficha && typeof ficha.id === 'number' && Number.isFinite(ficha.id)) {
      return Number(ficha.id);
    }
    return null;
  }

  // ============ MÉTODOS DE DOCUMENTOS ============
  onDocumentoArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this._documentoArchivo.set(archivo);
    this.documentoForm.controls.archivo.setValue(archivo);
    this.documentoFormularioError.set(null);
  }

  subirDocumento() {
    this.documentoForm.markAllAsTouched();
    this.documentoFormularioError.set(null);

    if (this.documentoForm.invalid) {
      this.documentoFormularioError.set('Selecciona un archivo antes de continuar.');
      return;
    }

    const archivo = this.documentoArchivo();
    if (!archivo) {
      this.documentoFormularioError.set('No se ha seleccionado ningun archivo.');
      return;
    }

    this.documentoSubiendo.set(true);
    setTimeout(() => {
      this.documentoSubiendo.set(false);
      this.limpiarFormularioDocumento();
      this.navigationMessage.set('✅ Documento adjuntado correctamente.');
    }, 1000);
  }

  eliminarDocumento(doc: any) {
    if (!doc.id) return;
    this.documentoEliminandoId.set(doc.id);
    setTimeout(() => {
      this.documentoEliminandoId.set(null);
      this.navigationMessage.set('✅ Documento eliminado.');
    }, 1000);
  }

  limpiarFormularioDocumento() {
    this.documentoForm.reset();
    this._documentoArchivo.set(null);
    this.documentoFormularioError.set(null);
  }
}