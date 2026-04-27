export type CatalogValue = string | number | boolean | null | undefined;
export type CatalogRecord = Record<string, CatalogValue>;
export type CatalogOption = string | number | CatalogRecord;

export type BaseCatalogItem = {
  id?: string;
  nombre?: string;
  activo?: string;
};

export type ProfesorMateria = {
  id?: string;
  profesor_id: string;
  profesor_nombre: string;
  materia: string;
  curso: string;
  turno: string;
  activo?: string;
};

export type Catalogos = {
  profesores: BaseCatalogItem[];
  preceptores: BaseCatalogItem[];
  cursos: BaseCatalogItem[];
  materias: BaseCatalogItem[];
  motivos: BaseCatalogItem[];
  profesores_materias: ProfesorMateria[];
};

export type RegistroBase = {
  fecha: string;
  hora: string;
  preceptor: string;
  profesor_ausente: string;
  materia: string;
  curso: string;
  turno: string;
  motivo: string;
  observaciones: string;
};

export type RegistroInput = RegistroBase & { created_at: string };
export type Registro = RegistroBase & { id: string; created_at: string };
export type ApiResponse<T> = { ok: boolean; data?: T; error?: string };
