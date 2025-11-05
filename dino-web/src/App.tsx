import { useEffect, useMemo, useState } from "react";
import api from "./api/http";

type Game = {
  id: string;
  creator_id: string;
  price: number;
  status: string;
  sold_tickets: number;
  min_tickets: number;
};

type Ticket = {
  id: string;
  game_id: string;
  user_id: string;
  numbers: number[][];
};

  type Me = { id: string; email: string; balance: number; alias?: string };

  type GameState = {
    id: string;
    status: string;
    price: number;
    min_tickets: number;
    sold_tickets: number;
    drawn_numbers: number[];
    paid_diagonal: boolean;
    paid_line: boolean;
    paid_bingo: boolean;
  };

export default function App() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("12345678");
  const [games, setGames] = useState<Game[]>([]);
  const [price, setPrice] = useState(0.5);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoThreshold, setAutoThreshold] = useState<number | undefined>(undefined);
  const [autoDelay, setAutoDelay] = useState<number | undefined>(undefined);
  const [msg, setMsg] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const [topupAmount, setTopupAmount] = useState(5);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [errors, setErrors] = useState<string>("");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const logged = !!localStorage.getItem("token");
  const canCreate = useMemo(() => logged && price >= 0.5, [logged, price]);
  const canTopup = useMemo(() => logged && topupAmount > 0, [logged, topupAmount]);
  const emailOk = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const passwordOk = useMemo(() => password.length >= 6, [password]);
  const canLogin = emailOk && passwordOk;

  async function login() {
    setErrors("");
    if (!canLogin) {
      setErrors("Email o contraseña inválidos (min 6 caracteres)");
      return;
    }
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    setMsg("Logueado");
    await fetchMe();
    await fetchTickets();
    fetchGames();
  }

  async function fetchGames() {
    const res = await api.get("/games");
    setGames(res.data.items);
  }

  async function fetchMe() {
    try {
      const res = await api.get("/auth/me");
      setMe({ id: res.data.id, email: res.data.email, balance: res.data.balance, alias: res.data.alias });
    } catch {
      setMe(null);
    }
  }

  async function fetchTickets() {
    try {
      const { data } = await api.get<Ticket[]>("/tickets/me");
      setTickets(data);
    } catch {
      setTickets([]);
    }
  }

  async function createGame() {
    try {
      if (!canCreate) return;
      const res = await api.post("/games", {
        price,
        autostart_enabled: autoEnabled,
        autostart_threshold: autoThreshold,
        autostart_delay_minutes: autoDelay,
      });
      setMsg(`Partida creada: ${res.data.id}`);
      fetchGames();
    } catch (e: any) {
      setMsg(e?.response?.data || "Error al crear partida");
    }
  }

  async function draw(gameId: string) {
    try {
      const { data } = await api.post(`/games/${gameId}/draw`);
      setMsg(`Salió el ${data.number}. Premios: D:${data.paid_diagonal ? '✔' : '✗'} L:${data.paid_line ? '✔' : '✗'} B:${data.paid_bingo ? '✔' : '✗'}`);
      await fetchMe();
      await fetchGames();
      await fetchTickets();
    } catch (e: any) {
      setMsg(e?.response?.data || "No se pudo sortear");
    }
  }

  function randomMatrix(): number[][] {
    const m: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const row: number[] = [];
      for (let j = 0; j < 5; j++) {
        row.push(Math.floor(Math.random() * 75) + 1);
      }
      m.push(row);
    }
    return m;
  }

  async function fetchGameState(gameId: string) {
    try {
      const { data } = await api.get(`/games/${gameId}/state`);
      setGameState(data as any);
    } catch {
      setGameState(null);
    }
  }

  async function buyTicket(gameId: string) {
    try {
      const numbers = randomMatrix();
      await api.post(`/tickets/games/${gameId}`, { numbers });
      setMsg("Ticket comprado");
      await fetchMe();
      await fetchTickets();
      await fetchGames();
    } catch (e: any) {
      setMsg(e?.response?.data || "Error al comprar ticket");
    }
  }

  async function topup() {
    try {
      if (!canTopup) return;
      const { data } = await api.post(`/wallet/topup`, { amount: topupAmount });
      setMsg(`Saldo: $${data.balance.toFixed(2)}`);
      await fetchMe();
    } catch (e: any) {
      setMsg(e?.response?.data || "Error al recargar");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setMe(null);
    setTickets([]);
    setMsg("Sesión cerrada");
  }

  useEffect(() => {
    fetchGames();
    if (logged) {
      fetchMe();
      fetchTickets();
    }
  }, []);

  useEffect(() => {
    if (!selectedGameId || !autoRefresh) return;
    const t = setInterval(() => fetchGameState(selectedGameId), 3000);
    return () => clearInterval(t);
  }, [selectedGameId, autoRefresh]);

  function BingoBoard({ drawn }: { drawn: Set<number> }) {
    const cols = [
      Array.from({ length: 15 }, (_, i) => i + 1),
      Array.from({ length: 15 }, (_, i) => i + 16),
      Array.from({ length: 15 }, (_, i) => i + 31),
      Array.from({ length: 15 }, (_, i) => i + 46),
      Array.from({ length: 15 }, (_, i) => i + 61),
    ];
    const letters = ["B", "I", "N", "G", "O"];
    return (
      <div className="stack">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          {letters.map((L, idx) => (
            <div key={idx} style={{ width: "100%" }}>
              <div className="muted" style={{ textAlign: "center", marginBottom: 4 }}>{L}</div>
              <div className="board">
                {cols[idx].map((n) => (
                  <div key={n} className={`cell ${drawn.has(n) ? 'hit' : ''}`}>{n}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!logged) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-card__header">
            <p className="auth-eyebrow">Bienvenido de vuelta</p>
            <h1 className="auth-title">Inicia sesión en Dino Bingo</h1>
            <p className="auth-subtitle">Accede para crear partidas, comprar tickets y seguir tus premios.</p>
          </div>
          {errors && <div className="auth-alert auth-alert--error">{errors}</div>}
          {msg && !errors && <div className="auth-alert auth-alert--info">{msg}</div>}
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Correo electrónico</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Contraseña</label>
            <div className="auth-password">
              <input
                id="password"
                className="auth-input auth-input--password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <button className="auth-submit" onClick={login} disabled={!canLogin}>
            Iniciar sesión
          </button>
          <p className="auth-hint">
            ¿Eres nuevo? Ponte en contacto con el equipo para crear tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container stack">
      <header className="stack">
        <h1 className="title">Dino Bingo</h1>
        {errors && <div className="error">{errors}</div>}
        {msg && <div className="muted">{msg}</div>}
      </header>

      <section className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>Sesión: {me ? <strong>{me.email}</strong> : "-"} · Saldo: {me ? `$${me.balance.toFixed(2)}` : "-"}</div>
          <button className="btn" onClick={logout}>Salir</button>
        </div>
        <div className="row">
          <input className="input" type="number" min={0.5} step={0.5} value={topupAmount} onChange={(e) => setTopupAmount(parseFloat(e.target.value) || 0)} />
          <button className="btn primary" onClick={topup} disabled={!canTopup}>Recargar</button>
        </div>
      </section>

      <section className="card stack">
        <h3 className="title">Crear partida</h3>
        <div className="row">
          <label className="muted">Precio (mín. 0.5)</label>
          <input className="input" type="number" min={0.5} step={0.5} value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} />
        </div>
        <div className="row">
          <label className="muted">Autoinicio</label>
          <input type="checkbox" checked={autoEnabled} onChange={e => setAutoEnabled(e.target.checked)} />
          <label className="muted">Umbral (tickets)</label>
          <input className="input" type="number" min={10} step={1} value={autoThreshold ?? ''} onChange={e => setAutoThreshold(e.target.value ? parseInt(e.target.value) : undefined)} />
          <label className="muted">Demora (min)</label>
          <input className="input" type="number" min={0} step={5} value={autoDelay ?? ''} onChange={e => setAutoDelay(e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
        <div className="row">
          <button className="btn primary" onClick={createGame} disabled={!canCreate}>Crear</button>
        </div>
      </section>

      <section className="card stack">
        <h3 className="title">Partidas</h3>
        <ul className="list">
          {games.map(g => (
            <li key={g.id} className="row" style={{ justifyContent: "space-between" }}>
              <span><b>{g.id.slice(0, 8)}</b> · {g.status} · ${g.price} · vendidos: {g.sold_tickets}</span>
              <span className="row">
                <button className="btn" onClick={() => { setSelectedGameId(g.id); setGameState(null); fetchGameState(g.id); }}>Ver estado</button>
                {me && g.creator_id === me.id && g.status === 'OPEN' && (g.sold_tickets >= (g.min_tickets ?? 10)) && (
                  <button className="btn primary" onClick={async () => {
                    try { await api.post(`/games/${g.id}/start`); setMsg('Partida iniciada'); fetchGames(); } catch (e: any) { setMsg(e?.response?.data || 'No se pudo iniciar'); }
                  }}>Iniciar</button>
                )}
                {me && g.creator_id === me.id && g.status === 'RUNNING' && (
                  <button className="btn primary" onClick={() => draw(g.id)}>Sortear</button>
                )}
                <button className="btn" onClick={() => buyTicket(g.id)} disabled={!logged}>Comprar ticket</button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {selectedGameId && (
        <section className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3 className="title">Detalle de partida</h3>
            <div className="row">
              <label className="muted">Auto-refresco</label>
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              <button className="btn" onClick={() => fetchGameState(selectedGameId)}>Refrescar</button>
              <button className="btn" onClick={() => { setSelectedGameId(null); setGameState(null); }}>Cerrar</button>
            </div>
          </div>
          {!gameState ? (
            <p className="muted">Cargando estado...</p>
          ) : (
            <div className="stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>Estado: <b>{gameState.status}</b> — Vendidos: <b>{gameState.sold_tickets}</b> — Precio: <b>${gameState.price}</b></div>
                {me && games.find(g => g.id === selectedGameId)?.creator_id === me?.id && gameState.status === 'RUNNING' && (
                  <button className="btn primary" onClick={() => draw(selectedGameId)}>Sortear</button>
                )}
              </div>
              <div className="row">
                <div className="muted">Pagados:</div>
                <div>Diagonal {gameState.paid_diagonal ? '✔' : '✗'}</div>
                <div>Línea {gameState.paid_line ? '✔' : '✗'}</div>
                <div>Bingo {gameState.paid_bingo ? '✔' : '✗'}</div>
              </div>
              <BingoBoard drawn={new Set(gameState.drawn_numbers)} />
            </div>
          )}
        </section>
      )}

      <section className="card stack">
        <h3 className="title">Mis tickets</h3>
        {tickets.length === 0 ? (
          <p className="muted">Sin tickets</p>
        ) : (
          <ul className="list">
            {tickets.map(t => (
              <li key={t.id}>
                <b>{t.id.slice(0, 8)}</b> · juego {t.game_id.slice(0, 8)} · {t.numbers.flat().length} números
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
