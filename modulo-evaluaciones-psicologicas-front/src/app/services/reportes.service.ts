import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/config/api.config';
import { ReporteAtencionPsicologoDTO, ReporteAtencionesFilters } from '../models/reportes.models';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = buildApiUrl('gestion', '/reportes/atenciones-psicologos');

  obtenerAtencionesPorPsicologos(filters: ReporteAtencionesFilters): Observable<ReporteAtencionPsicologoDTO[]> {
    let params = new HttpParams();

    if (typeof filters.psicologoId === 'number' && Number.isFinite(filters.psicologoId)) {
      params = params.set('psicologoId', String(filters.psicologoId));
    }

    const fechaDesde = this.normalizeDate(filters.fechaDesde);
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }

    const fechaHasta = this.normalizeDate(filters.fechaHasta);
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }

    const diagnosticoCodigo = this.normalizeString(filters.diagnosticoCodigo)?.toUpperCase();
    if (diagnosticoCodigo) {
      params = params.set('diagnosticoCodigo', diagnosticoCodigo);
    }

    const unidadMilitar = this.normalizeString(filters.unidadMilitar);
    if (unidadMilitar) {
      params = params.set('unidadMilitar', unidadMilitar);
    }

    return this.http.get<ReporteAtencionPsicologoDTO[]>(this.endpoint, { params });
  }

  private normalizeString(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private normalizeDate(value: string | null | undefined): string | null {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return null;
    }
    return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : normalized.slice(0, 10);
  }
}
