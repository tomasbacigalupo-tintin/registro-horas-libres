import type { ApiResponse, BaseCatalogItem, Catalogos, ProfesorMateria, Registro, RegistroInput } from './types';

const API_ROUTE = '/api/gas';

async function callApi<T>(action: string, data?: unknown): Promise<T> {
  const response = await fetch(API_ROUTE, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, data }),
    cache: 'no-store'
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.ok) throw new Error(payload.error || 'Error de API');
  return payload.data as T;
}

export function labelOf(option: unknown): string {
  if (option === null || typeof option === 'undefined') return '';
  if (typeof option !== 'object') return String(option);
  const record = option as Record<string, unknown>;
  return String(record.nombre || record.Nombre || record.valor || record.Valor || record.name || Object.values(record)[0] || '');
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function isActive(option: { activo?: string } | null | undefined) {
  return !option?.activo || String(option.activo).trim().toUpperCase() === 'SI';
}

function normalizeCatalogItem(option: unknown): BaseCatalogItem {
  if (option && typeof option === 'object') {
    const record = option as Record<string, unknown>;
    return {
      id: String(record.id ?? ''),
      nombre: String(record.nombre ?? record.Nombre ?? ''),
      activo: String(record.activo ?? record.Activo ?? '')
    };
  }

  return { id: '', nombre: String(option ?? ''), activo: 'SI' };
}

function normalizeProfesorMateria(option: unknown): ProfesorMateria {
  const record = (option && typeof option === 'object' ? option : {}) as Record<string, unknown>;
  return {
    id: String(record.id ?? ''),
    profesor_id: String(record.profesor_id ?? ''),
    profesor_nombre: String(record.profesor_nombre ?? record.profesor ?? ''),
    materia: String(record.materia ?? ''),
    curso: String(record.curso ?? ''),
    turno: String(record.turno ?? ''),
    activo: String(record.activo ?? '')
  };
}

function normalizeRegistro(option: unknown): Registro {
  const record = (option && typeof option === 'object' ? option : {}) as Record<string, unknown>;

  return {
    id: String(record.id ?? ''),
    fecha: String(record.fecha ?? ''),
    hora: String(record.hora ?? ''),
    preceptor: String(record.preceptor ?? record.preceptora ?? ''),
    profesor_ausente: String(record.profesor_ausente ?? record.profesor ?? record.docente ?? ''),
    materia: String(record.materia ?? ''),
    curso: String(record.curso ?? ''),
    turno: String(record.turno ?? ''),
    motivo: String(record.motivo ?? ''),
    observaciones: String(record.observaciones ?? ''),
    created_at: String(record.created_at ?? '')
  };
}

export async function getCatalogos(): Promise<Catalogos> {
  const [profesores, preceptores, cursos, materias, motivos, profesores_materias] = await Promise.all([
    callApi<Catalogos['profesores']>('getProfesores'),
    callApi<Catalogos['preceptores']>('getPreceptores'),
    callApi<Catalogos['cursos']>('getCursos'),
    callApi<Catalogos['materias']>('getMaterias'),
    callApi<Catalogos['motivos']>('getMotivos'),
    callApi<Catalogos['profesores_materias']>('getProfesoresMaterias')
  ]);

  return {
    profesores: asArray(profesores).map(normalizeCatalogItem).filter(isActive),
    preceptores: asArray(preceptores).map(normalizeCatalogItem).filter(isActive),
    cursos: asArray(cursos).map(normalizeCatalogItem).filter(isActive),
    materias: asArray(materias).map(normalizeCatalogItem).filter(isActive),
    motivos: asArray(motivos).map(normalizeCatalogItem).filter(isActive),
    profesores_materias: asArray(profesores_materias).map(normalizeProfesorMateria).filter(isActive)
  };
}

export const getRegistros = async () => asArray(await callApi<Registro[]>('getRegistros')).map(normalizeRegistro);
export const crearRegistro = (data: RegistroInput) => callApi<Registro>('crearRegistro', data);
