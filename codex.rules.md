# Reglas Codex

## Modo de trabajo
- Respetar DIFF-only: solo cambios incrementales y justificados; evitar regenerar archivos completos.
- Antes de proponer cambios leer `codex.context.md`, este archivo, `.codexrc.json` y los ADR en `docs/decisions/`.
- Documentar siempre impacto y plan de rollback previo a tocar configuraciones de build, rutas, i18n o base de datos.
- Mantener trazabilidad: cuando una decision afecte arquitectura o datos, agregar un ADR nuevo en `docs/decisions/`.

## Frontend `dino-web/`
- Trabajar en TypeScript y React 19 siguiendo hooks y modulos existentes.
- Centralizar peticiones HTTP en `src/api/http.ts`; actualizar tokens y manejo de errores en un solo lugar.
- Mantener estilo CSS simple; si se introducen utilidades nuevas, documentarlas y evitar dependencias globales no justificadas.

## Backend `dino-api/`
- Exponer rutas via FastAPI routers (`app/routers/`) y modelos SQLModel; no modificar `init_db()` sin plan de datos.
- Cualquier cambio que afecte `DATABASE_URL`, esquema SQLModel o el archivo SQLite requiere pasos de migracion y rollback documentados.
- Mantener tareas de fondo con cuidado: envolver cambios en try/except y evitar bloqueos que afecten el loop async.

## Herramientas y entregables
- `npm` es el gestor soportado (se versiona `package-lock.json`); no mezclar `yarn` o `pnpm` sin alinear al equipo.
- Dependencias Python se gestionan via `requirements.txt`; si se modifican, indicar comando de instalacion y versionado.
- Antes de entregar, ejecutar linters o pruebas disponibles y mencionar comandos pendientes si no pudieron correrse.
