import { FormEvent, useEffect, useMemo, useState } from "react";
import api from "./api/http";
import AdminPanel from "./features/admin/AdminPanel";
import { ADMIN_SAMPLE_TRANSACTIONS } from "./features/admin/constants";
import UserDashboardView from "./features/user/views/UserDashboardView";
import UserStatsView from "./features/user/views/UserStatsView";
import UserJoinView from "./features/user/views/UserJoinView";
import UserCreateView from "./features/user/views/UserCreateView";
import UserGameRoomView from "./features/user/views/UserGameRoomView";
import { USER_SAMPLE_TRANSACTIONS } from "./features/user/constants";
import { formatCredits } from "./utils/format";
import { JoinableGameCard, Me, UserTransaction, UserTransactionType, UserView } from "./types";

export default function App() {
  const [email, setEmail] = useState("admin@bingo.local");
  const [password, setPassword] = useState("admin123");
  const [me, setMe] = useState<Me | null>(null);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFetchingMe, setIsFetchingMe] = useState(false);
  const [isTopupProcessing, setIsTopupProcessing] = useState(false);
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>(USER_SAMPLE_TRANSACTIONS);
  const [userView, setUserView] = useState<UserView>("balance");
  const [activeJoinGame, setActiveJoinGame] = useState<JoinableGameCard | null>(null);
  const [pendingTicketSelection, setPendingTicketSelection] = useState(false);

  const logged = Boolean(localStorage.getItem("token"));
  const isAdmin = me?.is_admin ?? false;
  const emailOk = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const passwordOk = useMemo(() => password.length >= 6, [password]);
  const canLogin = emailOk && passwordOk;

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login();
  };

  async function login() {
    setErrors("");
    if (!canLogin) {
      setErrors("Email o contraseña inválidos (min 6 caracteres)");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      setMsg("Sesión iniciada");
      await fetchMe();
    } catch (error: unknown) {
      setMsg("");
      if (error && typeof error === "object" && "response" in error && (error as any).response?.data) {
        setErrors((error as any).response.data as string);
      } else {
        setErrors("No se pudo iniciar sesión, inténtalo de nuevo");
      }
    }
  }

  async function fetchMe(): Promise<Me | null> {
    setIsFetchingMe(true);
    try {
      const { data } = await api.get("/auth/me");
      const profile: Me = {
        id: data.id,
        email: data.email,
        balance: data.balance,
        alias: data.alias,
        is_admin: data.is_admin,
        is_verified: data.is_verified,
      };
      setMe(profile);
      if (profile.is_admin) {
        setUserView("balance");
      }
      return profile;
    } catch (error: unknown) {
      setMe(null);
      if (error && typeof error === "object" && "response" in error && (error as any).response?.status === 401) {
        localStorage.removeItem("token");
        setMsg("La sesión expiró. Inicia sesión nuevamente.");
      }
      return null;
    } finally {
      setIsFetchingMe(false);
    }
  }

  async function topup(amount: number) {
    setErrors("");
    setMsg("");
    if (!logged || !Number.isFinite(amount) || amount <= 0) {
      setErrors("El monto debe ser mayor a 0");
      return;
    }

    try {
      setIsTopupProcessing(true);
      const { data } = await api.post(`/wallet/topup`, { amount });
      setMsg(`Saldo actualizado: ${formatCredits(data.balance)}`);
      await fetchMe();
      setUserTransactions((prev) =>
        [
          {
            id: `TXU-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "deposit" as UserTransactionType,
            description: "Recarga manual de créditos",
            amount,
          },
          ...prev,
        ].slice(0, 50),
      );
    } catch (e: any) {
      setMsg("");
      setErrors(e?.response?.data || "Error al recargar");
    } finally {
      setIsTopupProcessing(false);
    }
  }

  function handleWithdrawal() {
    setMsg("La solicitud de retiro estará disponible próximamente.");
    setUserTransactions((prev) =>
      [
        {
          id: `TXU-${Date.now()}-WD`,
          timestamp: new Date().toISOString(),
          type: "withdraw" as UserTransactionType,
          description: "Solicitud de retiro registrada",
          amount: -50,
        },
        ...prev,
      ].slice(0, 50),
    );
  }

  function logout() {
    localStorage.removeItem("token");
    setMe(null);
    setMsg("Sesión cerrada");
    setErrors("");
    setUserTransactions(USER_SAMPLE_TRANSACTIONS);
    setUserView("balance");
    setActiveJoinGame(null);
    setPendingTicketSelection(false);
  }

  const handleJoinGameRoom = (game: JoinableGameCard) => {
    setActiveJoinGame(game);
    setPendingTicketSelection(true);
    setUserView("room");
  };

  const handleLeaveGameRoom = () => {
    setActiveJoinGame(null);
    setPendingTicketSelection(false);
    setUserView("join");
  };

  const handleConfirmTickets = (count: number) => {
    setPendingTicketSelection(false);
    setMsg(`Has comprado ${count} cartón${count > 1 ? "es" : ""} por ${formatCredits((activeJoinGame?.price ?? 0) * count)}.`);
  };

  useEffect(() => {
    if (!logged) {
      setMe(null);
      return;
    }

    fetchMe();
  }, [logged]);

  if (!logged) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleLoginSubmit}>
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
            <button type="submit" className="auth-submit" disabled={!canLogin}>
              Iniciar sesión
            </button>
            <p className="auth-hint">¿Eres nuevo? Ponte en contacto con el equipo para crear tu cuenta.</p>
          </form>
        </div>
      </div>
    );
  }

  if (logged && isFetchingMe && !me) {
    return (
      <div className="auth-shell">
        <div className="auth-card auth-card--loading">
          <p className="auth-subtitle">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (logged && me && me.is_admin) {
    return <AdminPanel me={me} onLogout={logout} transactions={ADMIN_SAMPLE_TRANSACTIONS} />;
  }

  if (logged && me && !me.is_admin) {
    if (userView === "room" && activeJoinGame) {
      return (
        <UserGameRoomView
          me={me}
          game={activeJoinGame}
          onLeave={handleLeaveGameRoom}
          onLogout={logout}
          onNavigate={(view) => setUserView(view)}
          pendingTickets={pendingTicketSelection ? 1 : 0}
          onConfirmTickets={handleConfirmTickets}
        />
      );
    }

    if (userView === "stats") {
      return <UserStatsView me={me} onLogout={logout} currentView={userView} onNavigate={(view) => setUserView(view)} />;
    }

    if (userView === "join") {
      return (
        <UserJoinView
          me={me}
          onLogout={logout}
          currentView={userView}
          onNavigate={(view) => setUserView(view)}
          onJoinGame={handleJoinGameRoom}
        />
      );
    }

    if (userView === "create") {
      return <UserCreateView me={me} onLogout={logout} currentView={userView} onNavigate={(view) => setUserView(view)} />;
    }

    return (
      <UserDashboardView
        me={me}
        onLogout={logout}
        onTopup={topup}
        onWithdraw={handleWithdrawal}
        isProcessingTopup={isTopupProcessing}
        transactions={userTransactions}
        message={msg}
        error={errors}
        currentView={userView}
        onNavigate={(view) => setUserView(view)}
      />
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card--loading">
        <p className="auth-subtitle">No pudimos cargar tu panel, intenta de nuevo.</p>
        <button type="button" className="auth-submit" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
