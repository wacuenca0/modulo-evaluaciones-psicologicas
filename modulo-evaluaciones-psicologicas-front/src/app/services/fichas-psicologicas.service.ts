import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FichaCondicionClinicaPayload,
  FichaCondicionFinalPayload,
  FichaObservacionClinicaPayload,
  FichaPsicoanamnesisPayload,
  FichaPsicologicaCreacionInicialDTO,
  FichaPsicologicaHistorialDTO
} from '../models/fichas-psicologicas.models';

@Injectable({ providedIn: 'root' })
export class FichasPsicologicasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = this.resolveBaseUrl();

  obtenerHistorial(personalMilitarId: number): Observable<FichaPsicologicaHistorialDTO[]> {
    const url = `${this.baseUrl}/fichas-psicologicas/historial/${personalMilitarId}`;
    return this.http
      .get<FichaPsicologicaHistorialDTO[] | null>(url)
      .pipe(map(res => Array.isArray(res) ? res : []));
  }

  crearFichaInicial(payload: FichaPsicologicaCreacionInicialDTO): Observable<FichaPsicologicaHistorialDTO> {
    const url = `${this.baseUrl}/fichas-psicologicas`;
    return this.http.post<FichaPsicologicaHistorialDTO>(url, this.toSeccionGeneralPayload(payload));
  }

  obtenerFichaCompleta(fichaId: number): Observable<FichaPsicologicaHistorialDTO> {
    const id = Number(fichaId);
    const url = `${this.baseUrl}/fichas-psicologicas/${id}`;
    return this.http.get<FichaPsicologicaHistorialDTO>(url);
  }

  actualizarObservacionClinica(fichaId: number, payload: FichaObservacionClinicaPayload): Observable<FichaPsicologicaHistorialDTO> {
    const id = Number(fichaId);
    const url = `${this.baseUrl}/fichas-psicologicas/${id}/observacion`;
    return this.http.put<FichaPsicologicaHistorialDTO>(url, this.toObservacionPayload(payload));
  }

  actualizarPsicoanamnesis(fichaId: number, payload: FichaPsicoanamnesisPayload): Observable<FichaPsicologicaHistorialDTO> {
    const id = Number(fichaId);
    const url = `${this.baseUrl}/fichas-psicologicas/${id}/psicoanamnesis`;
    return this.http.put<FichaPsicologicaHistorialDTO>(url, this.toPsicoanamnesisPayload(payload));
  }

  actualizarCondicionClinica(fichaId: number, payload: FichaCondicionClinicaPayload): Observable<FichaPsicologicaHistorialDTO> {
    const id = Number(fichaId);
    const url = `${this.baseUrl}/fichas-psicologicas/${id}/condicion`;
    return this.http.put<FichaPsicologicaHistorialDTO>(url, this.toCondicionClinicaPayload(payload));
  }

  registrarCondicionFinal(fichaId: number, payload: FichaCondicionFinalPayload): Observable<void> {
    const id = Number(fichaId);
    const url = `${this.baseUrl}/fichas-psicologicas/${id}/condicion-final`;
    return this.http.post<void>(url, this.toCondicionPayload(payload));
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

  private toSeccionGeneralPayload(payload: FichaPsicologicaCreacionInicialDTO): Record<string, unknown> {
    const fecha = this.normalizedOrUndefined(payload.fechaEvaluacion);
    const tipo = this.normalizedRequired(payload.tipoEvaluacion);
    const estado = this.normalizedRequired(payload.estado);

    const body: Record<string, unknown> = {
      personal_militar_id: Number(payload.personalMilitarId),
      tipo_evaluacion: tipo,
      estado
    };

    if (fecha) {
      body['fecha_evaluacion'] = fecha;
    }

    return body;
  }

  private toObservacionPayload(payload: FichaObservacionClinicaPayload): Record<string, unknown> {
    return {
      observacion_clinica: this.normalizedRequired(payload.observacionClinica),
      motivo_consulta: this.normalizedRequired(payload.motivoConsulta),
      enfermedad_actual: this.normalizedOrUndefined(payload.enfermedadActual)
    };
  }

  private toPsicoanamnesisPayload(payload: FichaPsicoanamnesisPayload): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (payload.prenatal) {
      const prenatalBody = this.buildSection({
        condiciones_biologicas_padres: this.normalizedOrNull(payload.prenatal.condicionesBiologicasPadres),
        condiciones_psicologicas_padres: this.normalizedOrNull(payload.prenatal.condicionesPsicologicasPadres),
        observacion_prenatal: this.normalizedOrNull(payload.prenatal.observacionPrenatal)
      });
      if (prenatalBody) {
        body['prenatal'] = prenatalBody;
      }
    }

    if (payload.natal) {
      const natalBody = this.buildSection({
        parto_normal: payload.natal.partoNormal === undefined ? undefined : payload.natal.partoNormal,
        termino_parto: this.normalizedOrNull(payload.natal.terminoParto),
        complicaciones_parto: this.normalizedOrNull(payload.natal.complicacionesParto),
        observacion_natal: this.normalizedOrNull(payload.natal.observacionNatal)
      });
      if (natalBody) {
        body['natal'] = natalBody;
      }
    }

    if (payload.infancia) {
      const infanciaBody = this.buildSection({
        grado_sociabilidad: this.normalizedOrNull(payload.infancia.gradoSociabilidad),
        relacion_padres_hermanos: this.normalizedOrNull(payload.infancia.relacionPadresHermanos),
        discapacidad_intelectual: payload.infancia.discapacidadIntelectual === undefined ? undefined : payload.infancia.discapacidadIntelectual,
        grado_discapacidad: this.normalizedOrNull(payload.infancia.gradoDiscapacidad),
        trastornos: this.normalizedOrNull(payload.infancia.trastornos),
        tratamientos_psicologicos_psiquiatricos: payload.infancia.tratamientosPsicologicosPsiquiatricos === undefined ? undefined : payload.infancia.tratamientosPsicologicosPsiquiatricos,
        observacion_infancia: this.normalizedOrNull(payload.infancia.observacionInfancia)
      });
      if (infanciaBody) {
        body['infancia'] = infanciaBody;
      }
    }

    return body;
  }

  private toCondicionPayload(payload: FichaCondicionFinalPayload): Record<string, unknown> {
    const cie10Codigo = payload.cie10Codigo?.trim() || undefined;
    const cie10Descripcion = payload.cie10Descripcion?.trim() || undefined;
    return {
      condicion: payload.condicion,
      condicion_final: payload.condicion,
      cie10: cie10Codigo,
      cie10_codigo: cie10Codigo,
      cie10_descripcion: cie10Descripcion
    };
  }

  private toCondicionClinicaPayload(payload: FichaCondicionClinicaPayload): Record<string, unknown> {
    return {
      condicion: this.normalizedRequired(payload.condicion),
      diagnostico_cie10_codigo: this.normalizedOrNull(payload.diagnosticoCie10Codigo),
      diagnostico_cie10_descripcion: this.normalizedOrNull(payload.diagnosticoCie10Descripcion),
      plan_frecuencia: this.normalizedOrNull(payload.planFrecuencia),
      plan_tipo_sesion: this.normalizedOrNull(payload.planTipoSesion),
      plan_detalle: this.normalizedOrNull(payload.planDetalle)
    };
  }

  private normalizedOrUndefined(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private normalizedOrNull(value: unknown): string | null | undefined {
    if (value === null) {
      return null;
    }
    if (typeof value !== 'string') {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private normalizedRequired(value: unknown): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length) {
        return trimmed;
      }
    }
    throw new Error('Valor requerido para la ficha psicologica no proporcionado');
  }

  private buildSection(section: Record<string, string | number | boolean | null | undefined>): Record<string, unknown> | undefined {
    const entries = Object.entries(section).filter(([, value]) => value !== undefined);
    if (!entries.length) {
      return undefined;
    }
    return Object.fromEntries(entries);
  }
}
