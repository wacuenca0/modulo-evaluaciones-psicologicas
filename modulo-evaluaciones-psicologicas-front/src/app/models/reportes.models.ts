export interface ReporteAtencionPsicologoDTO {
  psicologoId: number;
  psicologoNombre: string;
  psicologoUsername: string;
  totalFichas: number;
  fichasActivas: number;
  fichasObservacion: number;
  totalSeguimientos: number;
  personasAtendidas: number;
  ultimaAtencion: string | null;
}

export interface ReporteAtencionesFilters {
  psicologoId?: number | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  diagnosticoId?: number | null;
  cedula?: string | null;
  unidadMilitar?: string | null;
}

export interface ReporteAtencionesAppliedFilters {
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  diagnosticoId?: number | null;
  cedula?: string | null;
  unidadMilitar?: string | null;
  psicologoId?: number | null;
}

export interface ReporteAtencionesTotales {
  fichas: number;
  activas: number;
  observacion: number;
  seguimientos: number;
  personas: number;
}

export interface ReporteAtencionesResponse {
  resultados: ReporteAtencionPsicologoDTO[];
  totales: ReporteAtencionesTotales;
  filtros: ReporteAtencionesAppliedFilters;
}

export interface ReportePersonalDiagnosticosFilters {
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  diagnosticoId?: number | null;
  cedula?: string | null;
  grado?: string | null;
  unidadMilitar?: string | null;
}

export interface ReportePersonalDiagnosticoDTO {
  fichaId?: number | null;
  numeroEvaluacion?: string | null;
  fechaEvaluacion?: string | null;
  personalId?: number | null;
  personalCedula?: string | null;
  personalNombre?: string | null;
  personalNombreCompleto?: string | null;
  personalGrado?: string | null;
  personalTipo?: string | null;
  personalUnidadMilitar?: string | null;
  diagnosticoCodigo?: string | null;
  diagnosticoDescripcion?: string | null;
  psicologoId?: number | null;
  psicologoNombre?: string | null;
  psicologoUnidadMilitar?: string | null;
  estadoFicha?: string | null;
}

export interface ReportePersonalDiagnosticosResponse {
  resultados: ReportePersonalDiagnosticoDTO[];
  filtros: ReportePersonalDiagnosticosFilters;
}

export interface ReporteHistorialFichasFilters {
  personalMilitarId?: number | null;
  cedula?: string | null;
  incluirSeguimientos?: boolean | null;
}

export interface ReporteHistorialSeguimientoDTO {
  seguimientoId?: number | null;
  fecha?: string | null;
  descripcion?: string | null;
  registradoPor?: string | null;
}

export interface ReporteHistorialFichaDTO {
  fichaId?: number | null;
  numeroEvaluacion?: string | null;
  fechaEvaluacion?: string | null;
  condicionClinica?: string | null;
  estado?: string | null;
  diagnosticoCodigo?: string | null;
  diagnosticoDescripcion?: string | null;
  origen?: string | null;
  totalSeguimientos?: number | null;
  seguimientos?: ReporteHistorialSeguimientoDTO[] | null;
}

export interface ReporteHistorialFichasResponse {
  resultados: ReporteHistorialFichaDTO[];
  filtros: ReporteHistorialFichasFilters;
}

export interface ReporteCondicionSeguimientoFilters {
  psicologoId?: number | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  cedula?: string | null;
  unidadMilitar?: string | null;
}

export interface ReporteCondicionSeguimientoDTO {
  fichaId?: number | null;
  numeroEvaluacion?: string | null;
  personalId?: number | null;
  personalCedula?: string | null;
  personalNombre?: string | null;
  personalGrado?: string | null;
  personalUnidadMilitar?: string | null;
  condicion?: string | null;
  psicologoId?: number | null;
  psicologoNombre?: string | null;
  psicologoUnidadMilitar?: string | null;
  totalSeguimientos?: number | null;
  fechaEvaluacion?: string | null;
  ultimaFechaSeguimiento?: string | null;
}

export interface ReporteCondicionSeguimientoResponse {
  resultados: ReporteCondicionSeguimientoDTO[];
  filtros: ReporteCondicionSeguimientoFilters;
}
