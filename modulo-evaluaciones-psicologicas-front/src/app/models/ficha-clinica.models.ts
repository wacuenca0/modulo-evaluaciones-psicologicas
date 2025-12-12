import { PageRequest } from './pagination.models';
import { PersonalMilitarDTO } from './personal-militar.models';
import { PsicologoDTO } from './psicologo.models';

export type EstadoFicha = 'ABIERTA' | 'EN_PROCESO' | 'CERRADA';

export interface DiagnosticoDTO {
  cie10Codigo: string;
  descripcion: string;
  tipo: 'PRINCIPAL' | 'SECUNDARIO';
}

export interface CondicionDTO {
  id: string;
  descripcion: string;
}

export interface FichaClinicaDTO {
  id: string;
  codigo: string;
  estado: EstadoFicha;
  personal: PersonalMilitarDTO;
  psicologo?: PsicologoDTO;
  fechaApertura: string;
  fechaCierre?: string;
  motivoConsulta?: string;
  anamnesis?: string;
  antecedentesFamiliares?: string;
  antecedentesPersonales?: string;
  evaluacionMental?: string;
  pruebasAplicadas?: string;
  diagnosticos?: DiagnosticoDTO[];
  condiciones?: CondicionDTO[];
  observaciones?: string;
}

export interface FichaClinicaFilter extends PageRequest {
  estado?: EstadoFicha;
  psicologoId?: string;
  personalId?: string;
  codigo?: string;
}

export interface FichaClinicaPayload {
  personalId: string;
  psicologoId?: string;
  motivoConsulta?: string;
  anamnesis?: string;
  antecedentesFamiliares?: string;
  antecedentesPersonales?: string;
  evaluacionMental?: string;
  pruebasAplicadas?: string;
  diagnosticos?: DiagnosticoDTO[];
  condiciones?: string[];
  observaciones?: string;
}
