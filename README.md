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
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbxdgrnwqGjMYKf3rQHgzBFoQNGpDhSG3MItypm2FURJI4zEp3wjAHPSAFbhBGJ_uvhpDg/exec
```

## Vercel

Al importar el repo en Vercel:

- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`

Variable de entorno:

```env
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbxdgrnwqGjMYKf3rQHgzBFoQNGpDhSG3MItypm2FURJI4zEp3wjAHPSAFbhBGJ_uvhpDg/exec
```
