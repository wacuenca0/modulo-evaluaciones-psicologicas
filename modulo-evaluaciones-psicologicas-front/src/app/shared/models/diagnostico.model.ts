export interface CIE10Code {
  code: string;
  description: string;
  category?: string;
}

export type CondicionFinal = 'Apto' | 'No representa psicopatología' | 'Seguimiento' | 'Transferencia' | 'No Apto';

export interface FollowUp {
  id: string;
  courseId: number;
  pacienteId: number;
  condicion: CondicionFinal;
  notas?: string;
  proximoControl?: string; // ISO date
  estado: 'abierto' | 'cerrado';
  createdAt: string;
  closedAt?: string;
}