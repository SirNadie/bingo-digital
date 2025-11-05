# 0001 - Contexto inicial

- Estado: Aprobado
- Fecha: 2025-11-05
- Alcance: Configuracion de contexto Codex, catalogo de stack y reglas iniciales

## Contexto
- El repositorio contiene dos paquetes principales:
  - `dino-web/`: frontend React 19 + TypeScript, empaquetado con Vite 7 y Axios para llamadas HTTP.
  - `dino-api/`: backend FastAPI 0.115 con SQLModel sobre SQLite (`sqlite:///./dino.db`) y tareas asincronas para gestionar juegos y billeteras.
- `.codexrc.json` ya fuerza modo diff y auto-contexto, pero los archivos referenciados no existian.
- No se detectan integraciones adicionales: sin Tailwind, sin i18n, sin Prisma ni sistemas de migracion. Estilos definidos manualmente en `src/index.css`.

## Decision
- Crear `codex.context.md`, `codex.rules.md` y este ADR para dejar registro del stack, las reglas de colaboracion y el estado inicial del proyecto.
- Establecer que cualquier cambio futuro debe respetar DIFF-only, documentar impacto en configuraciones sensibles y seguir la estructura actual (React + TypeScript en frontend, FastAPI + SQLModel en backend).
- Registrar que la base de datos por defecto es SQLite y que los despliegues deben parametrizar `DATABASE_URL` en caso de usar motores diferentes.

## Consecuencias
- Auto-contexto de Codex queda operativo con descripciones claras del stack y las reglas.
- Existe un punto de referencia para evaluar cambios posteriores en front, back y base de datos.
- Se resalta la ausencia de un motor de migraciones; futuros trabajos deben considerar introducir Alembic (o equivalente) y documentar el proceso.

## Plan de rollback
- Eliminar `codex.context.md`, `codex.rules.md` y `docs/decisions/0001-contexto-inicial.md`.
- Opcionalmente actualizar `.codexrc.json` para retirar las referencias a los archivos si se desea volver al estado previo, aunque el archivo no se modifico en esta iteracion.
