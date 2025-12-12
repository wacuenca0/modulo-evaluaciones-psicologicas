import { Injectable, signal } from '@angular/core';
import { of, Observable } from 'rxjs';
import { Paciente } from '../../shared/models/paciente.model';
import { Curso, Psicologo, InterviewSession } from '../../shared/models/curso.model';
import { CIE10Code, FollowUp } from '../../shared/models/diagnostico.model';

export interface InterviewMeta {
  mountId?: string;
  id: number;
  titulo: string;
  estado: 'abierta' | 'cerrada';
  pacienteId?: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly pacientesSignal = signal<Paciente[]>([
    { id: 1, nombre: 'Ana', apellido: 'Pérez', cedula: '1101234567', fecha_nacimiento: '1990-05-06', sexo: 'F', telefono: '+593991234567', email: 'ana.perez@example.com', direccion: 'Quito - Centro Histórico', estado: 'activo', notas: 'Paciente remitida por colegio.' },
    { id: 2, nombre: 'Luis', apellido: 'García', cedula: '1102234567', fecha_nacimiento: '1985-03-11', sexo: 'M', estado: 'activo' },
    { id: 3, nombre: 'María', apellido: 'Lozano', cedula: '1103234567', fecha_nacimiento: '1992-08-21', sexo: 'F', estado: 'activo' },
    { id: 4, nombre: 'Pedro', apellido: 'Suárez', cedula: '1104234567', fecha_nacimiento: '1979-12-02', sexo: 'M', estado: 'inactivo' },
    { id: 5, nombre: 'Lucía', apellido: 'Rojas', cedula: '1105234567', fecha_nacimiento: '1998-07-19', sexo: 'F', estado: 'activo' },
    { id: 6, nombre: 'Jorge', apellido: 'Vera', cedula: '1106234567', fecha_nacimiento: '1994-09-09', sexo: 'M', estado: 'activo' },
    { id: 7, nombre: 'Elena', apellido: 'Salas', cedula: '1107234567', fecha_nacimiento: '1991-01-30', sexo: 'F', estado: 'activo' },
    { id: 8, nombre: 'Carlos', apellido: 'Mora', cedula: '1108234567', fecha_nacimiento: '1988-04-14', sexo: 'M', estado: 'activo' },
  ]);

  private readonly cursosSignal = signal<Curso[]>([
    {
      id: 201,
      titulo: 'Formación Básica de Combatientes 2025',
      descripcion: 'Entrenamiento integral inicial para personal de tropa.',
      duracion_horas: 320,
      fecha_inicio: '2025-02-15',
      fecha_fin: '2025-08-30',
      instructores: [{ id: 2, nombre: 'Cap. López' }, { id: 5, nombre: 'Tte. Silva' }],
      cupos: 120,
      participantes: [1,2,3,4,5,6],
      psicologoId: 101,
      codigo: 'EJC-FBC-2025',
      unidadMilitar: 'Escuela de Formación de Soldados',
      ramaFuerza: 'Ejército',
      objetivo: 'Desarrollar capacidades físicas y psicológicas básicas para operaciones terrestres.',
      requisitosFisicos: 'Pruebas Cooper, flexiones, resistencia 8km con equipo.',
      ubicacion: 'Cayambe',
      modalidad: 'Presencial',
      perfilIngreso: 'Reclutas recién incorporados'
    },
    {
      id: 202,
      titulo: 'Manejo de Estrés Operacional',
      descripcion: 'Programa de intervención breve en estrés táctico.',
      duracion_horas: 48,
      fecha_inicio: '2025-04-10',
      fecha_fin: '2025-06-01',
      instructores: [{ id: 3, nombre: 'Tte. Rivas' }],
      cupos: 45,
      participantes: [2,4,7,8],
      psicologoId: 101,
      codigo: 'CONJ-SEO-2025',
      unidadMilitar: 'Comando Conjunto (Depto. Salud Mental)',
      ramaFuerza: 'Conjunto',
      objetivo: 'Optimizar estrategias de afrontamiento en escenarios de alta demanda.',
      requisitosFisicos: 'Apto médico vigente.',
      ubicacion: 'Quito',
      modalidad: 'Mixta',
      perfilIngreso: 'Personal con ≥1 despliegue operativo'
    },
    {
      id: 203,
      titulo: 'Evaluación Grupo de Reconocimiento',
      descripcion: 'Perfil psicológico y resiliencia de unidad de reconocimiento.',
      duracion_horas: 32,
      fecha_inicio: '2025-05-05',
      fecha_fin: '2025-07-15',
      instructores: [{ id: 4, nombre: 'Sgto. Núñez' }],
      cupos: 30,
      participantes: [1,3,5],
      psicologoId: 102,
      codigo: 'EJC-EREC-2025',
      unidadMilitar: 'Brigada de Reconocimiento Andino',
      ramaFuerza: 'Ejército',
      objetivo: 'Identificar fortalezas y factores de riesgo para operaciones prolongadas.',
      requisitosFisicos: 'Resistencia 12km, escalada básica.',
      ubicacion: 'Latacunga',
      modalidad: 'Presencial',
      perfilIngreso: 'Integrantes activos del grupo'
    }
  ]);

  private readonly psicologosSignal = signal<Psicologo[]>([
    { id: 101, nombre: 'Dra. Ana Pérez', especialidad: 'Evaluación Clínica Militar', username: 'psico' },
    { id: 102, nombre: 'Psic. Martín Vicky', especialidad: 'Intervención en Crisis', username: 'martin' },
    { id: 103, nombre: 'Psic. Carla Jaramillo', especialidad: 'Resiliencia Operacional' },
    { id: 104, nombre: 'Psic. Diego Salazar', especialidad: 'Neuropsicología aplicada' }
  ]);

  private readonly interviewSessionsSignal = signal<InterviewSession[]>([
    {
      id: 'S-DEMO-201-1', courseId: 201, pacienteId: 1, psicologoId: 101,
      formKey: 'editor', estado: 'abierta', startedAt: new Date(Date.now()-1000*60*60*5).toISOString(),
      data: {
        completas: {
          'datos-identificacion': true,
          'familiograma': true,
          'resultados-baterias': false,
          'anamnesis': true
        },
        diagnosticoFinal: null
      }
    },
    {
      id: 'S-DEMO-201-2', courseId: 201, pacienteId: 2, psicologoId: 101,
      formKey: 'editor', estado: 'cerrada', startedAt: new Date(Date.now()-1000*60*60*24).toISOString(), closedAt: new Date(Date.now()-1000*60*60*2).toISOString(),
      data: {
        completas: {
          'datos-identificacion': true,
          'familiograma': true,
          'resultados-baterias': true,
          'anamnesis': true,
          'historia-vital': true,
          'habitos-vida': true,
          'recursos-afrontamiento': true,
          'redes-apoyo-social': true,
          'relaciones-sociales': true,
          'situacion-laboral': true,
          'situacion-economica': true,
          'situacion-legal': true,
          'funciones-mentales-superiores': true,
          'diagnostico-inicial': true
        },
        diagnosticoFinal: {
          condicion: 'Seguimiento',
          cie10: 'F41.1',
          cieDescripcion: 'Trastorno de ansiedad generalizada',
          notas: 'Ansiedad sostenida, buena red primaria; recomendar intervención breve y reevaluación en 30 días.',
          timestamp: new Date(Date.now()-1000*60*60*2).toISOString()
        }
      }
    },
    {
      id: 'S-DEMO-202-4', courseId: 202, pacienteId: 4, psicologoId: 101,
      formKey: 'editor', estado: 'cerrada', startedAt: new Date(Date.now()-1000*60*60*30).toISOString(), closedAt: new Date(Date.now()-1000*60*60*4).toISOString(),
      data: {
        completas: {
          'datos-identificacion': true,
          'familiograma': true,
          'anamnesis': true,
          'historia-vital': true,
          'habitos-vida': true,
          'recursos-afrontamiento': true,
          'redes-apoyo-social': true,
          'situacion-laboral': true,
          'situacion-economica': true,
          'situacion-legal': true,
          'funciones-mentales-superiores': true,
          'diagnostico-inicial': true
        },
        diagnosticoFinal: {
          condicion: 'Transferencia',
          cie10: 'F32.0',
          cieDescripcion: 'Episodio depresivo leve',
          notas: 'Remitir a unidad de salud mental para psicoterapia breve; factores protectores presentes.',
          timestamp: new Date(Date.now()-1000*60*60*4).toISOString()
        }
      }
    }
  ]);

  private readonly entrevistasMetaSignal = signal<InterviewMeta[]>([
    { id: 301, titulo: 'Entrevista Inicial Ana', estado: 'abierta', pacienteId: 1 },
    { id: 302, titulo: 'Seguimiento Luis', estado: 'abierta', pacienteId: 2 },
    { id: 303, titulo: 'Cierre María', estado: 'cerrada', pacienteId: 3 },
  ]);

  // Catálogo CIE-10 (muestra mínima)
  private readonly cie10Signal = signal<CIE10Code[]>([
    { code: 'F32.0', description: 'Episodio depresivo leve', category: 'Trastornos del estado de ánimo' },
    { code: 'F41.1', description: 'Trastorno de ansiedad generalizada', category: 'Trastornos de ansiedad' },
    { code: 'F40.1', description: 'Fobia social', category: 'Trastornos de ansiedad' },
    { code: 'Z73.0', description: 'Burnout/agotamiento', category: 'Factores que influyen en el estado de salud' }
  ]);

  // Seguimientos
  private readonly followUpsSignal = signal<FollowUp[]>([
    {
      id: 'FU-DEMO-201-2', courseId: 201, pacienteId: 2,
      condicion: 'Seguimiento', notas: 'Reevaluar síntomas de ansiedad en 30 días.',
      proximoControl: new Date(Date.now()+1000*60*60*24*30).toISOString().slice(0,10),
      estado: 'abierto', createdAt: new Date(Date.now()-1000*60*60*2).toISOString()
    },
    {
      id: 'FU-DEMO-202-4', courseId: 202, pacienteId: 4,
      condicion: 'Transferencia', notas: 'Derivado a unidad especializada. Confirmar primera cita.',
      proximoControl: new Date(Date.now()+1000*60*60*24*10).toISOString().slice(0,10),
      estado: 'abierto', createdAt: new Date(Date.now()-1000*60*60*4).toISOString()
    }
  ]);

  // PACIENTES
  getPacientes(): Observable<Paciente[]> { return of(this.pacientesSignal()); }
  getPacienteById(id: number): Observable<Paciente | undefined> { return of(this.pacientesSignal().find(p => p.id === id)); }
  createPaciente(payload: Omit<Paciente, 'id'>): Observable<Paciente> {
    const nextId = Math.max(...this.pacientesSignal().map(p => p.id)) + 1;
    const created: Paciente = { ...payload, id: nextId };
    this.pacientesSignal.update(list => [...list, created]);
    return of(created);
  }
  updatePaciente(id: number, payload: Partial<Paciente>): Observable<Paciente | undefined> {
    let updated: Paciente | undefined;
    this.pacientesSignal.update(list => list.map(p => {
      if (p.id === id) { updated = { ...p, ...payload }; return updated; }
      return p;
    }));
    return of(updated);
  }
  deletePaciente(id: number): Observable<void> {
    this.pacientesSignal.update(list => list.filter(p => p.id !== id));
    return of(void 0);
  }

  // CURSOS
  getCursos(): Observable<Curso[]> { return of(this.cursosSignal()); }
  getCursosByPsicologo(psicologoId: number): Observable<Curso[]> { return of(this.cursosSignal().filter(c => c.psicologoId === psicologoId)); }
  getCurso(id: number): Observable<Curso | undefined> { return of(this.cursosSignal().find(c => c.id === id)); }
  getPsicologos(): Observable<Psicologo[]> { return of(this.psicologosSignal()); }
  getInterviewSessions(): Observable<InterviewSession[]> { return of(this.interviewSessionsSignal()); }
  getInterviewSessionsByCourse(courseId: number): Observable<InterviewSession[]> { return of(this.interviewSessionsSignal().filter(s => s.courseId === courseId)); }
  getInterviewSessionsByCourseAndPaciente(courseId: number, pacienteId: number): Observable<InterviewSession[]> {
    return of(this.interviewSessionsSignal().filter(s => s.courseId === courseId && s.pacienteId === pacienteId));
  }
  createInterviewSession(courseId: number, pacienteId: number, formKey: string, psicologoId?: number): Observable<InterviewSession> {
    const session: InterviewSession = {
      id: 'S-' + Date.now() + '-' + Math.random().toString(36).slice(2,6),
      courseId,
      pacienteId,
      formKey,
      estado: 'abierta',
      data: {},
      startedAt: new Date().toISOString(),
      psicologoId
    };
    this.interviewSessionsSignal.update(list => [...list, session]);
    return of(session);
  }
  updateInterviewSession(id: string, patch: Partial<InterviewSession>): Observable<InterviewSession | undefined> {
    let updated: InterviewSession | undefined;
    this.interviewSessionsSignal.update(list => list.map(s => {
      if (s.id === id) { updated = { ...s, ...patch }; return updated; }
      return s;
    }));
    return of(updated);
  }
  deleteInterviewSession(id: string): Observable<void> {
    this.interviewSessionsSignal.update(list => list.filter(s => s.id !== id));
    return of(void 0);
  }
  createCurso(payload: Omit<Curso, 'id'>): Observable<Curso> {
    const nextId = Math.max(...this.cursosSignal().map(c => c.id)) + 1;
    const created: Curso = { ...payload, id: nextId };
    this.cursosSignal.update(list => [...list, created]);
    return of(created);
  }
  updateCurso(id: number, payload: Partial<Curso>): Observable<Curso | undefined> {
    let updated: Curso | undefined;
    this.cursosSignal.update(list => list.map(c => {
      if (c.id === id) { updated = { ...c, ...payload }; return updated; }
      return c;
    }));
    return of(updated);
  }
  deleteCurso(id: number): Observable<void> {
    this.cursosSignal.update(list => list.filter(c => c.id !== id));
    return of(void 0);
  }

  assignParticipanteToCurso(courseId: number, pacienteId: number): Observable<Curso | undefined> {
    let updated: Curso | undefined;
    this.cursosSignal.update(list => list.map(c => {
      if (c.id === courseId) {
        const participantes = Array.from(new Set([...(c.participantes || []), pacienteId]));
        updated = { ...c, participantes };
        return updated;
      }
      return c;
    }));
    return of(updated);
  }
  assignPsicologoToCurso(courseId: number, psicologoId: number): Observable<Curso | undefined> {
    let updated: Curso | undefined;
    this.cursosSignal.update(list => list.map(c => {
      if (c.id === courseId) { updated = { ...c, psicologoId }; return updated; }
      return c;
    }));
    return of(updated);
  }
  // PSICÓLOGOS CRUD
  addPsicologo(payload: Omit<Psicologo,'id'>): Observable<Psicologo> {
    const nextId = Math.max(...this.psicologosSignal().map(p => p.id)) + 1;
    const created: Psicologo = { ...payload, id: nextId };
    this.psicologosSignal.update(list => [...list, created]);
    return of(created);
  }
  deletePsicologo(id: number): Observable<void> {
    this.psicologosSignal.update(list => list.filter(p => p.id !== id));
    return of(void 0);
  }

  // ENTREVISTAS META
  getEntrevistasMeta(): Observable<InterviewMeta[]> { return of(this.entrevistasMetaSignal()); }
  mountInterviewMeta(meta: InterviewMeta): Observable<InterviewMeta> {
    const nextId = Math.max(...this.entrevistasMetaSignal().map(e => e.id)) + 1;
    const created: InterviewMeta = { ...meta, id: nextId };
    this.entrevistasMetaSignal.update(list => [...list, created]);
    return of(created);
  }
  deleteInterviewMeta(id: number): Observable<void> {
    this.entrevistasMetaSignal.update(list => list.filter(e => e.id !== id));
    return of(void 0);
  }

  // CIE-10
  getCIE10(): Observable<CIE10Code[]> { return of(this.cie10Signal()); }
  addCIE10(code: CIE10Code): Observable<CIE10Code> {
    const exists = this.cie10Signal().some(c => c.code === code.code);
    if (!exists) {
      this.cie10Signal.update(list => [...list, code]);
    }
    return of(code);
  }
  deleteCIE10(codeRef: string): Observable<void> {
    this.cie10Signal.update(list => list.filter(c => c.code !== codeRef));
    return of(void 0);
  }

  // Seguimientos
  getFollowUps(courseId: number, pacienteId: number): Observable<FollowUp[]> {
    return of(this.followUpsSignal().filter(f => f.courseId===courseId && f.pacienteId===pacienteId));
  }
  createFollowUp(courseId: number, pacienteId: number, condicion: FollowUp['condicion'], notas?: string, proximoControl?: string): Observable<FollowUp> {
    const f: FollowUp = {
      id: 'FU-' + Date.now() + '-' + Math.random().toString(36).slice(2,6),
      courseId, pacienteId, condicion, notas, proximoControl,
      estado: 'abierto', createdAt: new Date().toISOString()
    };
    this.followUpsSignal.update(l => [...l, f]);
    return of(f);
  }
  closeFollowUp(id: string): Observable<FollowUp | undefined> {
    let updated: FollowUp | undefined;
    this.followUpsSignal.update(l => l.map(x => {
      if (x.id===id) { updated = { ...x, estado: 'cerrado', closedAt: new Date().toISOString() }; return updated; }
      return x;
    }));
    return of(updated);
  }
}
