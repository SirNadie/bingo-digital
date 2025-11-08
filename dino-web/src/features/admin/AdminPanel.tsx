import { useEffect, useMemo, useState } from "react";
import { formatCredits } from "../../utils/format";
import {
  ADMIN_ACTIVITY_ITEMS,
  ADMIN_NAV_ITEMS,
  ADMIN_SAMPLE_GAMES,
  ADMIN_SAMPLE_USERS,
  ADMIN_SUPPORT_ITEMS,
  ADMIN_USER_METRICS,
  ADMIN_VIEW_META,
} from "./constants";
import { AdminTransaction, AdminView, Me } from "../../types";

type AdminPanelProps = {
  me: Me;
  transactions: AdminTransaction[];
  onLogout: () => void;
};

export function AdminPanel({ me, transactions, onLogout }: AdminPanelProps) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    if (view !== "transactions") {
      setSearch("");
    }
  }, [view]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = (event: MediaQueryList | MediaQueryListEvent) => {
      const matches = event.matches;
      setIsMobile(matches);
      if (!matches) {
        setSidebarOpen(false);
      }
    };
    update(mq);
    const listener = (event: MediaQueryListEvent) => update(event);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    // @ts-ignore - fallback for older browsers
    mq.addListener(update);
    return () => {
      // @ts-ignore
      mq.removeListener(update);
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    if (isMobile) {
      window.addEventListener("keydown", handleKey);
    }
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMobile]);

  const getInitials = (user: string) => {
    const parts = user.split(/[^a-zA-Z0-9]/).filter(Boolean);
    if (parts.length) {
      return parts
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return user.slice(0, 2).toUpperCase();
  };

  const getTypeMeta = (type: AdminTransaction["type"]) =>
    type === "deposit"
      ? { icon: "south_west", label: "Depósito", tone: "deposit" }
      : { icon: "north_east", label: "Retiro", tone: "withdraw" };

  const isDrawerOpen = isMobile ? isSidebarOpen : true;
  const layoutClassName = [
    "admin-layout",
    isSidebarCollapsed ? "admin-layout--collapsed" : "",
    isMobile ? "admin-layout--mobile" : "",
    isDrawerOpen ? "admin-layout--sidebar-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const viewMeta = ADMIN_VIEW_META[view];

  const handleLogout = () => {
    setView("dashboard");
    onLogout();
  };

  return (
    <div className={layoutClassName}>
      <aside id="admin-sidebar" className="admin-sidebar" aria-hidden={isMobile ? !isSidebarOpen : false}>
        <div className="admin-sidebar__scroll">
          <div className="admin-sidebar__header">
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
            {ADMIN_NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`admin-sidebar__link ${view === item.view ? "admin-sidebar__link--active" : ""}`}
                onClick={() => {
                  setView(item.view);
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
                aria-pressed={view === item.view}
                aria-label={item.label}
              >
                <span
                  className="material-symbols-outlined"
                  style={view === item.view ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="admin-sidebar__label">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="admin-sidebar__footer">
            {ADMIN_SUPPORT_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="admin-sidebar__link"
                onClick={
                  item.action === "logout"
                    ? handleLogout
                    : () => {
                        if (isMobile) {
                          setSidebarOpen(false);
                        }
                      }
                }
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="admin-sidebar__label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {isMobile && (
        <>
          <button
            type="button"
            className="admin-sidebar__hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de administración"
            aria-expanded={isSidebarOpen}
            aria-controls="admin-sidebar"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              menu
            </span>
          </button>
          <div
            className="admin-layout__overlay"
            role="presentation"
            onClick={() => setSidebarOpen(false)}
            aria-hidden={!isSidebarOpen}
          />
        </>
      )}

      <main className="admin-dashboard">
        <div className="admin-dashboard__inner">
          <div className="admin-brand-chip">
            <div className="admin-avatar" aria-hidden="true" />
            <div className="admin-brand-chip__text">
              <h1 className="admin-brand-chip__title">Admin Bingo</h1>
              <p className="admin-brand-chip__subtitle">Panel de Administración</p>
            </div>
          </div>
          <header className="admin-page-header">
            <div>
              {viewMeta.eyebrow && <p className="admin-page-header__eyebrow">{viewMeta.eyebrow}</p>}
              <h2 className="admin-page-header__title">{viewMeta.title}</h2>
              {viewMeta.subtitle && <p className="admin-page-header__subtitle">{viewMeta.subtitle}</p>}
            </div>
            <div className="admin-page-header__actions">
              {viewMeta.secondaryAction && (
                <button type="button" className="admin-page-header__button admin-page-header__button--ghost">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {viewMeta.secondaryAction.icon}
                  </span>
                  <span>{viewMeta.secondaryAction.label}</span>
                </button>
              )}
              <button type="button" className="admin-page-header__button">
                <span className="material-symbols-outlined" aria-hidden="true">
                  {viewMeta.primaryAction.icon}
                </span>
                <span>{viewMeta.primaryAction.label}</span>
              </button>
            </div>
          </header>

          {view === "dashboard" && <AdminDashboardView totalTransactions={totalTransactions} />}

          {view === "transactions" && (
            <AdminTransactionsView
              search={search}
              onSearch={setSearch}
              transactions={filteredTransactions}
              pendingCount={pendingCount}
              getTypeMeta={getTypeMeta}
              getInitials={getInitials}
            />
          )}

          {view === "users" && <AdminUsersView />}

          {view === "games" && <AdminGamesView />}
        </div>
      </main>
    </div>
  );
}

type AdminDashboardViewProps = {
  totalTransactions: number;
};

const AdminDashboardView = ({ totalTransactions }: AdminDashboardViewProps) => (
  <>
    <section className="admin-chipbar" aria-label="Filtros temporales">
      <button type="button" className="admin-chip admin-chip--active">
        Últimas 24h
      </button>
      <button type="button" className="admin-chip">
        Últimos 7 días
      </button>
      <button type="button" className="admin-chip">
        Últimos 30 días
      </button>
      <button type="button" className="admin-chip admin-chip--icon">
        <span>Rango personalizado</span>
        <span className="material-symbols-outlined" aria-hidden="true">
          calendar_month
        </span>
      </button>
    </section>

    <section className="admin-metrics">
      <article className="admin-card admin-card--metric">
        <header>
          <span className="material-symbols-outlined" aria-hidden="true">
            group
          </span>
          <p>Usuarios totales</p>
        </header>
        <strong>12,456</strong>
        <span className="admin-metric__trend admin-metric__trend--up">+2.5%</span>
      </article>
      <article className="admin-card admin-card--metric">
        <header>
          <span className="material-symbols-outlined" aria-hidden="true">
            casino
          </span>
          <p>Partidas activas</p>
        </header>
        <strong>87</strong>
        <span className="admin-metric__trend admin-metric__trend--up">+5.1%</span>
      </article>
      <article className="admin-card admin-card--metric">
        <header>
          <span className="material-symbols-outlined" aria-hidden="true">
            payments
          </span>
          <p>Ingresos totales</p>
        </header>
        <strong>{formatCredits(98230)}</strong>
        <span className="admin-metric__trend admin-metric__trend--up">+10.2%</span>
      </article>
      <article className="admin-card admin-card--metric">
        <header>
          <span className="material-symbols-outlined" aria-hidden="true">
            account_balance_wallet
          </span>
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
            <strong>{formatCredits(45890)}</strong>
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
            <path
              d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
              fill="url(#revenueGradient)"
            />
            <path
              d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
              strokeWidth="3"
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
      <article className="admin-card admin-card--activity">
        <header>
          <p className="admin-card__title">Actividad reciente</p>
        </header>
        <ul className="admin-activity">
          {ADMIN_ACTIVITY_ITEMS.slice(0, 20).map((item) => (
            <li key={item.id}>
              <div className={`admin-activity__icon admin-activity__icon--${item.tone}`}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {item.icon}
                </span>
              </div>
              <div className="admin-activity__content">
                <p>
                  {item.description} <strong>{item.title}</strong>
                </p>
                <time>{item.time}</time>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  </>
);

type AdminTransactionsViewProps = {
  search: string;
  onSearch: (value: string) => void;
  transactions: AdminTransaction[];
  pendingCount: number;
  getTypeMeta: (type: AdminTransaction["type"]) => { icon: string; label: string; tone: string };
  getInitials: (user: string) => string;
};

const AdminTransactionsView = ({
  search,
  onSearch,
  transactions,
  pendingCount,
  getInitials,
  getTypeMeta,
}: AdminTransactionsViewProps) => (
  <section className="admin-card admin-card--table">
    <header className="admin-card__header">
      <div>
        <p className="admin-card__title">Transacciones recientes</p>
        <span>{pendingCount} pendientes de aprobación</span>
      </div>
      <label className="admin-search">
        <span className="material-symbols-outlined" aria-hidden="true">
          search
        </span>
        <input
          type="search"
          placeholder="Buscar por usuario o ID"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>
    </header>
    <div className="admin-table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Usuario</th>
            <th scope="col">Fecha</th>
            <th scope="col">Monto</th>
            <th scope="col">Tipo</th>
            <th scope="col">Estado</th>
            <th scope="col" className="admin-transactions__actions-header">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => {
            const badge = getTypeMeta(txn.type);
            return (
              <tr key={txn.id}>
                <td>
                  <div className="admin-table-user">
                    <span className="admin-avatar admin-avatar--small" aria-hidden="true">
                      {getInitials(txn.user)}
                    </span>
                    <div>
                      <strong>{txn.user}</strong>
                      <p>{txn.id}</p>
                    </div>
                  </div>
                </td>
                <td>{txn.timestamp}</td>
                <td className={`admin-amount admin-amount--${txn.type}`}>{formatCredits(txn.amount)}</td>
                <td>
                  <span className={`admin-chip admin-chip--${badge.tone}`}>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {badge.icon}
                    </span>
                    {badge.label}
                  </span>
                </td>
                <td>
                  <span className={`admin-status admin-status--${txn.status}`}>{txn.status}</span>
                </td>
                <td className="admin-transactions__actions-cell">
                  <div className="admin-transactions__row-actions">
                    <button type="button" className="admin-transactions__row-button admin-transactions__row-button--deny">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        cancel
                      </span>
                    </button>
                    <button
                      type="button"
                      className="admin-transactions__row-button admin-transactions__row-button--approve"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        check_circle
                      </span>
                    </button>
                    <button
                      type="button"
                      className="admin-transactions__row-button admin-transactions__row-button--neutral"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        more_vert
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

const AdminUsersView = () => (
  <>
    <section className="admin-metrics admin-metrics--users">
      {ADMIN_USER_METRICS.map((metric) => (
        <article key={metric.label} className="admin-card admin-card--metric admin-card--metricCompact">
          <header>
            <span className="material-symbols-outlined" aria-hidden="true">
              {metric.icon}
            </span>
            <p>{metric.label}</p>
          </header>
          <strong>{metric.value}</strong>
          <span className={`admin-metric__trend admin-metric__trend--${metric.tone}`}>{metric.trend}</span>
        </article>
      ))}
    </section>
    <section className="admin-card admin-card--table">
      <header className="admin-card__header">
        <div>
          <p className="admin-card__title">Jugadores recientes</p>
          <span>Últimas actividades en la plataforma</span>
        </div>
      </header>
      <div className="admin-table-wrapper">
        <table>
          <thead>
            <tr>
              <th scope="col">Alias</th>
              <th scope="col">Email</th>
              <th scope="col">Estado</th>
              <th scope="col">Balance</th>
              <th scope="col">Visto</th>
              <th scope="col">Partidas</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_SAMPLE_USERS.map((user) => (
              <tr key={user.id}>
                <td>{user.alias}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`admin-status admin-status--${user.tone}`}>{user.status}</span>
                </td>
                <td>{formatCredits(user.balance)}</td>
                <td>{user.lastSeen}</td>
                <td>{user.gamesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
);

const AdminGamesView = () => (
  <section className="admin-card admin-card--table">
    <header className="admin-card__header">
      <div>
        <p className="admin-card__title">Salas activas</p>
        <span>Monitorea partidas y su evolución</span>
      </div>
    </header>
    <div className="admin-table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Sala</th>
            <th scope="col">Anfitrión</th>
            <th scope="col">Horario</th>
            <th scope="col">Premios</th>
            <th scope="col">Estado</th>
            <th scope="col">Buy-in</th>
            <th scope="col">Pozo</th>
            <th scope="col">Jugadores</th>
          </tr>
        </thead>
        <tbody>
          {ADMIN_SAMPLE_GAMES.map((game) => (
            <tr key={game.id}>
              <td>{game.name}</td>
              <td>{game.host}</td>
              <td>{game.schedule}</td>
              <td>{game.reward}</td>
              <td>
                <span className={`admin-status admin-status--${game.tone}`}>{game.status}</span>
              </td>
              <td>{formatCredits(game.buyIn)}</td>
              <td>{formatCredits(game.pot)}</td>
              <td>
                {game.players}/{game.capacity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminPanel;
