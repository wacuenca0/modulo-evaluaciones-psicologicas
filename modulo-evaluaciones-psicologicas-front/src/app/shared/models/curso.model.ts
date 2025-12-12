export interface InstructorRef {
  id: number;
  nombre: string;
}

export interface Curso {
  id: number;
  titulo: string;
  descripcion?: string;
  duracion_horas: number;
  fecha_inicio: string; // ISO date
  fecha_fin?: string; // ISO date
  instructores: InstructorRef[];
  cupos: number;
  // Nuevo: participantes (IDs de pacientes) y psicólogo asignado
  participantes?: number[]; // array de paciente.id
  psicologoId?: number; // id del psicólogo responsable
  // Campos militares Ecuador (opcionales)
  codigo?: string; // Código interno del curso (p.ej. FAE-OF-INT-2025)
  unidadMilitar?: string; // Unidad responsable (p.ej. "Escuela de Iwias", "ESMIL")
  ramaFuerza?: 'Ejército' | 'Fuerza Aérea' | 'Armada' | 'Conjunto' | 'Policía';
  objetivo?: string; // Objetivo táctico / formativo
  requisitosFisicos?: string; // Condición física mínima / pruebas
  ubicacion?: string; // Ciudad / Base / Fuerte
  modalidad?: 'Presencial' | 'Virtual' | 'Mixta';
  perfilIngreso?: string; // Perfil del militar que ingresa
}

export interface Psicologo {
  id: number;
  nombre: string;
  especialidad?: string;
  username?: string; // para mapear al usuario autenticado en demo
}

export interface InterviewSession {
  id: string; // unique
  courseId: number;
  pacienteId: number;
  formKey: string; // identificador del formulario (e.g. 'datos-identificacion')
  estado: 'abierta' | 'cerrada';
  data: any; // datos capturados (hard-coded en memoria)
  startedAt: string;
  closedAt?: string;
  psicologoId?: number;
}
