import { PageRequest } from './pagination.models';

export type EstadoSeguimiento = 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO';

export interface SeguimientoDTO {
  id: string;
  fichaId: string;
  fecha: string;
  profesionalId: string;
  observaciones?: string;
  recomendaciones?: string;
  proximaCita?: string;
  estado: EstadoSeguimiento;
}

export interface SeguimientoPayload {
  fichaId: string;
  observaciones?: string;
  recomendaciones?: string;
  proximaCita?: string;
  estado?: EstadoSeguimiento;
}

export interface SeguimientoFilter extends PageRequest {
  fichaId?: string;
  psicologoId?: string;
  estado?: EstadoSeguimiento;
  fechaDesde?: string;
  fechaHasta?: string;
}
