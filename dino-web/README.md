## Dino Web (Vite + React)

### Iniciar todo con un comando
- Desde la raíz del repo: `./dev.ps1` (PowerShell) o `dev.bat` (CMD).

### Variables de entorno
- Edita `.env` (ya está creado):
  - `VITE_API_URL=http://localhost:8000` (o donde corra la API).

### Ejecutar
1) Inicia la API (en `dino-api`):
   - `./.venv/Scripts/uvicorn.exe app.main:app --reload` (Windows) o `uvicorn app.main:app --reload`.
2) Inicia el frontend (en `dino-web`):
   - `npm run dev` y abre la URL que te muestre Vite (típicamente `http://localhost:5173`).

### Notas de UI
- El punto de entrada es `src/App.tsx` (antes `App2.tsx`).
- La app permite: login, crear partidas, recargar saldo, comprar tickets, ver tus tickets y, si eres creador y se alcanza el mínimo de cartones, iniciar la partida.

### Flujo para probar
- En la UI, pulsa “Entrar” (login). El backend creará el usuario automáticamente si no existe (modo dev).
- Crea partidas con el botón “Crear”.
- La lista de partidas se refresca desde la API real.
