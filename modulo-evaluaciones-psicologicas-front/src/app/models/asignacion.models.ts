import { PageRequest } from './pagination.models';
import { PersonalMilitarDTO } from './personal-militar.models';
import { PsicologoDTO } from './psicologo.models';

export type EstadoAsignacion = 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADA' | 'ANULADA';

export interface AsignacionDTO {
  id: string;
  fichaId?: string;
  personal: PersonalMilitarDTO;
  psicologo: PsicologoDTO;
  estado: EstadoAsignacion;
  fechaAsignacion: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  observaciones?: string;
}

export interface AsignacionFilter extends PageRequest {
  psicologoId?: string;
  personalId?: string;
  estado?: EstadoAsignacion;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface AsignacionPayload {
  personalId: string;
  psicologoId: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  observaciones?: string;
}
