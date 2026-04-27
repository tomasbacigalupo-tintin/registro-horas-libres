# registro-horas-libres

Proyecto para registrar horas libres en una institución educativa.

## Estructura

```text
registro-horas-libres/
├── frontend/
├── apps-script/
└── docs/
```

## Stack

- Frontend: Next.js, TypeScript, App Router, Tailwind.
- Backend: Google Apps Script.
- Persistencia: Google Sheets.

## Configuración rápida

1. Crear una planilla de Google Sheets.
2. Abrir Extensiones > Apps Script.
3. Copiar `apps-script/Code.gs` y `apps-script/appsscript.json`.
4. Ejecutar `setup()` una vez.
5. Completar la hoja `Opciones` con filas tipo/valor. Tipos válidos: `turnos`, `cursos`, `divisiones`, `materias`, `docentes`, `horas`.
6. Publicar como Web App.
7. Copiar la URL en `frontend/.env.local`:

```env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```
