'use client';

import { useEffect, useMemo, useState } from 'react';
import { crearRegistro, getCatalogos, labelOf } from '@/lib/api';
import type { BaseCatalogItem, Catalogos, ProfesorMateria, RegistroInput } from '@/lib/types';

const emptyCatalogos: Catalogos = { profesores: [], preceptores: [], cursos: [], materias: [], motivos: [], profesores_materias: [] };

function today() { return new Date().toISOString().slice(0, 10); }
function nowTime() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function nowIso() { return new Date().toISOString(); }
function initialForm(): RegistroInput { return { fecha: today(), hora: nowTime(), preceptor: '', profesor_ausente: '', materia: '', curso: '', turno: '', motivo: '', observaciones: '', created_at: nowIso() }; }
function uniqueBy<T>(values: T[], getKey: (value: T) => string) { return Array.from(new Map(values.map((value) => [getKey(value), value])).values()); }
function normalize(value: string) { return value.trim().toLowerCase(); }
function formatProfesorLabel(profesor: BaseCatalogItem) { return profesor.nombre || profesor.id || ''; }
function formatOption(option: { nombre?: string; id?: string }) { return option.nombre || option.id || ''; }
function getProfesorId(profesor: BaseCatalogItem) { return profesor.id || profesor.nombre || ''; }

export default function CargarHoraLibrePage() {
  const [catalogos, setCatalogos] = useState<Catalogos>(emptyCatalogos);
  const [form, setForm] = useState<RegistroInput>(initialForm);
  const [selectedProfesorId, setSelectedProfesorId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { getCatalogos().then(setCatalogos).catch((err) => setError(err.message)); }, []);

  const profesores = useMemo(() => catalogos.profesores.filter((profesor) => {
    const profesorId = getProfesorId(profesor);
    return catalogos.profesores_materias.some((item) => item.profesor_id === profesorId || normalize(item.profesor_nombre) === normalize(formatProfesorLabel(profesor)));
  }), [catalogos]);

  const selectedProfesor = useMemo(
    () => profesores.find((profesor) => getProfesorId(profesor) === selectedProfesorId) || null,
    [profesores, selectedProfesorId]
  );

  const assignmentsForProfessor = useMemo(() => {
    if (!selectedProfesorId || !selectedProfesor) return [];
    const profesorLabel = formatProfesorLabel(selectedProfesor);
    return catalogos.profesores_materias.filter((item) => item.profesor_id === selectedProfesorId || normalize(item.profesor_nombre) === normalize(profesorLabel));
  }, [catalogos.profesores_materias, selectedProfesor, selectedProfesorId]);

  const materiaOptions = useMemo(() => uniqueBy(
    assignmentsForProfessor
      .filter((item) => !form.curso || item.curso === form.curso)
      .map((item) => ({ id: item.materia, nombre: item.materia })),
    (item) => item.id || item.nombre || ''
  ), [assignmentsForProfessor, form.curso]);

  const cursoOptions = useMemo(() => uniqueBy(
    assignmentsForProfessor
      .filter((item) => !form.materia || item.materia === form.materia)
      .map((item) => ({ id: item.curso, nombre: item.curso })),
    (item) => item.id || item.nombre || ''
  ), [assignmentsForProfessor, form.materia]);

  useEffect(() => {
    if (!selectedProfesorId) return;

    setForm((current) => {
      let next = current;
      const onlyMateria = materiaOptions.length === 1 ? formatOption(materiaOptions[0]) : '';
      const onlyCurso = cursoOptions.length === 1 ? formatOption(cursoOptions[0]) : '';

      if (current.materia && !materiaOptions.some((item) => formatOption(item) === current.materia)) next = { ...next, materia: '', turno: '' };
      if (current.curso && !cursoOptions.some((item) => formatOption(item) === current.curso)) next = { ...next, curso: '', turno: '' };
      if (!next.materia && onlyMateria) next = { ...next, materia: onlyMateria };
      if (!next.curso && onlyCurso) next = { ...next, curso: onlyCurso };

      const match = resolveAssignment(assignmentsForProfessor, next.materia, next.curso);
      if (match && next.turno !== match.turno) next = { ...next, turno: match.turno };
      if (!match && next.turno) next = { ...next, turno: '' };

      return next;
    });
  }, [assignmentsForProfessor, cursoOptions, materiaOptions, selectedProfesorId]);

  function update<K extends keyof RegistroInput>(key: K, value: RegistroInput[K]) { setForm((current) => ({ ...current, [key]: value })); }

  function validate(current: RegistroInput) {
    if (!current.preceptor) return 'El preceptor es requerido.';
    if (!current.profesor_ausente) return 'El profesor ausente es requerido.';
    if (!current.materia) return 'La materia es requerida.';
    if (!current.curso) return 'El curso es requerido.';
    if (!current.motivo) return 'El motivo es requerido.';
    if (!current.turno) return 'El turno no puede quedar vacio.';
    if (!current.fecha || !current.hora) return 'Fecha y hora son requeridas.';
    return '';
  }

  function handleProfesorChange(profesorId: string) {
    const profesor = profesores.find((item) => getProfesorId(item) === profesorId);
    setSelectedProfesorId(profesorId);
    setForm((current) => ({
      ...current,
      profesor_ausente: profesor ? formatProfesorLabel(profesor) : '',
      materia: '',
      curso: '',
      turno: ''
    }));
  }

  function handleMateriaChange(materia: string) {
    setForm((current) => {
      const currentCursoStillValid = assignmentsForProfessor.some((item) => item.materia === materia && item.curso === current.curso);
      const next = { ...current, materia, curso: currentCursoStillValid ? current.curso : '', turno: '' };
      const match = resolveAssignment(assignmentsForProfessor, materia, next.curso);
      return { ...next, turno: match?.turno || '' };
    });
  }

  function handleCursoChange(curso: string) {
    setForm((current) => {
      const currentMateriaStillValid = assignmentsForProfessor.some((item) => item.curso === curso && item.materia === current.materia);
      const next = { ...current, curso, materia: currentMateriaStillValid ? current.materia : '', turno: '' };
      const match = resolveAssignment(assignmentsForProfessor, next.materia, curso);
      return { ...next, turno: match?.turno || '' };
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...form, created_at: nowIso() };
    const validationError = validate(payload);
    if (validationError) {
      setError(validationError);
      setMessage('');
      return;
    }

    setSaving(true); setError(''); setMessage('');
    try {
      await crearRegistro(payload);
      setMessage('Registro guardado correctamente.');
      setForm(initialForm());
      setSelectedProfesorId('');
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
        <Field label="Profesor ausente">
          <select className="rounded border bg-white px-3 py-2" value={selectedProfesorId} onChange={(e) => handleProfesorChange(e.target.value)} required>
            <option value="">Seleccionar</option>
            {profesores.map((profesor) => {
              const profesorId = getProfesorId(profesor);
              const label = formatProfesorLabel(profesor);
              return <option key={profesorId || label} value={profesorId}>{label}</option>;
            })}
          </select>
        </Field>
        <Select label="Materia" value={form.materia} options={materiaOptions} onChange={handleMateriaChange} disabled={!selectedProfesorId} />
        <Select label="Curso" value={form.curso} options={cursoOptions} onChange={handleCursoChange} disabled={!selectedProfesorId} />
        <Field label="Turno"><input className="rounded border bg-slate-50 px-3 py-2" value={form.turno} readOnly required /></Field>
        <Select label="Motivo" value={form.motivo} options={catalogos.motivos} onChange={(v) => update('motivo', v)} />
        <label className="grid gap-2 text-sm font-medium md:col-span-2 lg:col-span-3">Observaciones<textarea className="min-h-24 rounded border px-3 py-2" value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} /></label>
        <button className="w-fit rounded bg-slate-950 px-4 py-2 font-semibold text-white" disabled={saving}>{saving ? 'Guardando...' : 'Guardar registro'}</button>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-medium">{label}{children}</label>; }

function resolveAssignment(assignments: ProfesorMateria[], materia: string, curso: string) {
  const filtered = assignments.filter((item) => (!materia || item.materia === materia) && (!curso || item.curso === curso));
  return filtered.length === 1 ? filtered[0] : null;
}

function Select({ label, value, options, onChange, disabled = false }: { label: string; value: string; options: unknown[]; onChange: (value: string) => void; disabled?: boolean }) { return <Field label={label}><select className="rounded border bg-white px-3 py-2 disabled:bg-slate-100" value={value} onChange={(e) => onChange(e.target.value)} required disabled={disabled}><option value="">Seleccionar</option>{options.map((o, i) => { const optionLabel = labelOf(o); return <option key={optionLabel + i} value={optionLabel}>{optionLabel}</option>; })}</select></Field>; }
