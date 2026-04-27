# Guia de despliegue

## Google Apps Script

1. Abrir la planilla de Google Sheets.
2. Ir a `Extensiones > Apps Script`.
3. Pegar `apps-script/Code.gs`.
4. Reemplazar `PEGAR_ID_DE_GOOGLE_SHEETS` por el ID real de la planilla.
5. Ir a `Implementar > Nueva implementacion`.
6. Elegir `Aplicacion web`.
7. Ejecutar como `Yo`.
8. Acceso: `Cualquier usuario` o `Cualquier usuario con el enlace`.
9. Copiar la URL terminada en `/exec`.

## Vercel

- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`

Variable:

```env
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbxdgrnwqGjMYKf3rQHgzBFoQNGpDhSG3MItypm2FURJI4zEp3wjAHPSAFbhBGJ_uvhpDg/exec
```
