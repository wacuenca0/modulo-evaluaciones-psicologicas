import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/pagination.models';
import { FichaClinicaDTO, FichaClinicaFilter, FichaClinicaPayload, DiagnosticoDTO } from '../models/ficha-clinica.models';

@Injectable({ providedIn: 'root' })
export class FichasClinicasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.gestionBaseUrl}/fichas`;

  list(filter: FichaClinicaFilter): Observable<PageResponse<FichaClinicaDTO>> {
    const params = this.buildParams(filter);
    return this.http
      .get<PageResponse<FichaClinicaDTO> | FichaClinicaDTO[]>(this.baseUrl, { params })
      .pipe(
        map((payload) => this.toPageResponse(payload, filter)),
        catchError(() => of(this.emptyPage(filter)))
      );
  }

  findById(id: string): Observable<FichaClinicaDTO> {
    return this.http.get<FichaClinicaDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: FichaClinicaPayload): Observable<FichaClinicaDTO> {
    return this.http.post<FichaClinicaDTO>(this.baseUrl, payload);
  }

  update(id: string, payload: FichaClinicaPayload): Observable<FichaClinicaDTO> {
    return this.http.put<FichaClinicaDTO>(`${this.baseUrl}/${id}`, payload);
  }

  cerrarFicha(id: string, payload: { observaciones?: string }): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cerrar`, payload);
  }

  registrarDiagnosticos(id: string, diagnosticos: DiagnosticoDTO[]): Observable<FichaClinicaDTO> {
    return this.http.put<FichaClinicaDTO>(`${this.baseUrl}/${id}/diagnosticos`, diagnosticos);
  }

  private buildParams(filter: FichaClinicaFilter): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }
    return params;
  }

  private emptyPage(filter: FichaClinicaFilter): PageResponse<FichaClinicaDTO> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: filter.page ?? 0,
      size: filter.size ?? 0
    };
  }

  private toPageResponse(
    payload: PageResponse<FichaClinicaDTO> | FichaClinicaDTO[],
    filter: FichaClinicaFilter
  ): PageResponse<FichaClinicaDTO> {
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
