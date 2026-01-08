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
  diagnosticoCodigo?: string | null;
  unidadMilitar?: string | null;
}
