'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getRegistros } from '@/lib/api';
import type { Registro } from '@/lib/types';
import { RegistroTable } from '../registros/page';

type Filters = { desde: string; hasta: string; profesor: string; preceptor: string; curso: string };
const empty: Filters = { desde: '', hasta: '', profesor: '', preceptor: '', curso: '' };
const colors = ['#047857', '#0369a1', '#b45309', '#be123c', '#6d28d9', '#475569'];

export default function DashboardPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [filters, setFilters] = useState<Filters>(empty);
  const [error, setError] = useState('');
  useEffect(() => { getRegistros().then(setRegistros).catch((err) => setError(err.message)); }, []);

  const filtered = useMemo(() => registros.filter((r) => (!filters.desde || r.fecha >= filters.desde) && (!filters.hasta || r.fecha <= filters.hasta) && (!filters.profesor || r.profesor_ausente === filters.profesor) && (!filters.preceptor || r.preceptor === filters.preceptor) && (!filters.curso || r.curso === filters.curso)), [registros, filters]);
  const profesores = unique(registros, 'profesor_ausente');
  const preceptores = unique(registros, 'preceptor');
  const cursos = unique(registros, 'curso');
  const porProfesor = count(filtered, 'profesor_ausente');
  const porPreceptor = count(filtered, 'preceptor');
  const porCurso = count(filtered, 'curso');
  const porMateria = count(filtered, 'materia');
  const porMes = countMonth(filtered);
  const total = filtered.length;
  const porcentajeProfesores = porProfesor.map((x) => ({ ...x, porcentaje: total ? Number(((x.total / total) * 100).toFixed(1)) : 0 }));

  return (
    <section className="grid gap-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>}
      <div className="grid gap-4 rounded border bg-white p-4 md:grid-cols-2 lg:grid-cols-5">
        <Input label="Desde" type="date" value={filters.desde} onChange={(v) => setFilters({ ...filters, desde: v })} />
        <Input label="Hasta" type="date" value={filters.hasta} onChange={(v) => setFilters({ ...filters, hasta: v })} />
        <Select label="Profesor" value={filters.profesor} options={profesores} onChange={(v) => setFilters({ ...filters, profesor: v })} />
        <Select label="Preceptor" value={filters.preceptor} options={preceptores} onChange={(v) => setFilters({ ...filters, preceptor: v })} />
        <Select label="Curso" value={filters.curso} options={cursos} onChange={(v) => setFilters({ ...filters, curso: v })} />
        <button className="w-fit rounded border px-3 py-2 text-sm font-semibold" onClick={() => setFilters(empty)}>Limpiar</button>
      </div>
      <div className="grid gap-4 md:grid-cols-4"><Card label="Total horas libres" value={total} /><Card label="Profesores" value={porProfesor.length} /><Card label="Preceptores" value={porPreceptor.length} /><Card label="Cursos" value={porCurso.length} /></div>
      <div className="grid gap-4 lg:grid-cols-2"><Ranking title="Profesores con mas horas libres" data={porProfesor} /><Ranking title="Preceptores con mas horas cubiertas" data={porPreceptor} /></div>
      <div className="grid gap-4 lg:grid-cols-2"><Chart title="Horas libres por mes" data={porMes} kind="line" /><Chart title="Horas libres por curso" data={porCurso} kind="bar" /><Chart title="Horas libres por materia" data={porMateria} kind="bar" /><PieCard title="Porcentaje por profesor" data={porcentajeProfesores} /></div>
      <RegistroTable registros={filtered.slice(0, 10)} />
    </section>
  );
}

function unique(registros: Registro[], key: keyof Registro) { return Array.from(new Set(registros.map((r) => String(r[key] || '')).filter(Boolean))).sort(); }
function count(registros: Registro[], key: keyof Registro) { const map = new Map<string, number>(); registros.forEach((r) => { const name = String(r[key] || 'Sin dato'); map.set(name, (map.get(name) || 0) + 1); }); return Array.from(map, ([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total); }
function countMonth(registros: Registro[]) { const map = new Map<string, number>(); registros.forEach((r) => { const name = String(r.fecha || '').slice(0, 7) || 'Sin fecha'; map.set(name, (map.get(name) || 0) + 1); }); return Array.from(map, ([name, total]) => ({ name, total })).sort((a, b) => a.name.localeCompare(b.name)); }
function Card({ label, value }: { label: string; value: number }) { return <article className="rounded border bg-white p-4 shadow-sm"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>; }
function Ranking({ title, data }: { title: string; data: { name: string; total: number }[] }) { return <article className="rounded border bg-white p-4 shadow-sm"><h3 className="font-semibold">{title}</h3><div className="mt-3 grid gap-2">{data.slice(0, 8).map((x) => <div className="flex justify-between gap-3" key={x.name}><span>{x.name}</span><strong>{x.total}</strong></div>)}</div></article>; }
function Chart({ title, data, kind }: { title: string; data: { name: string; total: number }[]; kind: 'line' | 'bar' }) { return <article className="rounded border bg-white p-4 shadow-sm"><h3 className="mb-4 font-semibold">{title}</h3><ResponsiveContainer width="100%" height={260}>{kind === 'line' ? <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="total" stroke="#047857" strokeWidth={3} /></LineChart> : <BarChart data={data.slice(0, 12)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#0369a1" /></BarChart>}</ResponsiveContainer></article>; }
function PieCard({ title, data }: { title: string; data: { name: string; porcentaje: number }[] }) { return <article className="rounded border bg-white p-4 shadow-sm"><h3 className="mb-4 font-semibold">{title}</h3><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={data.slice(0, 8)} dataKey="porcentaje" nameKey="name" outerRadius={90} label>{data.slice(0, 8).map((x, i) => <Cell key={x.name} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></article>; }
function Input({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (value: string) => void }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded border px-3 py-2" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="grid gap-2 text-sm font-medium">{label}<select className="rounded border bg-white px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}><option value="">Todos</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>; }
