import type { ApiResponse, Catalogos, Registro, RegistroInput } from './types';

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

export async function getCatalogos(): Promise<Catalogos> {
  const [profesores, preceptores, cursos, materias, motivos] = await Promise.all([
    callApi<Catalogos['profesores']>('getProfesores'),
    callApi<Catalogos['preceptores']>('getPreceptores'),
    callApi<Catalogos['cursos']>('getCursos'),
    callApi<Catalogos['materias']>('getMaterias'),
    callApi<Catalogos['motivos']>('getMotivos')
  ]);
  return { profesores, preceptores, cursos, materias, motivos };
}

export const getRegistros = () => callApi<Registro[]>('getRegistros');
export const crearRegistro = (data: RegistroInput) => callApi<Registro>('crearRegistro', data);
