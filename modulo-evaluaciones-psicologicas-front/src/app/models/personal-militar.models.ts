import { PageRequest } from './pagination.models';

export type EstadoPersonal = 'ACTIVO' | 'INACTIVO';
export type SituacionMilitar = 'ACTIVO' | 'PASIVO';

export interface PersonalMilitarDTO {
  id: string;
  cedula: string;
  nup?: string;
  grado: string;
  arma?: string;
  unidad?: string;
  dependencia?: string;
  profesion?: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correoInstitucional?: string;
  situacion?: SituacionMilitar;
  estado: EstadoPersonal;
  fechaNacimiento?: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  observaciones?: string;
  fechaRegistro?: string;
  fechaActualizacion?: string;
}

export interface PersonalMilitarFilter extends PageRequest {
  cedula?: string;
  nup?: string;
  nombres?: string;
  grado?: string;
  unidad?: string;
  situacion?: SituacionMilitar;
  estado?: EstadoPersonal;
}

export interface PersonalMilitarPayload {
  cedula: string;
  nup?: string;
  grado: string;
  arma?: string;
  unidad?: string;
  dependencia?: string;
  profesion?: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  correoInstitucional?: string;
  situacion?: SituacionMilitar;
  estado?: EstadoPersonal;
  fechaNacimiento?: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  observaciones?: string;
}
