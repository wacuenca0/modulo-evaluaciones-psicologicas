export interface CatalogoCIE10DTO {
  id?: number;
  codigo: string;
  descripcion: string;
  categoria?: string;
  activo?: boolean;
}

export interface CreateCatalogoCIE10Payload {
  codigo: string;
  descripcion: string;
  categoria?: string;
  activo?: boolean;
}

export interface UpdateCatalogoCIE10Payload {
  codigo?: string;
  descripcion?: string;
  categoria?: string;
  activo?: boolean;
}
