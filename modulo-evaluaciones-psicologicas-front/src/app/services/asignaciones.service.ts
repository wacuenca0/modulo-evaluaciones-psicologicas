import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/pagination.models';
import { AsignacionDTO, AsignacionFilter, AsignacionPayload, EstadoAsignacion } from '../models/asignacion.models';

@Injectable({ providedIn: 'root' })
export class AsignacionesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gestionBaseUrl}/asignaciones`;

  list(filter: AsignacionFilter): Observable<PageResponse<AsignacionDTO>> {
    const params = this.buildParams(filter);
    return this.http
      .get<PageResponse<AsignacionDTO> | AsignacionDTO[]>(this.baseUrl, { params })
      .pipe(
        map((payload) => this.toPageResponse(payload, filter)),
        catchError(() => of(this.emptyPage(filter)))
      );
  }

  listPropias(psicologoId: string, filter: AsignacionFilter): Observable<PageResponse<AsignacionDTO>> {
    const params = this.buildParams({ ...filter, psicologoId });
    return this.http
      .get<PageResponse<AsignacionDTO> | AsignacionDTO[]>(`${this.baseUrl}/psicologo/${psicologoId}`, { params })
      .pipe(
        map((payload) => this.toPageResponse(payload, filter)),
        catchError(() => of(this.emptyPage(filter)))
      );
  }

  create(payload: AsignacionPayload): Observable<AsignacionDTO> {
    return this.http.post<AsignacionDTO>(this.baseUrl, payload);
  }

  actualizarEstado(id: string, estado: EstadoAsignacion): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/estado`, { estado });
  }

  reasignar(id: string, payload: { psicologoId: string; observaciones?: string }): Observable<AsignacionDTO> {
    return this.http.patch<AsignacionDTO>(`${this.baseUrl}/${id}/reasignar`, payload);
  }

  private buildParams(filter: AsignacionFilter): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }

  private emptyPage(filter: AsignacionFilter): PageResponse<AsignacionDTO> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: filter.page ?? 0,
      size: filter.size ?? 0
    };
  }

  private toPageResponse(
    payload: PageResponse<AsignacionDTO> | AsignacionDTO[],
    filter: AsignacionFilter
  ): PageResponse<AsignacionDTO> {
    if (!Array.isArray(payload)) {
      return payload;
    }

    const totalElements = payload.length;
    const requestedSize = typeof filter.size === 'number' && filter.size > 0 ? filter.size : undefined;
    const size = requestedSize ?? (totalElements > 0 ? totalElements : 1);
    const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);

    return {
      content: payload,
      totalElements,
      totalPages,
      page: filter.page ?? 0,
      size
    };
  }
}
