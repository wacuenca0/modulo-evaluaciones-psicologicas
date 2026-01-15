import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PersonalMilitarDTO, PersonalMilitarPageDTO, PersonalMilitarPayload } from '../models/personal-militar.models';

@Injectable({ providedIn: 'root' })
export class PersonalMilitarService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = this.resolveBaseUrl();

  buscarPorCedula(cedula: string): Observable<PersonalMilitarDTO> {
    const params = new HttpParams().set('cedula', cedula.trim());
    return this.http.get<PersonalMilitarDTO>(`${this.baseUrl}/buscar`, { params });
  }

  buscarPorApellidos(apellidos: string, page = 0, size = 10): Observable<PersonalMilitarPageDTO> {
    const params = new HttpParams()
      .set('apellidos', apellidos.trim())
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<PersonalMilitarPageDTO>(`${this.baseUrl}/buscar`, { params });
  }

  obtenerPorId(id: number): Observable<PersonalMilitarDTO> {
    return this.http.get<PersonalMilitarDTO>(`${this.baseUrl}/${id}`);
  }

  crear(payload: PersonalMilitarPayload): Observable<PersonalMilitarDTO> {
    return this.http.post<PersonalMilitarDTO>(this.baseUrl, this.toApiPayload(payload));
  }

  actualizar(id: number, payload: PersonalMilitarPayload): Observable<PersonalMilitarDTO> {
    return this.http.put<PersonalMilitarDTO>(`${this.baseUrl}/${id}`, this.toApiPayload(payload));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private resolveBaseUrl(): string {
    const nested = (environment as { api?: { gestionBaseUrl?: string } }).api?.gestionBaseUrl;
    const flat = (environment as { gestionBaseUrl?: string }).gestionBaseUrl;
    const base = nested || flat || '';
    if (!base) {
      return '/gestion/api/personal-militar';
    }
    const normalized = base.replace(/\/$/, '');
    
    // If it's an absolute URL, extract only the path portion
    let path = normalized;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      try {
        path = new URL(normalized).pathname;
      } catch {
        path = normalized;
      }
    }
    
    if (/\/personal-militar$/i.test(path)) {
      return path;
    }
    return `${path}/personal-militar`;
  }

  private toApiPayload(payload: PersonalMilitarPayload): Record<string, unknown> {
    return {
      cedula: payload.cedula,
      apellidos_nombres: payload.apellidosNombres,
      tipo_persona: payload.tipoPersona,
      es_militar: payload.esMilitar,
      fecha_nacimiento: payload.fechaNacimiento ?? null,
      edad: payload.edad ?? null,
      sexo: payload.sexo,
      etnia: payload.etnia ?? null,
      estado_civil: payload.estadoCivil ?? null,
      numero_hijos: payload.numeroHijos ?? null,
      ocupacion: payload.ocupacion ?? null,
      servicio_activo: payload.servicioActivo,
      servicio_pasivo: payload.servicioPasivo,
      seguro: payload.seguro ?? null,
      grado: payload.grado ?? null,
      especialidad: payload.especialidad ?? null,
      provincia: payload.provincia ?? null,
      canton: payload.canton ?? null,
      parroquia: payload.parroquia ?? null,
      barrio_sector: payload.barrioSector ?? null,
      telefono: payload.telefono ?? null,
      celular: payload.celular ?? null,
      email: payload.email ?? null,
      activo: payload.activo
    };
  }
}
