'use client';

import { useEffect, useState } from 'react';
import { RegistroTable } from '@/components/RegistroTable';
import { getRegistros } from '@/lib/api';
import type { Registro } from '@/lib/types';

export default function RegistrosPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getRegistros().then(setRegistros).catch((err) => setError(err.message));
  }, []);

  return (
    <section className="grid gap-5">
      <h2 className="text-2xl font-bold">Registros</h2>
      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>}
      <RegistroTable registros={registros} />
    </section>
  );
}
