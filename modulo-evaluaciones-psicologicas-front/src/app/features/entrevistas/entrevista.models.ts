import { signal } from '@angular/core';

export interface EntrevistaSeccion {
  id: string;
  titulo: string;
  descripcion?: string;
}

export const SECCIONES_ORDEN: EntrevistaSeccion[] = [
  { id: 'identificacion', titulo: 'Datos de identificación' },
  { id: 'familia', titulo: 'Familiograma' },
  { id: 'anamnesis', titulo: 'Anamnesis' }
];

export const seccionActiva = signal<string>(SECCIONES_ORDEN[0]?.id ?? '');
