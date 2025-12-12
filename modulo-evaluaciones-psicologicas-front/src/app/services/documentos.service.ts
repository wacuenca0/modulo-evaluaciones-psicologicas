import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  TipoDocumentoDTO,
  CrearTipoDocumentoDTO,
  FichaHistoricaDTO,
  CrearFichaHistoricaDTO,
  DocumentoFichaDTO,
  CrearDocumentoFichaDTO,
  DocumentoRegistroResponse
} from '../models/documento.models';

@Injectable({ providedIn: 'root' })
export class DocumentosService {
  private readonly http = inject(HttpClient);
  private readonly tiposUrl = `${environment.documentosBaseUrl}/tipos`;
  private readonly historicasUrl = `${environment.documentosBaseUrl}/historicas`;
  private readonly fichasUrl = `${environment.documentosBaseUrl}/fichas`;

  listarTipos(): Observable<TipoDocumentoDTO[]> {
    return this.http.get<TipoDocumentoDTO[]>(this.tiposUrl);
  }

  crearTipo(payload: CrearTipoDocumentoDTO): Observable<TipoDocumentoDTO> {
    return this.http.post<TipoDocumentoDTO>(this.tiposUrl, payload);
  }

  listarHistoricas(identificacion: string): Observable<FichaHistoricaDTO[]> {
    const params = new HttpParams().set('identificacion', identificacion.trim());
    return this.http.get<FichaHistoricaDTO[]>(this.historicasUrl, { params });
  }

  crearFichaHistorica(payload: CrearFichaHistoricaDTO): Observable<FichaHistoricaDTO> {
    return this.http.post<FichaHistoricaDTO>(this.historicasUrl, payload);
  }

  listarDocumentosFicha(fichaId: number): Observable<DocumentoFichaDTO[]> {
    return this.http.get<DocumentoFichaDTO[]>(`${this.fichasUrl}/${fichaId}`);
  }

  registrarDocumentoFicha(payload: CrearDocumentoFichaDTO): Observable<DocumentoRegistroResponse> {
    return this.http.post<DocumentoRegistroResponse>(this.fichasUrl, payload);
  }

  descargarDocumento(fichaId: number, documentoId: number): Observable<Blob> {
    return this.http.get(`${this.fichasUrl}/${fichaId}/archivo/${documentoId}`, { responseType: 'blob' });
  }
}
