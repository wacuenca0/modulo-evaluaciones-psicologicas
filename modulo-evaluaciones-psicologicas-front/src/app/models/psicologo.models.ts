import { PageRequest } from './pagination.models';

export type EstadoPsicologo = 'ACTIVO' | 'INACTIVO';

export interface PsicologoDTO {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  especialidad?: string;
  numeroRegistro?: string;
  telefono?: string;
  correoInstitucional?: string;
  estado: EstadoPsicologo;
  fechaIngreso?: string;
  observaciones?: string;
}

export interface PsicologoFilter extends PageRequest {
  cedula?: string;
  nombres?: string;
  estado?: EstadoPsicologo;
  especialidad?: string;
}

export interface PsicologoPayload {
  cedula: string;
  nombres: string;
  apellidos: string;
  especialidad?: string;
  numeroRegistro?: string;
  telefono?: string;
  correoInstitucional?: string;
  estado?: EstadoPsicologo;
  fechaIngreso?: string;
  observaciones?: string;
}
