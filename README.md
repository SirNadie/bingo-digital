## Dino Bingo (Monorepo)

### Desarrollo con un solo comando
- En Windows (PowerShell): `./dev.ps1`
- En Windows (CMD): `dev.bat`

El script:
- Prepara el backend (crea `.venv` si hace falta e instala `requirements.txt`).
- Instala dependencias del frontend si no existen.
- Arranca API (`http://localhost:8000`) y web (`http://localhost:5173`).

Parámetros:
- `./dev.ps1 -NoInstall` omite instalaciones (asume entornos ya listos).

### Estructura
- `dino-api`: FastAPI + SQLModel (SQLite por defecto).
- `dino-web`: Vite + React.

### Alternativa manual
1) API: `cd dino-api && ./.venv/Scripts/uvicorn.exe app.main:app --reload`
2) Web: `cd dino-web && npm run dev`

