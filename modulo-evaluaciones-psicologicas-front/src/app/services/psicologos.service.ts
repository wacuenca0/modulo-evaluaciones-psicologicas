import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../core/config/api.config';
import { CreatePsicologoPayload, PsicologoDTO, UpdatePsicologoPayload } from '../models/psicologos.models';

@Injectable({ providedIn: 'root' })
export class PsicologosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = buildApiUrl('gestion', '/psicologos');

  crear(payload: CreatePsicologoPayload): Observable<PsicologoDTO> {
    return this.http.post<PsicologoDTO>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: UpdatePsicologoPayload): Observable<PsicologoDTO> {
    return this.http.put<PsicologoDTO>(`${this.baseUrl}/${id}`, payload);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  obtenerActivos(): Observable<PsicologoDTO[]> {
    return this.http.get<PsicologoDTO[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<PsicologoDTO> {
    return this.http.get<PsicologoDTO>(`${this.baseUrl}/${id}`);
  }
}
