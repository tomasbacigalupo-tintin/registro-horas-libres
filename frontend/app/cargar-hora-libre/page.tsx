'use client';

import { useEffect, useState } from 'react';
import { crearRegistro, getCatalogos, labelOf } from '@/lib/api';
import type { Catalogos, RegistroInput } from '@/lib/types';

const emptyCatalogos: Catalogos = { profesores: [], preceptores: [], cursos: [], materias: [], motivos: [] };

function today() { return new Date().toISOString().slice(0, 10); }
function nowTime() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function initialForm(): RegistroInput { return { fecha: today(), hora: nowTime(), preceptor: '', profesor_ausente: '', materia: '', curso: '', turno: '', motivo: '', observaciones: '' }; }

export default function CargarHoraLibrePage() {
  const [catalogos, setCatalogos] = useState<Catalogos>(emptyCatalogos);
  const [form, setForm] = useState<RegistroInput>(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { getCatalogos().then(setCatalogos).catch((err) => setError(err.message)); }, []);

  function update<K extends keyof RegistroInput>(key: K, value: RegistroInput[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      await crearRegistro(form);
      setMessage('Registro guardado correctamente.');
      setForm(initialForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally { setSaving(false); }
  }

  return (
    <section className="grid gap-5">
      <h2 className="text-2xl font-bold">Cargar hora libre</h2>
      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>}
      {message && <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">{message}</div>}
      <form className="grid gap-4 rounded border bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-3" onSubmit={submit}>
        <Field label="Fecha"><input className="rounded border px-3 py-2" type="date" value={form.fecha} onChange={(e) => update('fecha', e.target.value)} required /></Field>
        <Field label="Hora"><input className="rounded border px-3 py-2" type="time" value={form.hora} onChange={(e) => update('hora', e.target.value)} required /></Field>
        <Select label="Preceptor" value={form.preceptor} options={catalogos.preceptores} onChange={(v) => update('preceptor', v)} />
        <Select label="Profesor ausente" value={form.profesor_ausente} options={catalogos.profesores} onChange={(v) => update('profesor_ausente', v)} />
        <Select label="Materia" value={form.materia} options={catalogos.materias} onChange={(v) => update('materia', v)} />
        <Select label="Curso" value={form.curso} options={catalogos.cursos} onChange={(v) => update('curso', v)} />
        <Field label="Turno"><input className="rounded border px-3 py-2" value={form.turno} onChange={(e) => update('turno', e.target.value)} required /></Field>
        <Select label="Motivo" value={form.motivo} options={catalogos.motivos} onChange={(v) => update('motivo', v)} />
        <label className="grid gap-2 text-sm font-medium md:col-span-2 lg:col-span-3">Observaciones<textarea className="min-h-24 rounded border px-3 py-2" value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} /></label>
        <button className="w-fit rounded bg-slate-950 px-4 py-2 font-semibold text-white" disabled={saving}>{saving ? 'Guardando...' : 'Guardar registro'}</button>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-medium">{label}{children}</label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: unknown[]; onChange: (value: string) => void }) { return <Field label={label}><select className="rounded border bg-white px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} required><option value="">Seleccionar</option>{options.map((o, i) => { const label = labelOf(o); return <option key={label + i} value={label}>{label}</option>; })}</select></Field>; }
