import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/pagination.models';
import { SeguimientoDTO, SeguimientoFilter, SeguimientoPayload } from '../models/seguimiento.models';

@Injectable({ providedIn: 'root' })
export class SeguimientosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gestionBaseUrl}/seguimientos`;

  list(filter: SeguimientoFilter): Observable<PageResponse<SeguimientoDTO>> {
    const params = this.buildParams(filter);
    return this.http
      .get<PageResponse<SeguimientoDTO> | SeguimientoDTO[]>(this.baseUrl, { params })
      .pipe(
        map((payload) => this.toPageResponse(payload, filter)),
        catchError(() => of(this.emptyPage(filter)))
      );
  }

  findById(id: string): Observable<SeguimientoDTO> {
    return this.http.get<SeguimientoDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: SeguimientoPayload): Observable<SeguimientoDTO> {
    return this.http.post<SeguimientoDTO>(this.baseUrl, payload);
  }

  update(id: string, payload: SeguimientoPayload): Observable<SeguimientoDTO> {
    return this.http.put<SeguimientoDTO>(`${this.baseUrl}/${id}`, payload);
  }

  private buildParams(filter: SeguimientoFilter): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }

  private emptyPage(filter: SeguimientoFilter): PageResponse<SeguimientoDTO> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: filter.page ?? 0,
      size: filter.size ?? 0
    };
  }

  private toPageResponse(
    payload: PageResponse<SeguimientoDTO> | SeguimientoDTO[],
    filter: SeguimientoFilter
  ): PageResponse<SeguimientoDTO> {
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
