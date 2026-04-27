import Link from 'next/link';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Registro de Horas Libres' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl font-bold">Registro de Horas Libres</h1>
            <nav className="flex flex-wrap gap-2 text-sm font-semibold">
              <Link className="rounded border px-3 py-2" href="/dashboard">Dashboard</Link>
              <Link className="rounded border px-3 py-2" href="/cargar-hora-libre">Cargar hora libre</Link>
              <Link className="rounded border px-3 py-2" href="/registros">Registros</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
