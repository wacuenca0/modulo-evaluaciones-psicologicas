export interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  fecha_nacimiento: string; // ISO date
  sexo: 'M' | 'F' | 'O';
  telefono?: string;
  email?: string;
  direccion?: string;
  estado: 'activo' | 'inactivo';
  notas?: string;
}
