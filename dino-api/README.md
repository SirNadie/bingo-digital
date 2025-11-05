Dino Bingo API

CÃ³mo ejecutar
- Entrar al directorio `dino-api`.
- Usar el entorno virtual ya presente (`.venv`) o crear uno nuevo.
- Instalar dependencias (si hiciera falta): `pip install fastapi uvicorn sqlmodel bcrypt`.
- Iniciar el servidor:
  - Windows (PowerShell): `./.venv/Scripts/uvicorn.exe app.main:app --reload`
  - O genÃ©rico: `uvicorn app.main:app --reload`

Config
- `DATABASE_URL` (opcional): por defecto `sqlite:///./dino.db`.
- `SECRET_KEY` (opcional): clave para firmar JWT (por defecto dev).
- `ACCESS_TOKEN_EXPIRE_MINUTES` (opcional): minutos de expiraciÃ³n JWT (60 por defecto).
- `CORS_ORIGINS` (opcional): lista separada por comas o `*` para permitir todo.
- `AUTO_REGISTER_ON_LOGIN` (opcional): `true` en dev para crear usuario en el primer login.

AutenticaciÃ³n (JWT)
- Registro: `POST /auth/register` body `{ "email": "user@dominio", "password": "..." }` â‡’ devuelve `{ access_token, token_type }`.
- Login: `POST /auth/login` mismo body â‡’ devuelve token JWT.
- Usar el token: enviar `Authorization: Bearer <token>` en endpoints protegidos (p.ej. `POST /games`).
- Perfil: `GET /auth/me` â‡’ devuelve `{ id, email, balance }`.

Endpoints de juegos
- `GET /games`: lista juegos (query opcional `status`).
- `POST /games`: crea un juego (requiere `Authorization`). Regla: 1 partida activa por creador.
 - `POST /games/{game_id}/start`: inicia la partida (creador, con mínimo alcanzado).
 - `GET /games/{game_id}/state`: estado de la partida (números sorteados, flags de premios).
 - `POST /games/{game_id}/draw`: sortea el próximo número y paga premios.

Tickets
- `POST /tickets/games/{game_id}`: compra ticket para un juego (requiere `Authorization`). Body `{ "numbers": [[...5], ... x5] }`.
- `GET /tickets/me`: lista mis tickets.

Usar con el frontend
- Asegúrate de que `dino-web/.env` tenga `VITE_API_URL` apuntando a esta API.
- Lanza el frontend con `npm run dev` en `dino-web` y prueba login/crear partidas.
  - En la UI actual (App), puedes recargar saldo y comprar tickets con botones directos.

Notas
- Los modelos crean las tablas `users`, `wallets`, `games`, `tickets`.
- Si agregas nuevos campos (sorteo/pagos) y ya existe `dino.db`, elimina `dino.db` y arranca de nuevo.
- Si ya tenÃ­as `dino.db` de antes, para aplicar nuevos Ã­ndices/unique, elimina `dino.db` y arranca de nuevo.

