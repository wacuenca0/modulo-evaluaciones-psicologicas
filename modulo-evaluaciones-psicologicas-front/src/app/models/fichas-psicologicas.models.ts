import type { PersonalMilitarDTO } from './personal-militar.models';

export interface FichaPsicologicaHistorialDTO {
  id?: number;
  fechaEvaluacion?: string;
  estado?: string;
  condicion?: string;
  psicologo?: string;
  tipoEvaluacion?: string;
  numeroEvaluacion?: string;
  personalMilitarId?: number | null;
  personalMilitar?: PersonalMilitarDTO | null;
  seccionObservacion?: FichaObservacionClinicaDTO;
  seccionPsicoanamnesis?: FichaPsicoanamnesisDTO;
  seccionCondicionClinica?: FichaCondicionClinicaDTO;
  seccionPrenatal?: FichaPsicoanamnesisPrenatalDTO;
  seccionNatal?: FichaPsicoanamnesisNatalDTO;
  seccionInfancia?: FichaPsicoanamnesisInfanciaDTO;
  diagnosticoCie10Codigo?: string | null;
  diagnosticoCie10Descripcion?: string | null;
  planFrecuencia?: string | null;
  planTipoSesion?: string | null;
  planDetalle?: string | null;
}

export interface FichaPsicologicaCreacionInicialDTO {
  personalMilitarId: number;
  tipoEvaluacion: string;
  estado: string;
  fechaEvaluacion?: string;
}

export interface FichaObservacionClinicaDTO {
  observacionClinica?: string;
  motivoConsulta?: string;
  enfermedadActual?: string;
}

export interface FichaObservacionClinicaPayload {
  observacionClinica: string;
  motivoConsulta: string;
  enfermedadActual?: string;
}

export interface FichaPsicoanamnesisDTO {
  prenatal?: FichaPsicoanamnesisPrenatalDTO;
  natal?: FichaPsicoanamnesisNatalDTO;
  infancia?: FichaPsicoanamnesisInfanciaDTO;
}

export interface FichaPsicoanamnesisPrenatalDTO {
  condicionesBiologicasPadres?: string | null;
  condicionesPsicologicasPadres?: string | null;
  observacionPrenatal?: string | null;
}

export interface FichaPsicoanamnesisNatalDTO {
  partoNormal?: boolean | null;
  terminoParto?: string | null;
  complicacionesParto?: string | null;
  observacionNatal?: string | null;
}

export interface FichaPsicoanamnesisInfanciaDTO {
  gradoSociabilidad?: string | null;
  relacionPadresHermanos?: string | null;
  discapacidadIntelectual?: boolean | null;
  gradoDiscapacidad?: string | null;
  trastornos?: string | null;
  tratamientosPsicologicosPsiquiatricos?: boolean | null;
  observacionInfancia?: string | null;
}

export interface FichaPsicoanamnesisPayload {
  prenatal?: FichaPsicoanamnesisPrenatalPayload;
  natal?: FichaPsicoanamnesisNatalPayload;
  infancia?: FichaPsicoanamnesisInfanciaPayload;
}

export interface FichaPsicoanamnesisPrenatalPayload {
  condicionesBiologicasPadres?: string | null;
  condicionesPsicologicasPadres?: string | null;
  observacionPrenatal?: string | null;
}

export interface FichaPsicoanamnesisNatalPayload {
  partoNormal?: boolean | null;
  terminoParto?: string | null;
  complicacionesParto?: string | null;
  observacionNatal?: string | null;
}

export interface FichaPsicoanamnesisInfanciaPayload {
  gradoSociabilidad?: string | null;
  relacionPadresHermanos?: string | null;
  discapacidadIntelectual?: boolean | null;
  gradoDiscapacidad?: string | null;
  trastornos?: string | null;
  tratamientosPsicologicosPsiquiatricos?: boolean | null;
  observacionInfancia?: string | null;
}

export interface FichaCondicionClinicaDTO {
  condicion?: string | null;
  diagnosticoCie10Codigo?: string | null;
  diagnosticoCie10Descripcion?: string | null;
  planFrecuencia?: string | null;
  planTipoSesion?: string | null;
  planDetalle?: string | null;
}

export interface FichaCondicionClinicaPayload {
  condicion: string;
  diagnosticoCie10Codigo?: string | null;
  diagnosticoCie10Descripcion?: string | null;
  planFrecuencia?: string | null;
  planTipoSesion?: string | null;
  planDetalle?: string | null;
}

export const FICHA_TIPOS_EVALUACION_CANONICOS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Valoracion porte armas', label: 'Valoración porte armas' },
  { value: 'Evaluacion anual', label: 'Evaluación anual' },
  { value: 'Ingreso', label: 'Ingreso' },
  { value: 'Reintegro', label: 'Reintegro' },
  { value: 'Evaluacion especial', label: 'Evaluación especial' },
  { value: 'Otro', label: 'Otros' }
];

export const FICHA_CONDICIONES_CANONICAS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'APTO', label: 'Apto' },
  { value: 'NO_APTO', label: 'No apto' },
  { value: 'SEGUIMIENTO', label: 'Seguimiento' },
  { value: 'DERIVACION', label: 'Derivacion' }
];

export const FICHA_ESTADOS_CANONICOS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'ABIERTA', label: 'Abierta' },
  { value: 'CERRADA', label: 'Cerrada' },
  { value: 'EN_PROCESO', label: 'En proceso' }
];

export const PSICOANAMNESIS_GRADOS_SOCIABILIDAD: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Introvertido', label: 'Introvertido' },
  { value: 'Introvertido', label: 'Introvertida' },
  { value: 'Reservado', label: 'Reservado' },
  { value: 'Reservado', label: 'Reservada' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Comunicativo', label: 'Comunicativo' },
  { value: 'Comunicativo', label: 'Comunicativa' },
  { value: 'Extrovertido', label: 'Extrovertido' },
  { value: 'Extrovertido', label: 'Extrovertida' },
  { value: 'Otro', label: 'Otro' }
];

export const PSICOANAMNESIS_RELACION_FAMILIAR: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Asertiva', label: 'Asertiva' },
  { value: 'Asertiva', label: 'Asertivo' },
  { value: 'Conflictiva', label: 'Conflictiva' },
  { value: 'Distante', label: 'Distante' },
  { value: 'Sobreprotectora', label: 'Sobreprotectora' },
  { value: 'Sobreprotectora', label: 'Sobreprotector' },
  { value: 'Inexistente', label: 'Inexistente' },
  { value: 'Otro', label: 'Otro' }
];

export const PSICOANAMNESIS_GRADOS_DISCAPACIDAD: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'Ninguna', label: 'Sin discapacidad' },
  { value: 'Leve', label: 'Leve' },
  { value: 'Moderado', label: 'Moderado' },
  { value: 'Moderado', label: 'Moderada' },
  { value: 'Grave', label: 'Grave' },
  { value: 'Grave', label: 'Graves' },
  { value: 'Profundo', label: 'Profundo' },
  { value: 'Profundo', label: 'Profunda' }
];

export type FichaCondicionFinal = 'ALTA' | 'SEGUIMIENTO' | 'TRANSFERENCIA';

export const FICHA_CONDICION_CLINICA_OPCIONES: ReadonlyArray<{ value: FichaCondicionFinal; label: string; description: string }> = [
  {
    value: 'ALTA',
    label: 'No presenta psicopatologia (Alta)',
    description: 'Cierra la evaluacion sin requerir diagnostico adicional.'
  },
  {
    value: 'SEGUIMIENTO',
    label: 'Seguimiento',
    description: 'Continua bajo observacion con diagnostico CIE-10 registrado.'
  },
  {
    value: 'TRANSFERENCIA',
    label: 'Transferencia',
    description: 'Deriva el caso a otra unidad registrando el diagnostico CIE-10.'
  }
];

export interface FichaCondicionFinalPayload {
  condicion: FichaCondicionFinal;
  cie10Codigo?: string;
  cie10Descripcion?: string;
}

export const FICHA_PLAN_FRECUENCIAS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Semanal', label: 'Semanal' },
  { value: 'Quincenal', label: 'Quincenal' },
  { value: 'Mensual', label: 'Mensual' },
  { value: 'Bimestral', label: 'Bimestral' },
  { value: 'Trimestral', label: 'Trimestral' },
  { value: 'Personalizada', label: 'Personalizada' }
];

export const FICHA_PLAN_TIPOS_SESION: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Grupal', label: 'Grupal' },
  { value: 'Mixta', label: 'Mixta' },
  { value: 'Familiar', label: 'Familiar' }
];

export const FICHA_CONDICION_FINAL_OPCIONES: ReadonlyArray<{ value: FichaCondicionFinal; label: string; description: string }> = FICHA_CONDICION_CLINICA_OPCIONES;
