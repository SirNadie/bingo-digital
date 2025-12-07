import { useEffect, useState } from "react";
import { Me, UserView, UserStats } from "../../../types";
import { fetchUserStats } from "../../../api/http";
import { formatCredits } from "../../../utils/format";
import UserHeader from "../components/UserHeader";

type UserStatsViewProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

type RangeFilter = "7" | "30" | "all";

export function UserStatsView({ me, onLogout, currentView, onNavigate }: UserStatsViewProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("30");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const days = rangeFilter === "all" ? undefined : parseInt(rangeFilter, 10);
        const data = await fetchUserStats(days);
        setStats(data);
      } catch (err) {
        console.error("Error loading stats:", err);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [rangeFilter]);

  const overviewItems = stats
    ? [
      { label: "Partidas jugadas", value: stats.games_played.toString() },
      { label: "Porcentaje de victorias", value: `${stats.win_rate.toFixed(1)}%` },
      { label: "Créditos ganados", value: formatCredits(stats.total_earned) },
      { label: "Créditos gastados", value: formatCredits(stats.total_spent) },
    ]
    : [];

  const highlightItems = stats
    ? [
      { icon: "emoji_events", label: "Mayor premio", value: formatCredits(stats.biggest_prize) },
      { icon: "casino", label: "Bingos cantados", value: stats.bingos_won.toString() },
      { icon: "linear_scale", label: "Líneas completadas", value: stats.lines_won.toString() },
      { icon: "change_history", label: "Diagonales logradas", value: stats.diagonals_won.toString() },
    ]
    : [];

  const netBalanceChange = stats ? stats.net_balance : 0;
  const netBalancePercent = stats && stats.total_spent > 0
    ? ((stats.net_balance / stats.total_spent) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="user-stats-shell">
      <UserHeader view={currentView} balance={me.balance} userEmail={me.email} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="user-stats-main">
        <section className="user-stats-header">
          <div>
            <h2>Mis estadísticas</h2>
            <p>Tu rendimiento y actividad en el juego.</p>
          </div>
          <div className="user-stats-filters">
            <button
              type="button"
              className={`user-stats-chip ${rangeFilter === "7" ? "user-stats-chip--active" : "user-stats-chip--ghost"}`}
              onClick={() => setRangeFilter("7")}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              className={`user-stats-chip ${rangeFilter === "30" ? "user-stats-chip--active" : "user-stats-chip--ghost"}`}
              onClick={() => setRangeFilter("30")}
            >
              Último mes
            </button>
            <button
              type="button"
              className={`user-stats-chip ${rangeFilter === "all" ? "user-stats-chip--active" : "user-stats-chip--ghost"}`}
              onClick={() => setRangeFilter("all")}
            >
              Desde siempre
            </button>
          </div>
        </section>

        {isLoading ? (
          <section className="user-stats-loading">
            <p>Cargando estadísticas...</p>
          </section>
        ) : stats ? (
          <>
            <section className="user-stats-overview">
              {overviewItems.map((item) => (
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
                    <p>Balance neto</p>
                    <span>Período seleccionado</span>
                  </div>
                  <div className="user-stats-chart__highlight">
                    <strong className={netBalanceChange >= 0 ? "positive" : "negative"}>
                      {netBalanceChange >= 0 ? "+" : ""}{formatCredits(netBalanceChange)}
                    </strong>
                    <span>{netBalancePercent}%</span>
                  </div>
                </header>
                <div className="user-stats-chart__summary">
                  <div className="user-stats-summary-item">
                    <span className="material-symbols-outlined positive" aria-hidden="true">
                      trending_up
                    </span>
                    <div>
                      <p>Ganado</p>
                      <strong>{formatCredits(stats.total_earned)}</strong>
                    </div>
                  </div>
                  <div className="user-stats-summary-item">
                    <span className="material-symbols-outlined negative" aria-hidden="true">
                      trending_down
                    </span>
                    <div>
                      <p>Gastado</p>
                      <strong>{formatCredits(stats.total_spent)}</strong>
                    </div>
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
                  {highlightItems.map((item) => (
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
          </>
        ) : (
          <section className="user-stats-empty">
            <p>No hay estadísticas disponibles aún. ¡Comienza a jugar!</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default UserStatsView;
