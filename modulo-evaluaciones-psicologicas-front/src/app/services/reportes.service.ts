import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { buildApiUrl } from '../core/config/api.config';
import {
  ReporteAtencionPsicologoDTO,
  ReporteAtencionesAppliedFilters,
  ReporteAtencionesFilters,
  ReporteAtencionesResponse,
  ReporteAtencionesTotales,
  ReporteCondicionSeguimientoDTO,
  ReporteCondicionSeguimientoFilters,
  ReporteCondicionSeguimientoResponse,
  ReporteHistorialFichaDTO,
  ReporteHistorialFichasFilters,
  ReporteHistorialFichasResponse,
  ReportePersonalDiagnosticoDTO,
  ReportePersonalDiagnosticosFilters,
  ReportePersonalDiagnosticosResponse
} from '../models/reportes.models';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly reportesBase = buildApiUrl('gestion', '/reportes');

  obtenerAtencionesPorPsicologos(filters: ReporteAtencionesFilters): Observable<ReporteAtencionesResponse> {
    let params = this.createBaseParams(filters.fechaDesde, filters.fechaHasta);

    const psicologoId = this.normalizeId(filters.psicologoId);
    if (psicologoId !== null) {
      params = params.set('psicologoId', String(psicologoId));
    }

    const diagnosticoId = this.normalizeId(filters.diagnosticoId);
    if (diagnosticoId !== null) {
      params = params.set('diagnosticoId', String(diagnosticoId));
    }

    const cedula = this.normalizeString(filters.cedula);
    if (cedula) {
      params = params.set('cedula', cedula);
    }

    const unidadMilitar = this.normalizeString(filters.unidadMilitar);
    if (unidadMilitar) {
      params = params.set('unidadMilitar', unidadMilitar);
    }

    return this.http.get<unknown>(`${this.reportesBase}/atenciones-psicologos`, { params }).pipe(
      map(response => this.toReporteAtencionesResponse(response, filters))
    );
  }

  obtenerPersonalDiagnosticos(filters: ReportePersonalDiagnosticosFilters): Observable<ReportePersonalDiagnosticosResponse> {
    let params = this.createBaseParams(filters.fechaDesde, filters.fechaHasta);

    const diagnosticoId = this.normalizeId(filters.diagnosticoId);
    if (diagnosticoId !== null) {
      params = params.set('diagnosticoId', String(diagnosticoId));
    }

    const cedula = this.normalizeString(filters.cedula);
    if (cedula) {
      params = params.set('cedula', cedula);
    }

    const grado = this.normalizeString(filters.grado);
    if (grado) {
      params = params.set('grado', grado);
    }

    const unidadMilitar = this.normalizeString(filters.unidadMilitar);
    if (unidadMilitar) {
      params = params.set('unidadMilitar', unidadMilitar);
    }

    return this.http.get<unknown>(`${this.reportesBase}/personal-diagnosticos`, { params }).pipe(
      map(response => this.toReportePersonalDiagnosticosResponse(response, filters))
    );
  }

  obtenerHistorialFichas(filters: ReporteHistorialFichasFilters): Observable<ReporteHistorialFichasResponse> {
    const personalId = this.normalizeId(filters.personalMilitarId);
    const cedula = this.normalizeString(filters.cedula)?.toUpperCase() ?? null;

    if (personalId === null && !cedula) {
      return throwError(() => new Error('Proporciona un identificador o una cédula para consultar el historial.'));
    }

    let params = new HttpParams();
    if (personalId !== null) {
      params = params.set('personalMilitarId', String(personalId));
    }

    if (cedula) {
      params = params.set('cedula', cedula);
    }

    const incluirSeguimientos = this.normalizeBoolean(filters.incluirSeguimientos);
    if (incluirSeguimientos !== null) {
      params = params.set('incluirSeguimientos', incluirSeguimientos ? 'true' : 'false');
    }

    return this.http.get<unknown>(`${this.reportesBase}/historial-fichas`, { params }).pipe(
      map(response => this.toReporteHistorialFichasResponse(response, {
        personalMilitarId: personalId ?? undefined,
        cedula: cedula ?? undefined,
        incluirSeguimientos: incluirSeguimientos ?? undefined
      }))
    );
  }

  obtenerCondicionSeguimiento(filters: ReporteCondicionSeguimientoFilters): Observable<ReporteCondicionSeguimientoResponse> {
    let params = this.createBaseParams(filters.fechaDesde, filters.fechaHasta);

    const psicologoId = this.normalizeId(filters.psicologoId);
    if (psicologoId !== null) {
      params = params.set('psicologoId', String(psicologoId));
    }

    const cedula = this.normalizeString(filters.cedula)?.toUpperCase();
    if (cedula) {
      params = params.set('cedula', cedula);
    }

    const unidadMilitar = this.normalizeString(filters.unidadMilitar);
    if (unidadMilitar) {
      params = params.set('unidadMilitar', unidadMilitar);
    }

    return this.http.get<unknown>(`${this.reportesBase}/condicion-seguimiento`, { params }).pipe(
      map(response => this.toReporteCondicionSeguimientoResponse(response, filters))
    );
  }

  private createBaseParams(fechaDesde?: string | null, fechaHasta?: string | null): HttpParams {
    let params = new HttpParams();

    const normalizedDesde = this.normalizeDate(fechaDesde);
    if (normalizedDesde) {
      params = params.set('fechaDesde', normalizedDesde);
    }

    const normalizedHasta = this.normalizeDate(fechaHasta);
    if (normalizedHasta) {
      params = params.set('fechaHasta', normalizedHasta);
    }

    return params;
  }

  private toReporteAtencionesResponse(response: unknown, requestFilters: ReporteAtencionesFilters): ReporteAtencionesResponse {
    const resultados = this.extractCollection<ReporteAtencionPsicologoDTO>(response, ['resultados', 'datos', 'items', 'content', 'psicologos']);
    const totalesSource = this.extractObject(response, ['totales', 'resumen', 'totals', 'globales']);
    const totales = this.buildAtencionesTotales(resultados, totalesSource);
    const filtros = this.buildAtencionesFiltros(response, requestFilters);

    return { resultados, totales, filtros };
  }

  private toReportePersonalDiagnosticosResponse(response: unknown, requestFilters: ReportePersonalDiagnosticosFilters): ReportePersonalDiagnosticosResponse {
    const resultados = this.extractCollection<ReportePersonalDiagnosticoDTO>(response, ['resultados', 'datos', 'items', 'content', 'fichas']);
    const filtros = this.buildPersonalDiagnosticosFiltros(response, requestFilters);

    return { resultados, filtros };
  }

  private toReporteHistorialFichasResponse(response: unknown, requestFilters: ReporteHistorialFichasFilters): ReporteHistorialFichasResponse {
    const resultados = this.extractCollection<ReporteHistorialFichaDTO>(response, ['resultados', 'datos', 'items', 'content', 'fichas', 'historial']);
    const filtros = this.buildHistorialFiltros(response, requestFilters);
    return { resultados, filtros };
  }

  private toReporteCondicionSeguimientoResponse(response: unknown, requestFilters: ReporteCondicionSeguimientoFilters): ReporteCondicionSeguimientoResponse {
    const resultados = this.extractCollection<ReporteCondicionSeguimientoDTO>(response, ['resultados', 'datos', 'items', 'content', 'fichas']);
    const filtros = this.buildCondicionSeguimientoFiltros(response, requestFilters);
    return { resultados, filtros };
  }

  private buildAtencionesTotales(resultados: ReporteAtencionPsicologoDTO[], source: Record<string, unknown> | null): ReporteAtencionesTotales {
    const aggregated = resultados.reduce<ReporteAtencionesTotales>((acc, current) => ({
      fichas: acc.fichas + this.asNumber(current.totalFichas),
      activas: acc.activas + this.asNumber(current.fichasActivas),
      observacion: acc.observacion + this.asNumber(current.fichasObservacion),
      seguimientos: acc.seguimientos + this.asNumber(current.totalSeguimientos),
      personas: acc.personas + this.asNumber(current.personasAtendidas)
    }), { fichas: 0, activas: 0, observacion: 0, seguimientos: 0, personas: 0 });

    const sources = source ? [source] : [];

    return {
      fichas: this.resolveNumberValue(sources, ['fichas', 'totalFichas'], aggregated.fichas),
      activas: this.resolveNumberValue(sources, ['activas', 'fichasActivas'], aggregated.activas),
      observacion: this.resolveNumberValue(sources, ['observacion', 'fichasObservacion'], aggregated.observacion),
      seguimientos: this.resolveNumberValue(sources, ['seguimientos', 'totalSeguimientos'], aggregated.seguimientos),
      personas: this.resolveNumberValue(sources, ['personas', 'personasAtendidas', 'totalPersonas'], aggregated.personas)
    };
  }

  private buildAtencionesFiltros(response: unknown, request: ReporteAtencionesFilters): ReporteAtencionesAppliedFilters {
    const sources = this.collectFilterSources(response);

    const psicologoId = this.collectNumberValue(sources, ['psicologoId', 'filtroPsicologoId']);
    const fechaDesde = this.collectStringValue(sources, ['fechaDesde', 'filtroFechaDesde']);
    const fechaHasta = this.collectStringValue(sources, ['fechaHasta', 'filtroFechaHasta']);
    const diagnosticoId = this.collectNumberValue(sources, ['diagnosticoId', 'filtroDiagnosticoId']);
    const cedula = this.collectStringValue(sources, ['cedula', 'filtroCedula']);
    const unidadMilitar = this.collectStringValue(sources, ['unidadMilitar', 'filtroUnidadMilitar']);

    return {
      psicologoId: this.normalizeId(psicologoId) ?? this.normalizeId(request.psicologoId),
      fechaDesde: this.normalizeDate(fechaDesde) ?? this.normalizeDate(request.fechaDesde),
      fechaHasta: this.normalizeDate(fechaHasta) ?? this.normalizeDate(request.fechaHasta),
      diagnosticoId: this.normalizeId(diagnosticoId) ?? this.normalizeId(request.diagnosticoId),
      cedula: this.normalizeString(cedula) ?? this.normalizeString(request.cedula),
      unidadMilitar: this.normalizeString(unidadMilitar) ?? this.normalizeString(request.unidadMilitar)
    };
  }

  private buildPersonalDiagnosticosFiltros(response: unknown, request: ReportePersonalDiagnosticosFilters): ReportePersonalDiagnosticosFilters {
    const sources = this.collectFilterSources(response);

    return {
      fechaDesde: this.normalizeDate(this.collectStringValue(sources, ['fechaDesde', 'filtroFechaDesde'])) ?? this.normalizeDate(request.fechaDesde),
      fechaHasta: this.normalizeDate(this.collectStringValue(sources, ['fechaHasta', 'filtroFechaHasta'])) ?? this.normalizeDate(request.fechaHasta),
      diagnosticoId: this.normalizeId(this.collectNumberValue(sources, ['diagnosticoId', 'filtroDiagnosticoId'])) ?? this.normalizeId(request.diagnosticoId),
      cedula: this.normalizeString(this.collectStringValue(sources, ['cedula', 'filtroCedula'])) ?? this.normalizeString(request.cedula),
      grado: this.normalizeString(this.collectStringValue(sources, ['grado', 'filtroGrado'])) ?? this.normalizeString(request.grado),
      unidadMilitar: this.normalizeString(this.collectStringValue(sources, ['unidadMilitar', 'filtroUnidadMilitar'])) ?? this.normalizeString(request.unidadMilitar)
    };
  }

  private buildHistorialFiltros(response: unknown, request: ReporteHistorialFichasFilters): ReporteHistorialFichasFilters {
    const sources = this.collectFilterSources(response);
    const personalId = this.collectNumberValue(sources, ['personalMilitarId', 'filtroPersonalMilitarId']) ?? request.personalMilitarId ?? null;
    const incluirSeguimientos = this.collectBooleanValue(sources, ['incluirSeguimientos', 'filtroIncluirSeguimientos']);
    const cedula = this.collectStringValue(sources, ['cedula', 'filtroCedula']) ?? request.cedula ?? null;

    return {
      personalMilitarId: this.normalizeId(personalId),
      cedula: this.normalizeString(cedula),
      incluirSeguimientos: incluirSeguimientos ?? request.incluirSeguimientos ?? null
    };
  }

  private buildCondicionSeguimientoFiltros(response: unknown, request: ReporteCondicionSeguimientoFilters): ReporteCondicionSeguimientoFilters {
    const sources = this.collectFilterSources(response);

    return {
      psicologoId: this.normalizeId(this.collectNumberValue(sources, ['psicologoId', 'filtroPsicologoId'])) ?? this.normalizeId(request.psicologoId),
      fechaDesde: this.normalizeDate(this.collectStringValue(sources, ['fechaDesde', 'filtroFechaDesde'])) ?? this.normalizeDate(request.fechaDesde),
      fechaHasta: this.normalizeDate(this.collectStringValue(sources, ['fechaHasta', 'filtroFechaHasta'])) ?? this.normalizeDate(request.fechaHasta),
      cedula: this.normalizeString(this.collectStringValue(sources, ['cedula', 'filtroCedula'])) ?? this.normalizeString(request.cedula),
      unidadMilitar: this.normalizeString(this.collectStringValue(sources, ['unidadMilitar', 'filtroUnidadMilitar'])) ?? this.normalizeString(request.unidadMilitar)
    };
  }

  private extractCollection<T>(payload: unknown, preferredKeys: string[], depth = 0): T[] {
    if (Array.isArray(payload)) {
      return payload as T[];
    }
    if (!this.isObject(payload) || depth > 3) {
      return [];
    }
    const record = payload as Record<string, unknown>;
    for (const key of preferredKeys) {
      if (key in record) {
        const result = this.extractCollection<T>(record[key], preferredKeys, depth + 1);
        if (result.length) {
          return result;
        }
      }
    }
    for (const value of Object.values(record)) {
      const result = this.extractCollection<T>(value, preferredKeys, depth + 1);
      if (result.length) {
        return result;
      }
    }
    return [];
  }

  private extractObject(payload: unknown, keys: string[]): Record<string, unknown> | null {
    if (!this.isObject(payload)) {
      return null;
    }
    const record = payload as Record<string, unknown>;
    for (const key of keys) {
      const candidate = record[key];
      if (this.isObject(candidate)) {
        return candidate as Record<string, unknown>;
      }
    }
    return null;
  }

  private collectFilterSources(payload: unknown, depth = 0): Record<string, unknown>[] {
    if (!this.isObject(payload) || depth > 2) {
      return [];
    }
    const record = payload as Record<string, unknown>;
    const sources: Record<string, unknown>[] = [record];
    for (const value of Object.values(record)) {
      if (this.isObject(value)) {
        sources.push(...this.collectFilterSources(value, depth + 1));
      }
    }
    return sources;
  }

  private collectStringValue(sources: Record<string, unknown>[], keys: string[]): string | null {
    for (const key of keys) {
      for (const source of sources) {
        const value = source[key];
        if (typeof value === 'string' && value.trim().length) {
          return value;
        }
      }
    }
    return null;
  }

  private collectNumberValue(sources: Record<string, unknown>[], keys: string[]): number | null {
    for (const key of keys) {
      for (const source of sources) {
        const value = source[key];
        const parsed = this.parseNumber(value);
        if (parsed !== null) {
          return parsed;
        }
      }
    }
    return null;
  }

  private collectBooleanValue(sources: Record<string, unknown>[], keys: string[]): boolean | null {
    for (const key of keys) {
      for (const source of sources) {
        const value = source[key];
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          const normalized = value.trim().toLowerCase();
          if (normalized === 'true') {
            return true;
          }
          if (normalized === 'false') {
            return false;
          }
        }
        if (typeof value === 'number' && !Number.isNaN(value)) {
          if (value === 1) {
            return true;
          }
          if (value === 0) {
            return false;
          }
        }
      }
    }
    return null;
  }

  private resolveNumberValue(sources: Record<string, unknown>[], keys: string[], fallback: number): number {
    const detected = this.collectNumberValue(sources, keys);
    return detected !== null ? detected : fallback;
  }

  private parseNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed.length) {
        return null;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private asNumber(value: number | null | undefined): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (value === null || value === undefined) {
      return 0;
    }
    const parsed = this.parseNumber(value);
    return parsed ?? 0;
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

  private normalizeId(value: number | string | null | undefined): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = this.parseNumber(value);
      return parsed !== null ? parsed : null;
    }
    return null;
  }

  private normalizeBoolean(value: boolean | string | number | null | undefined): boolean | null {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') {
        return true;
      }
      if (normalized === 'false') {
        return false;
      }
    }
    if (typeof value === 'number') {
      if (value === 1) {
        return true;
      }
      if (value === 0) {
        return false;
      }
    }
    return null;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
