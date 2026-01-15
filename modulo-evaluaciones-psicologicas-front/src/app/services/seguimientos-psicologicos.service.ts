import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SeguimientoPsicologicoDTO,
  SeguimientoPsicologicoListParams,
  SeguimientoPsicologicoListResponse,
  SeguimientoPsicologicoPayload
} from '../models/seguimientos-psicologicos.models';

@Injectable({ providedIn: 'root' })
export class SeguimientosPsicologicosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = this.resolveBaseUrl();

  crearSeguimiento(payload: SeguimientoPsicologicoPayload): Observable<SeguimientoPsicologicoDTO> {
    const url = `${this.baseUrl}/seguimientos-psicologicos`;
    return this.http.post<SeguimientoPsicologicoDTO>(url, this.toPayload(payload));
  }

  obtenerUltimoSeguimiento(fichaId: number): Observable<SeguimientoPsicologicoDTO | null> {
    const params = new HttpParams({
      fromObject: {
        fichaPsicologicaId: String(fichaId),
        page: '0',
        size: '1',
        sort: 'fechaSeguimiento,desc'
      }
    });
    const url = `${this.baseUrl}/seguimientos-psicologicos`;
    return this.http.get<unknown>(url, { params }).pipe(map(res => this.extractPrimero(res)));
  }

  listarSeguimientos(params: SeguimientoPsicologicoListParams): Observable<SeguimientoPsicologicoListResponse> {
    const query = new HttpParams({
      fromObject: {
        fichaPsicologicaId: String(params.fichaPsicologicaId),
        page: String(params.page ?? 0),
        size: String(params.size ?? 10),
        sort: params.sort ?? 'fechaSeguimiento,desc'
      }
    });
    const url = `${this.baseUrl}/seguimientos-psicologicos`;
    return this.http.get<unknown>(url, { params: query }).pipe(map(res => this.extractListado(res)));
  }

  private resolveBaseUrl(): string {
    const nested = (environment as { api?: { gestionBaseUrl?: string } }).api?.gestionBaseUrl;
    const flat = (environment as { gestionBaseUrl?: string }).gestionBaseUrl;
    const base = nested || flat || '';
    if (!base) {
      return '/api';
    }
    return base.replace(/\/$/, '');
  }

  private toPayload(payload: SeguimientoPsicologicoPayload): Record<string, unknown> {
    const body: Record<string, unknown> = {
      ficha_psicologica_id: Number(payload.fichaPsicologicaId),
      condicion: payload.condicion,
      observaciones: this.normalizeTexto(payload.observaciones) ?? ''
    };

    if (payload.diagnosticoCie10Id !== undefined) {
      body['diagnostico_cie10_id'] = this.normalizeId(payload.diagnosticoCie10Id);
    }
    if (payload.planFrecuencia !== undefined) {
      body['plan_frecuencia'] = this.normalizeEnum(payload.planFrecuencia);
    }
    if (payload.planTipoSesion !== undefined) {
      body['plan_tipo_sesion'] = this.normalizeEnum(payload.planTipoSesion);
    }
    if (payload.planDetalle !== undefined) {
      body['plan_detalle'] = this.normalizeTexto(payload.planDetalle);
    }
    if (payload.proximoSeguimiento !== undefined) {
      body['proximo_seguimiento'] = this.normalizeFecha(payload.proximoSeguimiento);
    }
    if (payload.transferenciaUnidad !== undefined) {
      body['transferencia_unidad'] = this.normalizeTexto(payload.transferenciaUnidad);
    }
    if (payload.transferenciaObservacion !== undefined) {
      body['transferencia_observacion'] = this.normalizeTexto(payload.transferenciaObservacion);
    }

    return body;
  }

  private normalizeTexto(value: unknown): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    }
    return undefined;
  }

  private normalizeFecha(value: unknown): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value.toISOString();
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed.length) {
        return null;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
      return trimmed;
    }
    return undefined;
  }

  private normalizeEnum(value: unknown): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length ? trimmed.toUpperCase() : null;
    }
    return undefined;
  }

  private normalizeId(value: unknown): number | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Number(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed.length) {
        return null;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private extractPrimero(response: unknown): SeguimientoPsicologicoDTO | null {
    if (!response || typeof response !== 'object') {
      return null;
    }
    if (Array.isArray(response)) {
      return response.length ? (response[0] as SeguimientoPsicologicoDTO) : null;
    }
    if ('items' in response && Array.isArray((response as { items?: unknown }).items)) {
      const items = (response as { items?: unknown[] }).items ?? [];
      return items.length ? (items[0] as SeguimientoPsicologicoDTO) : null;
    }
    if ('content' in response && Array.isArray((response as { content?: unknown }).content)) {
      const content = (response as { content?: unknown[] }).content ?? [];
      return content.length ? (content[0] as SeguimientoPsicologicoDTO) : null;
    }
    if ('data' in response && Array.isArray((response as { data?: unknown }).data)) {
      const data = (response as { data?: unknown[] }).data ?? [];
      return data.length ? (data[0] as SeguimientoPsicologicoDTO) : null;
    }
    return null;
  }

  private extractListado(response: unknown): SeguimientoPsicologicoListResponse {
    if (Array.isArray(response)) {
      return { items: response as SeguimientoPsicologicoDTO[], total: response.length };
    }
    if (!response || typeof response !== 'object') {
      return { items: [], total: 0 };
    }
    if ('items' in response && Array.isArray((response as { items?: unknown }).items)) {
      const items = (response as { items?: SeguimientoPsicologicoDTO[] }).items ?? [];
      const total = Number((response as { total?: unknown }).total ?? items.length);
      return { items, total: Number.isFinite(total) ? total : items.length };
    }
    if ('content' in response && Array.isArray((response as { content?: unknown }).content)) {
      const content = (response as { content?: SeguimientoPsicologicoDTO[] }).content ?? [];
      const total = Number((response as { totalElements?: unknown }).totalElements ?? content.length);
      return { items: content, total: Number.isFinite(total) ? total : content.length };
    }
    if ('data' in response && Array.isArray((response as { data?: unknown }).data)) {
      const data = (response as { data?: SeguimientoPsicologicoDTO[] }).data ?? [];
      const total = Number((response as { total?: unknown }).total ?? data.length);
      return { items: data, total: Number.isFinite(total) ? total : data.length };
    }
    return { items: [], total: 0 };
  }
}
