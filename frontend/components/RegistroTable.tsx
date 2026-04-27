import type { Registro } from '@/lib/types';

export function RegistroTable({ registros }: { registros: Registro[] }) {
  return (
    <div className="overflow-x-auto rounded border bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>{['Fecha', 'Hora', 'Preceptor', 'Profesor', 'Materia', 'Curso', 'Turno', 'Motivo', 'Observaciones'].map((h) => <th className="px-4 py-3" key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {registros.length === 0 && <tr><td className="px-4 py-6 text-center" colSpan={9}>No hay registros.</td></tr>}
          {registros.map((r) => (
            <tr className="border-t" key={r.id || r.created_at}>
              <td className="px-4 py-3">{r.fecha}</td>
              <td className="px-4 py-3">{r.hora}</td>
              <td className="px-4 py-3">{r.preceptor}</td>
              <td className="px-4 py-3">{r.profesor_ausente}</td>
              <td className="px-4 py-3">{r.materia}</td>
              <td className="px-4 py-3">{r.curso}</td>
              <td className="px-4 py-3">{r.turno}</td>
              <td className="px-4 py-3">{r.motivo}</td>
              <td className="px-4 py-3">{r.observaciones}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
