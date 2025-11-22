## Dino Bingo (Monorepo)

### Desarrollo

**Linux / macOS:**
```bash
./dev.sh
```
Este script preparará el entorno (Python venv, node_modules) y arrancará ambos servidores.

**Windows:**
1. Backend:
   ```powershell
   cd dino-api
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2. Frontend:
   ```powershell
   cd dino-web
   npm install
   npm run dev
   ```

### Estructura
- `dino-api`: FastAPI + SQLModel (SQLite por defecto).
- `dino-web`: Vite + React.

### Alternativa manual
1) API: `cd dino-api && ./.venv/Scripts/uvicorn.exe app.main:app --reload`
2) Web: `cd dino-web && npm run dev`

