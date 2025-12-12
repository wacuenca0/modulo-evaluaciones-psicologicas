export interface TipoDocumentoDTO {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CrearTipoDocumentoDTO {
  nombre: string;
  descripcion?: string;
}

export interface FichaHistoricaDTO {
  id: number;
  identificacion: string;
  fecha: string;
  tipo: string;
  resumen?: string;
}

export interface CrearFichaHistoricaDTO {
  identificacion: string;
  tipoDocumentoId: number;
  fecha: string;
  contenido: string;
}

export interface DocumentoFichaDTO {
  id: number;
  fichaId: number;
  nombreArchivo: string;
  tipoContenido: string;
  urlDescarga: string;
}

export interface CrearDocumentoFichaDTO {
  fichaId: number;
  nombreArchivo: string;
  contenidoBase64: string;
  tipoContenido: string;
}

export interface DocumentoRegistroResponse {
  mensaje?: string;
  id?: number;
}
