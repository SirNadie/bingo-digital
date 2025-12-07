import { useState, useMemo } from "react";
import { formatCredits } from "../../../utils/format";
import type { AdminStats, AdminActivityItem } from "../../../types";

export type TimeRange = "24h" | "7d" | "30d";

type AdminDashboardViewProps = {
    stats: AdminStats | null;
    activity: AdminActivityItem[];
    isLoading: boolean;
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
    dataUpdatedAt: number | undefined;
};

function getRelativeTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return "ahora mismo";
    if (seconds < 60) return `hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes}m`;
    return `hace ${Math.floor(minutes / 60)}h`;
}

export function AdminDashboardView({
    stats,
    activity,
    isLoading,
    timeRange,
    onTimeRangeChange,
    dataUpdatedAt,
}: AdminDashboardViewProps) {
    const [, setTick] = useState(0);

    // Update relative time every 10 seconds
    useMemo(() => {
        const interval = setInterval(() => setTick((t) => t + 1), 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <section className="admin-chipbar" aria-label="Filtros temporales">
                <button
                    type="button"
                    className={`admin-chip ${timeRange === "24h" ? "admin-chip--active" : ""}`}
                    onClick={() => onTimeRangeChange("24h")}
                >
                    Últimas 24h
                </button>
                <button
                    type="button"
                    className={`admin-chip ${timeRange === "7d" ? "admin-chip--active" : ""}`}
                    onClick={() => onTimeRangeChange("7d")}
                >
                    Últimos 7 días
                </button>
                <button
                    type="button"
                    className={`admin-chip ${timeRange === "30d" ? "admin-chip--active" : ""}`}
                    onClick={() => onTimeRangeChange("30d")}
                >
                    Últimos 30 días
                </button>
                {dataUpdatedAt && (
                    <span className="admin-chip admin-chip--info">
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>
                            schedule
                        </span>
                        Actualizado {getRelativeTime(dataUpdatedAt)}
                    </span>
                )}
            </section>

            <section className="admin-metrics">
                <article className="admin-card admin-card--metric">
                    <header>
                        <span className="material-symbols-outlined" aria-hidden="true">
                            group
                        </span>
                        <p>Usuarios totales</p>
                    </header>
                    {isLoading ? (
                        <div className="admin-skeleton admin-skeleton--number" />
                    ) : (
                        <strong>{stats?.total_users?.toLocaleString() ?? 0}</strong>
                    )}
                    <span className="admin-metric__trend admin-metric__trend--neutral">Total</span>
                </article>
                <article className="admin-card admin-card--metric">
                    <header>
                        <span className="material-symbols-outlined" aria-hidden="true">
                            casino
                        </span>
                        <p>Partidas activas</p>
                    </header>
                    {isLoading ? (
                        <div className="admin-skeleton admin-skeleton--number" />
                    ) : (
                        <strong>{stats?.active_games ?? 0}</strong>
                    )}
                    <span className="admin-metric__trend admin-metric__trend--neutral">En vivo</span>
                </article>
                <article className="admin-card admin-card--metric">
                    <header>
                        <span className="material-symbols-outlined" aria-hidden="true">
                            payments
                        </span>
                        <p>Ingresos totales</p>
                    </header>
                    {isLoading ? (
                        <div className="admin-skeleton admin-skeleton--number" />
                    ) : (
                        <strong>{formatCredits(stats?.total_revenue ?? 0)}</strong>
                    )}
                    <span className="admin-metric__trend admin-metric__trend--neutral">Depósitos</span>
                </article>
                <article className="admin-card admin-card--metric">
                    <header>
                        <span className="material-symbols-outlined" aria-hidden="true">
                            account_balance_wallet
                        </span>
                        <p>Movimientos hoy</p>
                    </header>
                    {isLoading ? (
                        <div className="admin-skeleton admin-skeleton--number" />
                    ) : (
                        <strong>{stats?.today_transactions ?? 0}</strong>
                    )}
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
                        {isLoading && (
                            <>
                                <li className="admin-activity__skeleton" />
                                <li className="admin-activity__skeleton" />
                                <li className="admin-activity__skeleton" />
                            </>
                        )}
                        {!isLoading && activity.length === 0 && (
                            <li className="admin-activity__empty">
                                <span className="material-symbols-outlined" aria-hidden="true">inbox</span>
                                <p>No hay actividad reciente</p>
                            </li>
                        )}
                        {!isLoading && activity.slice(0, 10).map((item) => (
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
}
