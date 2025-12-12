import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/pagination.models';
import { PsicologoDTO, PsicologoFilter, PsicologoPayload } from '../models/psicologo.models';

@Injectable({ providedIn: 'root' })
export class PsicologosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gestionBaseUrl}/psicologos`;

  list(filter: PsicologoFilter): Observable<PageResponse<PsicologoDTO>> {
    const params = this.buildParams(filter);
    return this.http
      .get<PageResponse<PsicologoDTO> | PsicologoDTO[]>(this.baseUrl, { params })
      .pipe(
        map((payload) => this.toPageResponse(payload, filter)),
        catchError(() => of(this.emptyPage(filter)))
      );
  }

  findById(id: string): Observable<PsicologoDTO> {
    return this.http.get<PsicologoDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: PsicologoPayload): Observable<PsicologoDTO> {
    return this.http.post<PsicologoDTO>(this.baseUrl, payload);
  }

  update(id: string, payload: PsicologoPayload): Observable<PsicologoDTO> {
    return this.http.put<PsicologoDTO>(`${this.baseUrl}/${id}`, payload);
  }

  updateEstado(id: string, estado: 'ACTIVO' | 'INACTIVO'): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/estado`, { estado });
  }

  private buildParams(filter: PsicologoFilter): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }

  private emptyPage(filter: PsicologoFilter): PageResponse<PsicologoDTO> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: filter.page ?? 0,
      size: filter.size ?? 0
    };
  }

  private toPageResponse(
    payload: PageResponse<PsicologoDTO> | PsicologoDTO[],
    filter: PsicologoFilter
  ): PageResponse<PsicologoDTO> {
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
