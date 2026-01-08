export type Sexo = 'Masculino' | 'Femenino';

export interface PersonalMilitarDTO {
  id?: number;
  cedula: string;
  apellidosNombres?: string;
  nombres?: string;
  apellidos?: string;
  tipoPersona?: string;
  esMilitar?: boolean;
  fechaNacimiento?: string;
  edad?: number;
  sexo?: Sexo;
  etnia?: string;
  estadoCivil?: string;
  numeroHijos?: number;
  ocupacion?: string;
  servicioActivo?: boolean;
  servicioPasivo?: boolean;
  seguro?: string;
  grado?: string;
  especialidad?: string;
  provincia?: string;
  canton?: string;
  parroquia?: string;
  barrioSector?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // legacy fields still returned by algunas consultas
  unidad?: string;
  situacion?: string;
  cuerpo?: string;
  fechaIngreso?: string;
}

export interface PersonalMilitarPageDTO {
  content: PersonalMilitarDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty?: boolean;
}

export interface PersonalMilitarPayload {
  cedula: string;
  apellidosNombres: string;
  tipoPersona: string;
  esMilitar: boolean;
  fechaNacimiento?: string | null;
  edad?: number | null;
  sexo: Sexo;
  etnia?: string | null;
  estadoCivil?: string | null;
  numeroHijos?: number | null;
  ocupacion?: string | null;
  servicioActivo: boolean;
  servicioPasivo: boolean;
  seguro?: string | null;
  grado?: string | null;
  especialidad?: string | null;
  provincia?: string | null;
  canton?: string | null;
  parroquia?: string | null;
  barrioSector?: string | null;
  telefono?: string | null;
  celular?: string | null;
  email?: string | null;
  activo: boolean;
}
