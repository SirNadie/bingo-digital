import { useEffect, useMemo, useState, useRef } from "react";
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

type Me = { id: string; email: string; balance: number; alias?: string; is_admin: boolean; is_verified: boolean };

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

type AdminTransaction = {
  id: string;
  user: string;
  timestamp: string;
  amount: number;
  type: "deposit" | "withdraw";
  status: "pending" | "approved" | "rejected";
};

type AdminView = "dashboard" | "transactions";

type AdminDashboardProps = {
  me: Me;
  onLogout: () => void;
  transactions: AdminTransaction[];
};

type AdminNavItem = { icon: string; label: string; view?: AdminView };
type AdminSupportItem = { icon: string; label: string; action?: "logout" };

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { icon: "dashboard", label: "Dashboard", view: "dashboard" },
  { icon: "group", label: "Gestión de Usuarios" },
  { icon: "stadia_controller", label: "Gestión de Partidas" },
  { icon: "account_balance_wallet", label: "Transacciones", view: "transactions" },
];

const ADMIN_SUPPORT_ITEMS: AdminSupportItem[] = [
  { icon: "settings", label: "Configuración" },
  { icon: "help", label: "Ayuda" },
  { icon: "logout", label: "Cerrar sesión", action: "logout" },
];

const ADMIN_SAMPLE_TRANSACTIONS: AdminTransaction[] = [
  {
    id: "TXN12345",
    user: "juan.perez",
    timestamp: "15/07/2024 10:30",
    amount: 50,
    type: "deposit",
    status: "pending",
  },
  {
    id: "TXN12346",
    user: "maria.gomez",
    timestamp: "15/07/2024 09:45",
    amount: 20,
    type: "withdraw",
    status: "pending",
  },
  {
    id: "TXN12347",
    user: "carlos.lopez",
    timestamp: "14/07/2024 22:15",
    amount: 100,
    type: "deposit",
    status: "pending",
  },
  {
    id: "TXN12348",
    user: "ana.martinez",
    timestamp: "14/07/2024 18:00",
    amount: 75,
    type: "withdraw",
    status: "pending",
  },
];

type UserTransactionType = "deposit" | "withdraw" | "purchase" | "prize";

type UserTransaction = {
  id: string;
  timestamp: string;
  type: UserTransactionType;
  description: string;
  amount: number;
};

type UserDashboardProps = {
  me: Me;
  onLogout: () => void;
  onTopup: (amount: number) => Promise<void>;
  onWithdraw: () => void;
  isProcessingTopup: boolean;
  transactions: UserTransaction[];
  message: string;
  error: string;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

type UserStatsProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

type UserJoinGamesProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

type UserCreateGameProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

type JoinableGameCard = {
  id: string;
  creator: string;
  pot: number;
  price: number;
  sold: string;
  rewards: string;
  breakdown: string;
  actionLabel: string;
};

const USER_SAMPLE_TRANSACTIONS: UserTransaction[] = [
  {
    id: "TXU-001",
    timestamp: "2024-07-15T10:30:00Z",
    type: "deposit",
    description: "Depósito con tarjeta (final 4242)",
    amount: 500,
  },
  {
    id: "TXU-002",
    timestamp: "2024-07-14T18:45:00Z",
    type: "purchase",
    description: "Compra de 5 cartones · Partida #AB12CD",
    amount: -50,
  },
  {
    id: "TXU-003",
    timestamp: "2024-07-13T21:12:00Z",
    type: "prize",
    description: "Premio Bingo · Sala \"Noche Retro\"",
    amount: 150,
  },
  {
    id: "TXU-004",
    timestamp: "2024-07-12T11:05:00Z",
    type: "withdraw",
    description: "Retiro a cuenta bancaria",
    amount: -200,
  },
  {
    id: "TXU-005",
    timestamp: "2024-07-10T15:20:00Z",
    type: "purchase",
    description: "Compra de 10 cartones · Partida #XY98ZT",
    amount: -100,
  },
];

type UserView = "balance" | "stats" | "join" | "create";

const USER_STATS_OVERVIEW = [
  { label: "Partidas jugadas", value: "152" },
  { label: "Porcentaje de victorias", value: "58.5%" },
  { label: "Créditos ganados", value: "15 400" },
  { label: "Créditos gastados", value: "9 800" },
];

const USER_STATS_HIGHLIGHTS = [
  { icon: "emoji_events", label: "Mayor premio", value: "2 500 créditos" },
  { icon: "trending_up", label: "Mejor racha", value: "8 partidas" },
  { icon: "casino", label: "Bingos cantados", value: "95" },
  { icon: "military_tech", label: "Logro desbloqueado", value: "Maestro del Bingo" },
];

const JOINABLE_GAMES: JoinableGameCard[] = [
  {
    id: "join-001",
    creator: "Juan Pérez",
    pot: 125.5,
    price: 1,
    sold: "125 / ∞",
    rewards: "2 premios",
    breakdown: "Línea: 40% · Bingo: 60%",
    actionLabel: "Unirse a la partida",
  },
  {
    id: "join-002",
    creator: "Ana García",
    pot: 45,
    price: 0.5,
    sold: "90 / 200",
    rewards: "3 premios",
    breakdown: "Línea: 20% · Doble: 30% · Bingo: 50%",
    actionLabel: "Comprar cartones",
  },
  {
    id: "join-003",
    creator: "Bingo Club",
    pot: 278,
    price: 2,
    sold: "139 / ∞",
    rewards: "1 premio",
    breakdown: "Bingo: 100%",
    actionLabel: "Unirse a la partida",
  },
];

type UserHeaderProps = {
  view: UserView;
  balance: number;
  onNavigate: (view: UserView) => void;
  onLogout: () => void;
};

function UserHeader({ view, balance, onNavigate, onLogout }: UserHeaderProps) {
  const effectiveView = view === "join" || view === "create" ? "balance" : view;
  const formattedBalance = balance.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <header className="user-topbar">
      <div className="user-brand">
        <div className="user-brand__icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BingoApp">
            <path
              d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h1 className="user-brand__title">BingoApp</h1>
          <p className="user-brand__subtitle">Tu panel personal</p>
        </div>
      </div>
      <nav className="user-topnav" aria-label="Navegación principal">
        <button
          type="button"
          className={`user-topnav__link ${effectiveView === "balance" ? "user-topnav__link--active" : ""}`}
          onClick={() => onNavigate("balance")}
        >
          Mi balance
        </button>
        <button
          type="button"
          className={`user-topnav__link ${effectiveView === "stats" ? "user-topnav__link--active" : ""}`}
          onClick={() => onNavigate("stats")}
        >
          Mis estadísticas
        </button>
        <button type="button" className="user-topnav__link">
          Ayuda
        </button>
      </nav>
      <div className="user-topnav__right">
        <button type="button" className="user-balance-pill">
          <span className="material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
          <span className="user-balance-pill__label">{formattedBalance} créditos</span>
        </button>
        <div className="user-avatar" aria-hidden="true" />
        <button type="button" className="user-logout" onClick={onLogout}>
          <span className="material-symbols-outlined" aria-hidden="true">logout</span>
        </button>
      </div>
    </header>
  );
}

function AdminDashboard({ me, onLogout, transactions }: AdminDashboardProps) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const term = search.trim().toLowerCase();
    return transactions.filter(
      (txn) =>
        txn.id.toLowerCase().includes(term) ||
        txn.user.toLowerCase().includes(term) ||
        txn.timestamp.toLowerCase().includes(term),
    );
  }, [transactions, search]);

  const totalTransactions = transactions.length;
  const pendingCount = transactions.filter((txn) => txn.status === "pending").length;
  const allSelected = filteredTransactions.length > 0 && selectedTransactions.length === filteredTransactions.length;
  const indeterminate = selectedTransactions.length > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  useEffect(() => {
    setSelectedTransactions([]);
    if (view !== "transactions") {
      setSearch("");
    }
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = false;
    }
  }, [view]);

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map((txn) => txn.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedTransactions((prev) => (prev.includes(id) ? prev.filter((tx) => tx !== id) : [...prev, id]));
  };

  const handleLogout = () => {
    setView("dashboard");
    onLogout();
  };

  const layoutClassName = isSidebarCollapsed ? "admin-layout admin-layout--collapsed" : "admin-layout";

  return (
    <div className={layoutClassName}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__identity">
            <div className="admin-avatar" aria-hidden="true" />
            <div>
              <h1 className="admin-sidebar__title">Admin Bingo</h1>
              <p className="admin-sidebar__subtitle">Panel de Administración</p>
            </div>
          </div>
          <button
            type="button"
            className="admin-sidebar__toggle"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={isSidebarCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {isSidebarCollapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>
        <nav className="admin-sidebar__nav">
          {ADMIN_NAV_ITEMS.map((item) => {
            const targetView = item.view;
            return (
              <button
                key={item.label}
                type="button"
                className={`admin-sidebar__link ${targetView && view === targetView ? "admin-sidebar__link--active" : ""}`}
                onClick={targetView ? () => setView(targetView) : undefined}
                aria-pressed={targetView ? view === targetView : undefined}
                aria-label={item.label}
              >
                <span
                  className="material-symbols-outlined"
                  style={targetView && view === targetView ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="admin-sidebar__label">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="admin-sidebar__footer">
          {ADMIN_SUPPORT_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="admin-sidebar__link"
              onClick={item.action === "logout" ? handleLogout : undefined}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="admin-dashboard">
        <div className="admin-dashboard__inner">
          {view === "dashboard" ? (
            <>
              <section className="admin-chipbar" aria-label="Filtros temporales">
                <button type="button" className="admin-chip admin-chip--active">Ultimas 24h</button>
                <button type="button" className="admin-chip">Últimos 7 días</button>
                <button type="button" className="admin-chip">Últimos 30 días</button>
                <button type="button" className="admin-chip admin-chip--icon">
                  <span>Rango personalizado</span>
                  <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                </button>
              </section>

              <section className="admin-metrics">
                <article className="admin-card admin-card--metric">
                  <header>
                    <span className="material-symbols-outlined" aria-hidden="true">group</span>
                    <p>Usuarios totales</p>
                  </header>
                  <strong>12,456</strong>
                  <span className="admin-metric__trend admin-metric__trend--up">+2.5%</span>
                </article>
                <article className="admin-card admin-card--metric">
                  <header>
                    <span className="material-symbols-outlined" aria-hidden="true">casino</span>
                    <p>Partidas activas</p>
                  </header>
                  <strong>87</strong>
                  <span className="admin-metric__trend admin-metric__trend--up">+5.1%</span>
                </article>
                <article className="admin-card admin-card--metric">
                  <header>
                    <span className="material-symbols-outlined" aria-hidden="true">payments</span>
                    <p>Ingresos totales</p>
                  </header>
                  <strong>$98,230</strong>
                  <span className="admin-metric__trend admin-metric__trend--up">+10.2%</span>
                </article>
                <article className="admin-card admin-card--metric">
                  <header>
                    <span className="material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
                    <p>Movimientos hoy</p>
                  </header>
                  <strong>{totalTransactions}</strong>
                  <span className="admin-metric__trend admin-metric__trend--neutral">Resumen</span>
                </article>
              </section>

              <section className="admin-grid">
                <article className="admin-card admin-card--chart">
                  <header>
                    <p className="admin-card__title">Ingresos plataforma (30 días)</p>
                    <div className="admin-card__summary">
                      <strong>$45,890</strong>
                      <span className="admin-metric__trend admin-metric__trend--up">+12.5%</span>
                    </div>
                  </header>
                  <p className="admin-card__caption">Comparativa semanal</p>
                  <div className="admin-chart admin-chart--line" aria-hidden="true">
                    <svg viewBox="-3 0 478 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Evolución de ingresos">
                      <defs>
                        <linearGradient id="revenueGradient" x1="236" x2="236" y1="1" y2="149" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#13ec5b" stopOpacity="0.3" />
                          <stop offset="1" stopColor="#13ec5b" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#revenueGradient)" />
                      <path
                        d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="admin-chart__line"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <ul className="admin-chart__ticks">
                    <li>Semana 1</li>
                    <li>Semana 2</li>
                    <li>Semana 3</li>
                    <li>Semana 4</li>
                  </ul>
                </article>

                <article className="admin-card admin-card--donut">
                  <header>
                    <p className="admin-card__title">Packs de créditos populares</p>
                  </header>
                  <div className="admin-donut">
                    <svg viewBox="0 0 36 36" role="img" aria-label="Distribución de ventas de créditos">
                      <path
                        className="admin-donut__track"
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831"
                        fill="none"
                        strokeWidth={3}
                      />
                      <path
                        className="admin-donut__slice admin-donut__slice--primary"
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831"
                        fill="none"
                        strokeWidth={3}
                        strokeDasharray="60 100"
                        strokeLinecap="round"
                      />
                      <path
                        className="admin-donut__slice admin-donut__slice--secondary"
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831"
                        fill="none"
                        strokeWidth={3}
                        strokeDasharray="30 100"
                        strokeDashoffset={-60}
                        strokeLinecap="round"
                      />
                      <path
                        className="admin-donut__slice admin-donut__slice--tertiary"
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831"
                        fill="none"
                        strokeWidth={3}
                        strokeDasharray="10 100"
                        strokeDashoffset={-90}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="admin-donut__center">
                      <strong>2,430</strong>
                      <span>Total de packs</span>
                    </div>
                  </div>
                  <ul className="admin-donut__legend">
                    <li>
                      <span className="admin-donut__dot admin-donut__dot--primary" />
                      <span>Starter Pack</span>
                      <strong>60%</strong>
                    </li>
                    <li>
                      <span className="admin-donut__dot admin-donut__dot--secondary" />
                      <span>Pro Pack</span>
                      <strong>30%</strong>
                    </li>
                    <li>
                      <span className="admin-donut__dot admin-donut__dot--tertiary" />
                      <span>Whale Pack</span>
                      <strong>10%</strong>
                    </li>
                  </ul>
                </article>
              </section>

              <section className="admin-card admin-card--activity">
                <header>
                  <p className="admin-card__title">Actividad reciente</p>
                </header>
                <ul className="admin-activity">
                  <li>
                    <div className="admin-activity__icon admin-activity__icon--primary">
                      <span className="material-symbols-outlined" aria-hidden="true">emoji_events</span>
                    </div>
                    <div className="admin-activity__content">
                      <p>
                        Usuario <strong>PlayerOne</strong> ganó <strong>$50</strong> en la partida #1024.
                      </p>
                      <time>Hace 2 minutos</time>
                    </div>
                  </li>
                  <li>
                    <div className="admin-activity__icon admin-activity__icon--success">
                      <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
                    </div>
                    <div className="admin-activity__content">
                      <p>
                        Usuario <strong>BingoMaster</strong> compró el <strong>Pro Pack</strong>.
                      </p>
                      <time>Hace 15 minutos</time>
                    </div>
                  </li>
                  <li>
                    <div className="admin-activity__icon admin-activity__icon--warning">
                      <span className="material-symbols-outlined" aria-hidden="true">person_add</span>
                    </div>
                    <div className="admin-activity__content">
                      <p>
                        Nuevo registro realizado por <strong>Newbie23</strong>.
                      </p>
                      <time>Hace 30 minutos</time>
                    </div>
                  </li>
                  <li>
                    <div className="admin-activity__icon admin-activity__icon--primary">
                      <span className="material-symbols-outlined" aria-hidden="true">emoji_events</span>
                    </div>
                    <div className="admin-activity__content">
                      <p>
                        Usuario <strong>LuckyStar</strong> ganó <strong>$120</strong> en la partida #1023.
                      </p>
                      <time>Hace 1 hora</time>
                    </div>
                  </li>
                </ul>
              </section>
            </>
          ) : (
            <section className="admin-transactions">
              <header className="admin-transactions__header">
                <div>
                  <h2 className="admin-transactions__title">Gestión de Transacciones</h2>
                  <p className="admin-transactions__subtitle">Controla depósitos y retiros en tiempo real.</p>
                </div>
                <div className="admin-transactions__badge">Pendientes: <strong>{pendingCount}</strong></div>
              </header>

              <div className="admin-transactions__toolbar">
                <div className="admin-transactions__filters">
                  <button type="button" className="admin-icon-btn" aria-label="Filtrar transacciones">
                    <span className="material-symbols-outlined" aria-hidden="true">filter_list</span>
                  </button>
                  <button type="button" className="admin-icon-btn" aria-label="Elegir periodo">
                    <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
                  </button>
                  <label className="admin-transactions__search">
                    <span className="material-symbols-outlined" aria-hidden="true">search</span>
                    <input
                      type="search"
                      placeholder="Buscar por ID, usuario..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-transactions__actions">
                  <button type="button" className="admin-transactions__bulk admin-transactions__bulk--deny">
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                      cancel
                    </span>
                    <span>Rechazar seleccionados</span>
                  </button>
                  <button type="button" className="admin-transactions__bulk admin-transactions__bulk--approve">
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span>Aprobar seleccionados</span>
                  </button>
                </div>
              </div>

              <div className="admin-transactions__table-wrapper">
                <div className="admin-transactions__table-scroll">
                  <table className="admin-transactions__table">
                    <thead>
                      <tr>
                        <th scope="col">
                          <input
                            ref={selectAllRef}
                            type="checkbox"
                            checked={allSelected}
                            onChange={handleToggleAll}
                            aria-label="Seleccionar todas las transacciones visibles"
                          />
                        </th>
                        <th scope="col">ID Transacción</th>
                        <th scope="col">Usuario</th>
                        <th scope="col">Fecha y hora</th>
                        <th scope="col">Monto</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Estado</th>
                        <th scope="col" className="admin-transactions__actions-header">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((txn) => {
                        const isSelected = selectedTransactions.includes(txn.id);
                        const statusLabel = txn.status === "pending" ? "Pendiente" : txn.status === "approved" ? "Aprobado" : "Rechazado";
                        return (
                          <tr
                            key={txn.id}
                            className={isSelected ? "admin-transactions__row admin-transactions__row--selected" : "admin-transactions__row"}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleRow(txn.id)}
                                aria-label={`Seleccionar ${txn.id}`}
                              />
                            </td>
                            <td className="admin-transactions__cell--highlight">{txn.id}</td>
                            <td>{txn.user}</td>
                            <td>{txn.timestamp}</td>
                            <td className="admin-transactions__cell--highlight">${txn.amount.toFixed(2)}</td>
                            <td>
                              <span
                                className={`admin-transactions__chip ${
                                  txn.type === "deposit"
                                    ? "admin-transactions__chip--deposit"
                                    : "admin-transactions__chip--withdraw"
                                }`}
                              >
                                {txn.type === "deposit" ? "Depósito" : "Retiro"}
                              </span>
                            </td>
                            <td>
                              <span className={`admin-transactions__chip admin-transactions__chip--${txn.status}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td>
                              <div className="admin-transactions__row-actions">
                                <button type="button" className="admin-transactions__row-button admin-transactions__row-button--deny" aria-label="Rechazar">
                                  <span className="material-symbols-outlined" aria-hidden="true">cancel</span>
                                </button>
                                <button type="button" className="admin-transactions__row-button admin-transactions__row-button--approve" aria-label="Aprobar">
                                  <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                                </button>
                                <button type="button" className="admin-transactions__row-button admin-transactions__row-button--neutral" aria-label="Más acciones">
                                  <span className="material-symbols-outlined" aria-hidden="true">more_vert</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={8} className="admin-transactions__empty">
                            No hay transacciones que coincidan con la búsqueda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <nav className="admin-transactions__pagination" aria-label="Paginación de transacciones">
                <button type="button" className="admin-transactions__page-btn" aria-label="Anterior">
                  <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                </button>
                <button type="button" className="admin-transactions__page-btn admin-transactions__page-btn--active">1</button>
                <button type="button" className="admin-transactions__page-btn">2</button>
                <button type="button" className="admin-transactions__page-btn">3</button>
                <span className="admin-transactions__page-ellipsis">...</span>
                <button type="button" className="admin-transactions__page-btn">10</button>
                <button type="button" className="admin-transactions__page-btn" aria-label="Siguiente">
                  <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                </button>
              </nav>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function UserStats({ me, onLogout, currentView, onNavigate }: UserStatsProps) {
  return (
    <div className="user-stats-shell">
      <UserHeader view={currentView} balance={me.balance} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="user-stats-main">
        <section className="user-stats-header">
          <div>
            <h2>Mis estadísticas</h2>
            <p>Tu rendimiento y actividad en el juego.</p>
          </div>
          <div className="user-stats-filters">
            <button type="button" className="user-stats-chip user-stats-chip--ghost">Últimos 7 días</button>
            <button type="button" className="user-stats-chip user-stats-chip--active">Último mes</button>
            <button type="button" className="user-stats-chip user-stats-chip--ghost">Desde siempre</button>
          </div>
        </section>

        <section className="user-stats-overview">
          {USER_STATS_OVERVIEW.map((item) => (
            <article key={item.label}>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="user-stats-panels">
          <article className="user-stats-chart">
            <header>
              <div>
                <p>Actividad reciente</p>
                <span>Último mes</span>
              </div>
              <div className="user-stats-chart__highlight">
                <strong>+12.5%</strong>
                <span>Créditos</span>
              </div>
            </header>
            <div className="user-stats-chart__graph">
              <svg viewBox="-3 0 478 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="tendencia de créditos">
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                  fill="url(#user-stats-gradient)"
                  fillOpacity="0.18"
                />
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#135bec"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                <defs>
                  <linearGradient id="user-stats-gradient" x1="236" x2="236" y1="1" y2="149" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#135bec" />
                    <stop offset="1" stopColor="#135bec" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="user-stats-chart__ticks">
                <span>Semana 1</span>
                <span>Semana 2</span>
                <span>Semana 3</span>
                <span>Semana 4</span>
              </div>
            </div>
          </article>
          <article className="user-stats-highlights">
            <h3>Tus mejores momentos</h3>
            <ul>
              {USER_STATS_HIGHLIGHTS.map((item) => (
                <li key={item.label}>
                  <div className="user-stats-highlights__icon">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

function UserJoinGames({ me, onLogout, currentView, onNavigate }: UserJoinGamesProps) {
  return (
    <div className="user-join-shell">
      <UserHeader view={currentView} balance={me.balance} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="user-join-main">
        <section className="user-join-header">
          <div>
            <h2>Partidas activas</h2>
            <p>Busca una sala y únete a la diversión.</p>
          </div>
          <div className="user-join-actions">
            <label className="user-join-search">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
              <input type="search" placeholder="Buscar por creador..." />
            </label>
            <button type="button" className="user-join-create" aria-label="Crear nueva partida">
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
            </button>
          </div>
        </section>

        <section className="user-join-grid">
          {JOINABLE_GAMES.map((game) => (
            <article key={game.id} className="user-join-card">
              <div className="user-join-card__body">
                <header>
                  <div>
                    <p>Creado por</p>
                    <h3>{game.creator}</h3>
                  </div>
                  <div className="user-join-pot">
                    <p>Pozo actual</p>
                    <strong>{game.pot.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
                    <span>créditos</span>
                  </div>
                </header>
                <div className="user-join-divider" />
                <ul>
                  <li>
                    <span>Precio del cartón</span>
                    <span className="user-join-tag">{game.price.toFixed(1)} créditos</span>
                  </li>
                  <li>
                    <span>Cartones vendidos</span>
                    <strong>{game.sold}</strong>
                  </li>
                  <li>
                    <span>Plantilla de premios</span>
                    <strong>{game.rewards}</strong>
                  </li>
                  <li className="user-join-breakdown">{game.breakdown}</li>
                </ul>
              </div>
              <footer>
                <button type="button" className="user-join-action">
                  {game.actionLabel}
                </button>
              </footer>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function UserCreateGame({ me, onLogout, currentView, onNavigate }: UserCreateGameProps) {
  return (
    <div className="user-create-shell">
      <UserHeader view={currentView} balance={me.balance} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="user-create-main">
        <div className="user-create-content">
          <section className="user-create-form">
            <header className="user-create-heading">
              <div>
                <h2>Crear nueva partida</h2>
                <p>Define precio, premios y condiciones de inicio.</p>
              </div>
              <button type="button" onClick={() => onNavigate("balance")} className="user-create-back">
                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                Volver
              </button>
            </header>

            <div className="user-create-cards">
              <article className="user-create-card">
                <h3>Precio por cartón</h3>
                <div className="user-create-price">
                  <button type="button" aria-label="Disminuir precio">
                    <span className="material-symbols-outlined" aria-hidden="true">remove</span>
                  </button>
                  <div className="user-create-price__input">
                    <input type="number" min={0.5} step={0.5} value={0.5} readOnly aria-label="Precio del cartón" />
                    <span>créditos</span>
                  </div>
                  <button type="button" aria-label="Incrementar precio">
                    <span className="material-symbols-outlined" aria-hidden="true">add</span>
                  </button>
                </div>
                <p className="user-create-note">Mínimo 0.5 créditos, en incrementos de 0.5.</p>
              </article>

              <article className="user-create-card">
                <h3>Plantilla de premios</h3>
                <div className="user-create-prizes">
                  <button type="button" className="user-create-prize">
                    <strong>1 Premio</strong>
                    <span>Línea · 100% del pozo</span>
                  </button>
                  <button type="button" className="user-create-prize user-create-prize--active">
                    <strong>2 Premios</strong>
                    <span>Línea 40% · Bingo 60%</span>
                  </button>
                  <button type="button" className="user-create-prize">
                    <strong>3 Premios</strong>
                    <span>Línea 20% · Doble 30% · Bingo 50%</span>
                  </button>
                </div>
              </article>

              <article className="user-create-card">
                <h3>Inicio automático</h3>
                <div className="user-create-autostart">
                  <div className="user-create-autostart__row">
                    <div>
                      <p>Iniciar por cartones vendidos</p>
                      <span>La partida inicia al alcanzar un número de cartones.</span>
                    </div>
                    <div className="user-create-autostart__controls">
                      <input type="number" min={10} value={50} readOnly aria-label="Cartones para iniciar" />
                      <input type="checkbox" checked readOnly aria-label="Activar inicio por cartones" />
                    </div>
                  </div>
                  <div className="user-create-autostart__row">
                    <div>
                      <p>Iniciar por tiempo</p>
                      <span>La partida inicia luego de un tiempo determinado.</span>
                    </div>
                    <div className="user-create-autostart__controls">
                      <input type="number" value={0} readOnly aria-label="Minutos para iniciar" disabled />
                      <input type="checkbox" aria-label="Activar inicio por tiempo" />
                    </div>
                  </div>
                </div>
                <p className="user-create-hint">La partida comenzará cuando se cumpla la primera condición alcanzada.</p>
              </article>
            </div>
          </section>

          <aside className="user-create-summary">
            <article>
              <h3>Resumen de la partida</h3>
              <ul>
                <li>
                  <span>Precio / cartón</span>
                  <strong>0.5 créditos</strong>
                </li>
                <li>
                  <span>Premios</span>
                  <div>
                    <strong>Línea: 40%</strong>
                    <strong>Bingo: 60%</strong>
                  </div>
                </li>
                <li>
                  <span>Inicio automático</span>
                  <strong>Por cartones</strong>
                </li>
                <li>
                  <span>Condición</span>
                  <strong>Al vender 50 cartones</strong>
                </li>
              </ul>
            </article>
            <div className="user-create-actions">
              <button type="button" className="user-create-actions__primary">
                <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                Crear partida
              </button>
              <button type="button" className="user-create-actions__secondary" onClick={() => onNavigate("balance")}>
                Cancelar
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function UserDashboard({
  me,
  onLogout,
  onTopup,
  onWithdraw,
  isProcessingTopup,
  transactions,
  message,
  error,
  currentView,
  onNavigate,
}: UserDashboardProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<UserTransactionType | "all">("all");
  const [rangeFilter, setRangeFilter] = useState("30");
  const [depositAmount, setDepositAmount] = useState(50);

  const filteredTransactions = useMemo(() => {
    const threshold = rangeFilter === "all" ? null : Number.parseInt(rangeFilter, 10);
    const minDate = threshold ? (() => { const d = new Date(); d.setDate(d.getDate() - threshold); return d; })() : null;

    return transactions.filter((txn) => {
      const matchesType = typeFilter === "all" || txn.type === typeFilter;
      const matchesSearch =
        !search.trim() ||
        txn.description.toLowerCase().includes(search.trim().toLowerCase()) ||
        txn.id.toLowerCase().includes(search.trim().toLowerCase());
      const matchesRange = !minDate || new Date(txn.timestamp) >= minDate;
      return matchesType && matchesSearch && matchesRange;
    });
  }, [transactions, search, typeFilter, rangeFilter]);

  function formatAmount(amount: number) {
    const sign = amount >= 0 ? "+" : "-";
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  }

  function formatDate(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function typeBadge(type: UserTransactionType) {
    switch (type) {
      case "deposit":
        return { icon: "arrow_upward", label: "Depósito", className: "user-chip user-chip--deposit" };
      case "withdraw":
        return { icon: "arrow_downward", label: "Retiro", className: "user-chip user-chip--withdraw" };
      case "prize":
        return { icon: "emoji_events", label: "Premio", className: "user-chip user-chip--prize" };
      case "purchase":
      default:
        return { icon: "shopping_cart", label: "Compra", className: "user-chip user-chip--purchase" };
    }
  }

  const balance = Number.isFinite(me.balance) ? me.balance : 0;

  return (
    <div className="user-shell">
      <UserHeader view={currentView} balance={balance} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="user-main">
        <section className="user-quick-actions">
          <button type="button" className="user-quick-actions__primary" onClick={() => onNavigate("join")}>
            <span className="material-symbols-outlined" aria-hidden="true">group_add</span>
            Unirse a partida
          </button>
          <button type="button" className="user-quick-actions__secondary" onClick={() => onNavigate("create")}>
            <span className="material-symbols-outlined" aria-hidden="true">add_circle</span>
            Crear partida
          </button>
        </section>

        {(error || message) && (
          <div className="user-alerts">
            {error ? (
              <div className="user-alert user-alert--error">{error}</div>
            ) : (
              message && <div className="user-alert user-alert--info">{message}</div>
            )}
          </div>
        )}

        <section className="user-summary">
          <article className="user-summary__card">
            <div className="user-summary__heading">
              <span className="material-symbols-outlined" aria-hidden="true">savings</span>
              <h2>Créditos disponibles</h2>
            </div>
            <p className="user-summary__balance">
              {balance.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="user-summary__caption">Actualizado al {new Date().toLocaleDateString("es-ES")}</span>
          </article>
          <article className="user-actions">
            <div className="user-actions__input">
              <label htmlFor="deposit-amount">Monto a depositar</label>
              <div className="user-actions__amount">
                <span>$</span>
                <input
                  id="deposit-amount"
                  type="number"
                  min={5}
                  step={5}
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(Number(event.target.value) || 0)}
                />
              </div>
              <div className="user-actions__quick">
                {[25, 50, 100].map((preset) => (
                  <button key={preset} type="button" onClick={() => setDepositAmount(preset)}>
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
            <div className="user-actions__buttons">
              <button
                type="button"
                className="user-actions__primary"
                onClick={() => onTopup(depositAmount)}
                disabled={isProcessingTopup || depositAmount <= 0}
              >
                <span className="material-symbols-outlined" aria-hidden="true">add_card</span>
                {isProcessingTopup ? "Procesando..." : "Depositar créditos"}
              </button>
              <button type="button" className="user-actions__secondary" onClick={onWithdraw}>
                <span className="material-symbols-outlined" aria-hidden="true">payments</span>
                Retirar créditos
              </button>
            </div>
          </article>
        </section>

        <section className="user-transactions">
          <header className="user-transactions__header">
            <div>
              <h2>Historial de transacciones</h2>
              <p>Movimientos recientes en tu cuenta</p>
            </div>
            <div className="user-transactions__filters">
              <label className="user-search">
                <span className="material-symbols-outlined" aria-hidden="true">search</span>
                <input
                  type="search"
                  placeholder="Buscar transacción..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                className="user-select"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as UserTransactionType | "all")}
              >
                <option value="all">Todos los tipos</option>
                <option value="deposit">Depósitos</option>
                <option value="withdraw">Retiros</option>
                <option value="purchase">Compras</option>
                <option value="prize">Premios</option>
              </select>
              <select className="user-select" value={rangeFilter} onChange={(event) => setRangeFilter(event.target.value)}>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Este año</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </header>

          <div className="user-transactions__table-wrapper">
            <table className="user-transactions__table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Descripción</th>
                  <th scope="col" className="user-transactions__amount-heading">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => {
                  const badge = typeBadge(txn.type);
                  return (
                    <tr key={txn.id}>
                      <td data-label="Fecha">{formatDate(txn.timestamp)}</td>
                      <td data-label="Tipo">
                        <span className={badge.className}>
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {badge.icon}
                          </span>
                          {badge.label}
                        </span>
                      </td>
                      <td data-label="Descripción">{txn.description}</td>
                      <td
                        data-label="Monto"
                        className={`user-transactions__amount user-transactions__amount--${txn.type}`}
                      >
                        {formatAmount(txn.amount)}
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="user-transactions__empty">
                      No se encontraron movimientos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [email, setEmail] = useState("admin@bingo.local");
  const [password, setPassword] = useState("admin123");
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
  const [isFetchingMe, setIsFetchingMe] = useState(false);
  const [isTopupProcessing, setIsTopupProcessing] = useState(false);
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>(USER_SAMPLE_TRANSACTIONS);
  const [userView, setUserView] = useState<UserView>("balance");

  const logged = !!localStorage.getItem("token");
  const isAdmin = me?.is_admin ?? false;
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
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      setMsg("Sesión iniciada");
      const profile = await fetchMe();
      if (profile?.is_admin) {
        setTickets([]);
        setGames([]);
        setSelectedGameId(null);
        setGameState(null);
        setAutoRefresh(false);
        return;
      }
      await fetchTickets();
      await fetchGames();
    } catch (error: unknown) {
      setMsg("");
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as any).response?.data
      ) {
        setErrors((error as any).response.data as string);
      } else {
        setErrors("No se pudo iniciar sesión, inténtalo de nuevo");
      }
    }
  }

  async function fetchGames() {
    const res = await api.get("/games");
    setGames(res.data.items);
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
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as any).response?.status === 401
      ) {
        localStorage.removeItem("token");
        setMsg("La sesión expiró. Inicia sesión nuevamente.");
      }
      return null;
    } finally {
      setIsFetchingMe(false);
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

  async function topup(amountOverride?: number) {
    const amount = Number(amountOverride ?? topupAmount);
    setErrors("");
    setMsg("");
    if (!logged || !Number.isFinite(amount) || amount <= 0) {
      setErrors("El monto debe ser mayor a 0");
      return;
    }
    try {
      setIsTopupProcessing(true);
      const { data } = await api.post(`/wallet/topup`, { amount });
      setMsg(`Saldo actualizado: $${data.balance.toFixed(2)}`);
      if (amountOverride !== undefined) {
        setTopupAmount(5);
      }
      await fetchMe();
      setUserTransactions((prev) => [
        {
          id: `TXU-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "deposit" as UserTransactionType,
          description: "Recarga manual de créditos",
          amount,
        },
        ...prev,
      ].slice(0, 50));
    } catch (e: any) {
      setMsg("");
      setErrors(e?.response?.data || "Error al recargar");
    } finally {
      setIsTopupProcessing(false);
    }
  }

  function handleWithdrawal() {
    setMsg("La solicitud de retiro estará disponible próximamente.");
    setUserTransactions((prev) => [
      {
        id: `TXU-${Date.now()}-WD`,
        timestamp: new Date().toISOString(),
        type: "withdraw" as UserTransactionType,
        description: "Solicitud de retiro registrada",
        amount: -50,
      },
      ...prev,
    ].slice(0, 50));
  }

  function logout() {
    localStorage.removeItem("token");
    setMe(null);
    setTickets([]);
    setMsg("Sesión cerrada");
    setUserTransactions(USER_SAMPLE_TRANSACTIONS);
    setUserView("balance");
  }

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (!logged) {
      setMe(null);
      setTickets([]);
      return;
    }
    (async () => {
      const profile = await fetchMe();
      if (profile?.is_admin) {
        setTickets([]);
        setGames([]);
        return;
      }
      await fetchTickets();
      await fetchGames();
    })();
  }, [logged]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    setSelectedGameId(null);
    setGameState(null);
    setAutoRefresh(false);
  }, [isAdmin]);

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
    return <AdminDashboard me={me} onLogout={logout} transactions={ADMIN_SAMPLE_TRANSACTIONS} />;
  }

  if (logged && me && !me.is_admin) {
    if (userView === "stats") {
      return <UserStats me={me} onLogout={logout} currentView={userView} onNavigate={(view) => setUserView(view)} />;
    }

    if (userView === "join") {
      return <UserJoinGames me={me} onLogout={logout} currentView={userView} onNavigate={(view) => setUserView(view)} />;
    }

    if (userView === "create") {
      return <UserCreateGame me={me} onLogout={logout} currentView={userView} onNavigate={(view) => setUserView(view)} />;
    }

    return (
      <UserDashboard
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
          <button className="btn primary" onClick={() => topup()} disabled={!canTopup}>Recargar</button>
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
