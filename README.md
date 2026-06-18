# AutoClocking Frontend

Frontend en SolidJS para administrar y visualizar el ecosistema de AutoClocking. La app expone tres vistas principales: marcajes, RUTs y healthcheck/feriados.

## Proposito

Sirve como interfaz operativa para:

- Ver el historial de marcajes automáticos.
- Administrar RUTs activos e inactivos.
- Revisar feriados y el estado de cumplimiento de los ultimos dias laborales.

## Arquitectura

```text
Browser
  |
  v
SolidJS app
  |
  +--> GET /marcajes  -> backend Go
  +--> GET/POST/PATCH/DELETE /ruts -> backend Go
  +--> GET feriados   -> api.boostr.cl
```

La UI usa SolidJS con `@tanstack/solid-query` para leer datos remotos y mantener el estado de carga/refresco en la interfaz. El enrutado es interno por pestañas dentro de `App.tsx`.

## Funcionamiento

- `Marcajes` muestra el feed operativo del backend.
- `RUTs` permite crear, activar, desactivar y borrar RUTs.
- `Feriados` lista los proximos feriados disponibles desde la API publica.
- `Healthcheck` resume dias laborales con colores tipo uptime.

## Variables de entorno

Copiar `.env.example` y ajustar si se quiere cambiar endpoints:

```bash
VITE_MARCAJES_API_URL=https://marcajes-vg7vvkcauq-ue.a.run.app/marcajes
VITE_RUTS_API_URL=https://autoclocking-ruts-vg7vvkcauq-ue.a.run.app/ruts
VITE_HOLIDAYS_API_URL=https://api.boostr.cl/holidays.json
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Maintainer

Camilo Gonzalez <camilo@camiloengineer.com>
