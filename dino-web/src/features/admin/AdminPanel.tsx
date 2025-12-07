import { useEffect, useMemo, useState, useCallback } from "react";
import { formatCredits } from "../../utils/format";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_SUPPORT_ITEMS,
  ADMIN_VIEW_META,
} from "./constants";
import { AdminTransaction, AdminView, Me, AdminStats, AdminUser, AdminGame, AdminActivityItem } from "../../types";
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminGames,
  fetchAdminTransactions,
  fetchAdminActivity,
} from "../../api/http";

type AdminPanelProps = {
  me: Me;
  onLogout: () => void;
};

export function AdminPanel({ me, onLogout }: AdminPanelProps) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");

  // Real data state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [games, setGames] = useState<AdminGame[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all admin data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, usersData, gamesData, txnData, activityData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminUsers(),
        fetchAdminGames(),
        fetchAdminTransactions(),
        fetchAdminActivity(),
      ]);
      setStats(statsData);
      setUsers(usersData.items.map((u: any) => ({
        ...u,
        lastSeen: u.last_seen,
        gamesPlayed: u.games_played,
      })));
      setGames(gamesData.items.map((g: any) => ({
        ...g,
        buyIn: g.buy_in,
      })));
      setTransactions(txnData.items);
      setActivity(activityData.items);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount and poll every 10 seconds for real-time updates
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [loadData]);

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

          {view === "dashboard" && <AdminDashboardView stats={stats} activity={activity} isLoading={isLoading} />}

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

          {view === "users" && <AdminUsersView users={users} isLoading={isLoading} />}

          {view === "games" && <AdminGamesView games={games} isLoading={isLoading} />}
        </div>
      </main>
    </div>
  );
}

type AdminDashboardViewProps = {
  stats: import("../../types").AdminStats | null;
  activity: import("../../types").AdminActivityItem[];
  isLoading: boolean;
};

const AdminDashboardView = ({ stats, activity, isLoading }: AdminDashboardViewProps) => (
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
        <strong>{isLoading ? "..." : (stats?.total_users?.toLocaleString() ?? 0)}</strong>
        <span className="admin-metric__trend admin-metric__trend--neutral">Total</span>
      </article>
      <article className="admin-card admin-card--metric">
        <header>
          <span className="material-symbols-outlined" aria-hidden="true">
            casino
          </span>
          <p>Partidas activas</p>
        </header>
        <strong>{isLoading ? "..." : (stats?.active_games ?? 0)}</strong>
        <span className="admin-metric__trend admin-metric__trend--neutral">En vivo</span>
      </article>
      <article className="admin-card admin-card--metric">
        <header>
          <span className="material-symbols-outlined" aria-hidden="true">
            payments
          </span>
          <p>Ingresos totales</p>
        </header>
        <strong>{isLoading ? "..." : formatCredits(stats?.total_revenue ?? 0)}</strong>
        <span className="admin-metric__trend admin-metric__trend--neutral">Depósitos</span>
      </article>
      <article className="admin-card admin-card--metric">
        <header>
          <span className="material-symbols-outlined" aria-hidden="true">
            account_balance_wallet
          </span>
          <p>Movimientos hoy</p>
        </header>
        <strong>{isLoading ? "..." : (stats?.today_transactions ?? 0)}</strong>
        <span className="admin-metric__trend admin-metric__trend--neutral">Resumen</span>
      </article>
    </section>

    <section className="admin-grid">
      <article className="admin-card admin-card--chart">
        <header>
          <p className="admin-card__title">Resumen de plataforma</p>
          <div className="admin-card__summary">
            <strong>{formatCredits(stats?.total_pot ?? 0)}</strong>
            <span className="admin-metric__trend admin-metric__trend--neutral">Pozo total</span>
          </div>
        </header>
        <p className="admin-card__caption">Estadísticas generales</p>
        <div className="admin-stats-summary">
          <div className="admin-stat-item">
            <span className="material-symbols-outlined" aria-hidden="true">sports_esports</span>
            <div>
              <p>Partidas finalizadas</p>
              <strong>{stats?.total_games_finished ?? 0}</strong>
            </div>
          </div>
          <div className="admin-stat-item">
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }} aria-hidden="true">account_balance</span>
            <div>
              <p>Ingresos Sistema</p>
              <strong>{formatCredits(stats?.total_system_revenue ?? 0)}</strong>
            </div>
          </div>
        </div>
      </article>
      <article className="admin-card admin-card--activity">
        <header>
          <p className="admin-card__title">Actividad reciente</p>
        </header>
        <ul className="admin-activity">
          {activity.length === 0 && !isLoading && (
            <li className="admin-activity__empty">No hay actividad reciente</li>
          )}
          {activity.slice(0, 10).map((item) => (
            <li key={item.id}>
              <div className={`admin-activity__icon admin-activity__icon--${item.tone}`}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {item.icon}
                </span>
              </div>
              <div className="admin-activity__content">
                <p>
                  <strong>{item.title}</strong> {item.description}
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

type AdminUsersViewProps = {
  users: import("../../types").AdminUser[];
  isLoading: boolean;
};

const AdminUsersView = ({ users, isLoading }: AdminUsersViewProps) => (
  <>
    <section className="admin-metrics admin-metrics--users">
      <article className="admin-card admin-card--metric admin-card--metricCompact">
        <header>
          <span className="material-symbols-outlined" aria-hidden="true">group</span>
          <p>Total usuarios</p>
        </header>
        <strong>{users.length}</strong>
        <span className="admin-metric__trend admin-metric__trend--neutral">Registrados</span>
      </article>
    </section>
    <section className="admin-card admin-card--table">
      <header className="admin-card__header">
        <div>
          <p className="admin-card__title">Jugadores registrados</p>
          <span>Lista de usuarios en la plataforma</span>
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
            {isLoading && (
              <tr><td colSpan={6}>Cargando usuarios...</td></tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr><td colSpan={6}>No hay usuarios registrados</td></tr>
            )}
            {users.map((user) => (
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

type AdminGamesViewProps = {
  games: import("../../types").AdminGame[];
  isLoading: boolean;
};

const AdminGamesView = ({ games, isLoading }: AdminGamesViewProps) => (
  <section className="admin-card admin-card--table">
    <header className="admin-card__header">
      <div>
        <p className="admin-card__title">Salas de juego</p>
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
          {isLoading && (
            <tr><td colSpan={8}>Cargando partidas...</td></tr>
          )}
          {!isLoading && games.length === 0 && (
            <tr><td colSpan={8}>No hay partidas registradas</td></tr>
          )}
          {games.map((game) => (
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
              <td>{game.players}/{game.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default AdminPanel;
