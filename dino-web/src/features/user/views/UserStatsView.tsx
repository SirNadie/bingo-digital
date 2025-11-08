import { Me, UserView } from "../../../types";
import UserHeader from "../components/UserHeader";
import { USER_STATS_HIGHLIGHTS, USER_STATS_OVERVIEW } from "../constants";

type UserStatsViewProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

export function UserStatsView({ me, onLogout, currentView, onNavigate }: UserStatsViewProps) {
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
            <button type="button" className="user-stats-chip user-stats-chip--ghost">
              Últimos 7 días
            </button>
            <button type="button" className="user-stats-chip user-stats-chip--active">
              Último mes
            </button>
            <button type="button" className="user-stats-chip user-stats-chip--ghost">
              Desde siempre
            </button>
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
            <header className="user-stats-highlights__header">
              <div>
                <p className="user-stats-highlights__eyebrow">Tus mejores momentos</p>
                <h3>Resumen de logros</h3>
              </div>
            </header>
            <ul className="user-stats-highlights__grid">
              {USER_STATS_HIGHLIGHTS.map((item) => (
                <li key={item.label} className="user-stats-highlights__card">
                  <div className="user-stats-highlights__icon">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>
                  <div className="user-stats-highlights__content">
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

export default UserStatsView;
