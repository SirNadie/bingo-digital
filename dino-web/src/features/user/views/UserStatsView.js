import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchUserStats } from "../../../api/http";
import { formatCredits } from "../../../utils/format";
import UserHeader from "../components/UserHeader";
export function UserStatsView({ me, onLogout, currentView, onNavigate }) {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [rangeFilter, setRangeFilter] = useState("30");
    useEffect(() => {
        const loadStats = async () => {
            try {
                setIsLoading(true);
                const days = rangeFilter === "all" ? undefined : parseInt(rangeFilter, 10);
                const data = await fetchUserStats(days);
                setStats(data);
            }
            catch (err) {
                console.error("Error loading stats:", err);
                setStats(null);
            }
            finally {
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
    return (_jsxs("div", { className: "user-stats-shell", children: [_jsx(UserHeader, { view: currentView, balance: me.balance, userEmail: me.email, onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "user-stats-main", children: [_jsxs("section", { className: "user-stats-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Mis estad\u00EDsticas" }), _jsx("p", { children: "Tu rendimiento y actividad en el juego." })] }), _jsxs("div", { className: "user-stats-filters", children: [_jsx("button", { type: "button", className: `user-stats-chip ${rangeFilter === "7" ? "user-stats-chip--active" : "user-stats-chip--ghost"}`, onClick: () => setRangeFilter("7"), children: "\u00DAltimos 7 d\u00EDas" }), _jsx("button", { type: "button", className: `user-stats-chip ${rangeFilter === "30" ? "user-stats-chip--active" : "user-stats-chip--ghost"}`, onClick: () => setRangeFilter("30"), children: "\u00DAltimo mes" }), _jsx("button", { type: "button", className: `user-stats-chip ${rangeFilter === "all" ? "user-stats-chip--active" : "user-stats-chip--ghost"}`, onClick: () => setRangeFilter("all"), children: "Desde siempre" })] })] }), isLoading ? (_jsx("section", { className: "user-stats-loading", children: _jsx("p", { children: "Cargando estad\u00EDsticas..." }) })) : stats ? (_jsxs(_Fragment, { children: [_jsx("section", { className: "user-stats-overview", children: overviewItems.map((item) => (_jsxs("article", { children: [_jsx("p", { children: item.label }), _jsx("strong", { children: item.value })] }, item.label))) }), _jsxs("section", { className: "user-stats-panels", children: [_jsxs("article", { className: "user-stats-chart", children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("p", { children: "Balance neto" }), _jsx("span", { children: "Per\u00EDodo seleccionado" })] }), _jsxs("div", { className: "user-stats-chart__highlight", children: [_jsxs("strong", { className: netBalanceChange >= 0 ? "positive" : "negative", children: [netBalanceChange >= 0 ? "+" : "", formatCredits(netBalanceChange)] }), _jsxs("span", { children: [netBalancePercent, "%"] })] })] }), _jsxs("div", { className: "user-stats-chart__summary", children: [_jsxs("div", { className: "user-stats-summary-item", children: [_jsx("span", { className: "material-symbols-outlined positive", "aria-hidden": "true", children: "trending_up" }), _jsxs("div", { children: [_jsx("p", { children: "Ganado" }), _jsx("strong", { children: formatCredits(stats.total_earned) })] })] }), _jsxs("div", { className: "user-stats-summary-item", children: [_jsx("span", { className: "material-symbols-outlined negative", "aria-hidden": "true", children: "trending_down" }), _jsxs("div", { children: [_jsx("p", { children: "Gastado" }), _jsx("strong", { children: formatCredits(stats.total_spent) })] })] })] })] }), _jsxs("article", { className: "user-stats-highlights", children: [_jsx("header", { className: "user-stats-highlights__header", children: _jsxs("div", { children: [_jsx("p", { className: "user-stats-highlights__eyebrow", children: "Tus mejores momentos" }), _jsx("h3", { children: "Resumen de logros" })] }) }), _jsx("ul", { className: "user-stats-highlights__grid", children: highlightItems.map((item) => (_jsxs("li", { className: "user-stats-highlights__card", children: [_jsx("div", { className: "user-stats-highlights__icon", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: item.icon }) }), _jsxs("div", { className: "user-stats-highlights__content", children: [_jsx("p", { children: item.label }), _jsx("strong", { children: item.value })] })] }, item.label))) })] })] })] })) : (_jsx("section", { className: "user-stats-empty", children: _jsx("p", { children: "No hay estad\u00EDsticas disponibles a\u00FAn. \u00A1Comienza a jugar!" }) }))] })] }));
}
export default UserStatsView;
