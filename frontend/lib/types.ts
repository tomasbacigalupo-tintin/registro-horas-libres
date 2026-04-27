export type CatalogOption = string | number | Record<string, string | number | boolean | null | undefined>;

export type Catalogos = {
  profesores: CatalogOption[];
  preceptores: CatalogOption[];
  cursos: CatalogOption[];
  materias: CatalogOption[];
  motivos: CatalogOption[];
};

export type RegistroInput = {
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

export type Registro = RegistroInput & { id: string; created_at: string };
export type ApiResponse<T> = { ok: boolean; data?: T; error?: string };
