import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CatalogoCIE10DTO } from '../models/catalogo.models';

export interface CatalogoCie10Filters {
  soloActivos?: boolean;
  termino?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.catalogBaseUrl}/cie10`;

  listarCIE10(filters: CatalogoCie10Filters = {}): Observable<CatalogoCIE10DTO[]> {
    let params = new HttpParams();
    if (filters.soloActivos) params = params.set('activo', 'true');
    const search = filters.termino ?? filters.search;
    if (search && search.trim().length) {
      params = params.set('search', search.trim());
    }
    return this.http.get<CatalogoCIE10DTO[]>(this.baseUrl, { params });
  }

  buscarCIE10(termino: string): Observable<CatalogoCIE10DTO[]> {
    const normalized = termino.trim();
    return this.listarCIE10({ search: normalized, soloActivos: true });
  }

  obtenerCIE10(id: number): Observable<CatalogoCIE10DTO> {
    return this.http.get<CatalogoCIE10DTO>(`${this.baseUrl}/${id}`);
  }

  crearCIE10(payload: CatalogoCIE10DTO): Observable<CatalogoCIE10DTO> {
    return this.http.post<CatalogoCIE10DTO>(this.baseUrl, payload);
  }

  actualizarCIE10(id: number, payload: CatalogoCIE10DTO): Observable<CatalogoCIE10DTO> {
    return this.http.put<CatalogoCIE10DTO>(`${this.baseUrl}/${id}`, payload);
  }

}
