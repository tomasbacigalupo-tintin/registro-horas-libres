# registro-horas-libres

Aplicacion para registrar y consultar horas libres en una institucion educativa.

## Stack

- Frontend: Next.js, TypeScript, App Router y Tailwind.
- Graficos: Recharts.
- Backend: Google Apps Script desplegado como Web App.
- Persistencia: Google Sheets.

No usa SQL ni backend Node.

## Estructura

- `frontend/`: app web para Vercel.
- `apps-script/`: backend para Google Apps Script.
- `docs/`: documentacion tecnica y despliegue.

## Instalacion local

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Configurar:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbytlyec9aZAPLoHIc-uYylyYn8NyvrWqT2igGi0IKvrCgzhfgQeoUnO36f-g7tqfev_6w/exec
```

La aplicación usa internamente `/api/gas` para evitar CORS con Google Apps Script.

## Vercel

Al importar el repo en Vercel:

- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`

Variable de entorno:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbytlyec9aZAPLoHIc-uYylyYn8NyvrWqT2igGi0IKvrCgzhfgQeoUnO36f-g7tqfev_6w/exec
```
