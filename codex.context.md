# Contexto Tecnico

## Panorama del repositorio
- Monorepo con frontend `dino-web/` (React 19 + Vite 7 + TypeScript) y backend `dino-api/` (FastAPI + SQLModel).
- Documentacion base en `README.md`; cada paquete (`dino-web/`, `dino-api/`) aporta su propio README.
- `.codexrc.json` ya fuerza auto-contexto y modo diff para cualquier cambio.

## Frontend `dino-web/`
- Tooling: Vite 7.1 con `@vitejs/plugin-react` y TypeScript 5.9 (configs en `tsconfig*.json`).
- Runtime: React 19, React DOM 19 y Axios para comunicar la API.
- Estilos globales en `src/index.css`; no hay Tailwind ni PostCSS. Se utilizan utilidades simples (`.stack`, `.card`, `.board`).
- Scripts npm: `dev`, `build`, `preview` (via Vite). Presencia de `package-lock.json` indica flujo npm.
- Entrada: `src/main.tsx` crea el arbol React y `App.tsx` administra UI, estado y llamadas HTTP.

## Backend `dino-api/`
- Framework: FastAPI 0.115 junto a Uvicorn para servir la app ASGI (`app/main.py`).
- Persistencia: SQLModel (sobre SQLAlchemy) via `app/core/database.py`; URL por entorno `DATABASE_URL` con default `sqlite:///./dino.db`.
- Modelado: entidades en `app/models/`, esquemas Pydantic en `app/schemas.py`, routers en `app/routers/`.
- Seguridad: modulo `auth` usa `bcrypt` para hashing y tokens JWT.
- Tareas de fondo: `_housekeeper` ejecuta cada 60s para gestionar autostart, cancelaciones y reembolsos.

## Datos y migraciones
- Base de datos local SQLite (`dino-api/dino.db`). En entornos limpios se puede borrar el archivo o definir `DATABASE_URL` antes de arrancar.
- No existe sistema de migraciones; futuros cambios deberian introducir Alembic/SQLModel y documentar en nuevos ADR junto a plan de rollback.

## Infraestructura y operacion
- Desarrollo: `npm run dev` en `dino-web/` y `uvicorn app.main:app --reload` en `dino-api/`.
- CORS configurable en `app/core/config.py` (`CORS_ORIGINS`) para habilitar origenes permitidos.
- No se detectan integraciones con i18n, Tailwind, Prisma ni plataformas de despliegue automatico.

## Convenciones de estilo
- Frontend: mantener componentes en TypeScript, estado con hooks y llamadas HTTP centralizadas en `src/api/http.ts` (incluye token desde `localStorage`).
- Backend: reutilizar sesiones via `app/core/database.py`, responder con modelos Pydantic y encapsular reglas en routers.
