import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, lazy, Suspense } from "react";
import { ADMIN_NAV_ITEMS, ADMIN_SUPPORT_ITEMS, ADMIN_VIEW_META, } from "./constants";
import { useAdminStats, useAdminUsers, useAdminGames, useAdminTransactions, useAdminActivity, } from "../../hooks/useAdmin";
import { useAdminWebSocket } from "../../hooks/useAdminWebSocket";
// Lazy load admin views
const AdminDashboardView = lazy(() => import("./components/AdminDashboardView").then(module => ({ default: module.AdminDashboardView })));
const AdminTransactionsView = lazy(() => import("./components/AdminTransactionsView").then(module => ({ default: module.AdminTransactionsView })));
const AdminUsersView = lazy(() => import("./components/AdminUsersView").then(module => ({ default: module.AdminUsersView })));
const AdminGamesView = lazy(() => import("./components/AdminGamesView").then(module => ({ default: module.AdminGamesView })));
function AdminLoadingFallback() {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 opacity-50", children: [_jsx("div", { className: "w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" }), _jsx("p", { className: "text-sm font-medium", children: "Cargando secci\u00F3n..." })] }));
}
export function AdminPanel({ me, onLogout }) {
    // WebSocket for real-time notifications
    useAdminWebSocket();
    const [view, setView] = useState("dashboard");
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [timeRange, setTimeRange] = useState("24h");
    // React Query hooks - data fetches automatically with caching and refetch
    const statsQuery = useAdminStats();
    const usersQuery = useAdminUsers();
    const gamesQuery = useAdminGames();
    const transactionsQuery = useAdminTransactions();
    const activityQuery = useAdminActivity();
    // Mobile detection
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 900px)");
        const update = (event) => {
            const matches = event.matches;
            setIsMobile(matches);
            if (!matches) {
                setSidebarOpen(false);
            }
        };
        update(mq);
        const listener = (event) => update(event);
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
    // Escape key closes sidebar on mobile
    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };
        if (isMobile) {
            window.addEventListener("keydown", handleKey);
        }
        return () => window.removeEventListener("keydown", handleKey);
    }, [isMobile]);
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
    const handleExport = () => {
        // Generate CSV from current view data
        let csvContent = "";
        let filename = "";
        if (view === "dashboard" && statsQuery.data) {
            const stats = statsQuery.data;
            csvContent = "Métrica,Valor\n";
            csvContent += `Usuarios totales,${stats.total_users}\n`;
            csvContent += `Partidas activas,${stats.active_games}\n`;
            csvContent += `Ingresos totales,${stats.total_revenue}\n`;
            csvContent += `Movimientos hoy,${stats.today_transactions}\n`;
            csvContent += `Partidas finalizadas,${stats.total_games_finished}\n`;
            csvContent += `Pozo total,${stats.total_pot}\n`;
            csvContent += `Ingresos sistema,${stats.total_system_revenue}\n`;
            filename = "dashboard_stats.csv";
        }
        else if (view === "transactions" && transactionsQuery.data) {
            csvContent = "ID,Usuario,Fecha,Monto,Tipo,Estado\n";
            transactionsQuery.data.forEach((t) => {
                csvContent += `${t.id},${t.user},${t.timestamp},${t.amount},${t.type},${t.status}\n`;
            });
            filename = "transactions.csv";
        }
        else if (view === "users" && usersQuery.data) {
            csvContent = "ID,Alias,Email,Estado,Balance,Último acceso,Partidas\n";
            usersQuery.data.forEach((u) => {
                csvContent += `${u.id},${u.alias},${u.email},${u.status},${u.balance},${u.lastSeen},${u.gamesPlayed}\n`;
            });
            filename = "users.csv";
        }
        else if (view === "games" && gamesQuery.data) {
            csvContent = "ID,Nombre,Anfitrión,Horario,Estado,Buy-in,Pozo,Jugadores,Capacidad\n";
            gamesQuery.data.forEach((g) => {
                csvContent += `${g.id},${g.name},${g.host},${g.schedule},${g.status},${g.buyIn},${g.pot},${g.players},${g.capacity}\n`;
            });
            filename = "games.csv";
        }
        if (csvContent && filename) {
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    };
    return (_jsxs("div", { className: layoutClassName, children: [_jsxs("aside", { id: "admin-sidebar", className: "admin-sidebar", "aria-hidden": isMobile ? !isSidebarOpen : false, children: [_jsxs("div", { className: "admin-sidebar__scroll", children: [_jsx("div", { className: "admin-sidebar__header", children: _jsx("button", { type: "button", className: "admin-sidebar__toggle", onClick: () => setSidebarCollapsed((prev) => !prev), "aria-label": isSidebarCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: isSidebarCollapsed ? "chevron_right" : "chevron_left" }) }) }), _jsx("nav", { className: "admin-sidebar__nav", children: ADMIN_NAV_ITEMS.map((item) => (_jsxs("button", { type: "button", className: `admin-sidebar__link ${view === item.view ? "admin-sidebar__link--active" : ""}`, onClick: () => {
                                        setView(item.view);
                                        if (isMobile) {
                                            setSidebarOpen(false);
                                        }
                                    }, "aria-pressed": view === item.view, "aria-label": item.label, children: [_jsx("span", { className: "material-symbols-outlined", style: view === item.view ? { fontVariationSettings: "'FILL' 1" } : undefined, "aria-hidden": "true", children: item.icon }), _jsx("span", { className: "admin-sidebar__label", children: item.label })] }, item.label))) })] }), _jsx("div", { className: "admin-sidebar__footer", children: ADMIN_SUPPORT_ITEMS.map((item) => (_jsxs("button", { type: "button", className: "admin-sidebar__link", onClick: item.action === "logout"
                                ? handleLogout
                                : () => {
                                    if (isMobile) {
                                        setSidebarOpen(false);
                                    }
                                }, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: item.icon }), _jsx("span", { className: "admin-sidebar__label", children: item.label })] }, item.label))) })] }), isMobile && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "admin-sidebar__hamburger", onClick: () => setSidebarOpen(true), "aria-label": "Abrir men\u00FA de administraci\u00F3n", "aria-expanded": isSidebarOpen, "aria-controls": "admin-sidebar", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "menu" }) }), _jsx("div", { className: "admin-layout__overlay", role: "presentation", onClick: () => setSidebarOpen(false), "aria-hidden": !isSidebarOpen })] })), _jsx("main", { className: "admin-dashboard", children: _jsxs("div", { className: "admin-dashboard__inner", children: [_jsxs("div", { className: "admin-brand-chip", children: [_jsx("div", { className: "admin-avatar", "aria-hidden": "true" }), _jsxs("div", { className: "admin-brand-chip__text", children: [_jsx("h1", { className: "admin-brand-chip__title", children: "Dino Admin" }), _jsx("p", { className: "admin-brand-chip__subtitle", children: "Panel de Administraci\u00F3n" })] })] }), _jsxs("header", { className: "admin-page-header", children: [_jsxs("div", { children: [viewMeta.eyebrow && _jsx("p", { className: "admin-page-header__eyebrow", children: viewMeta.eyebrow }), _jsx("h2", { className: "admin-page-header__title", children: viewMeta.title }), viewMeta.subtitle && _jsx("p", { className: "admin-page-header__subtitle", children: viewMeta.subtitle })] }), _jsxs("div", { className: "admin-page-header__actions", children: [viewMeta.secondaryAction && (_jsxs("button", { type: "button", className: "admin-page-header__button admin-page-header__button--ghost", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: viewMeta.secondaryAction.icon }), _jsx("span", { children: viewMeta.secondaryAction.label })] })), _jsxs("button", { type: "button", className: "admin-page-header__button", onClick: handleExport, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: viewMeta.primaryAction.icon }), _jsx("span", { children: viewMeta.primaryAction.label })] })] })] }), _jsxs(Suspense, { fallback: _jsx(AdminLoadingFallback, {}), children: [view === "dashboard" && (_jsx(AdminDashboardView, { stats: statsQuery.data ?? null, activity: activityQuery.data ?? [], isLoading: statsQuery.isLoading || activityQuery.isLoading, timeRange: timeRange, onTimeRangeChange: setTimeRange, dataUpdatedAt: statsQuery.dataUpdatedAt })), view === "transactions" && (_jsx(AdminTransactionsView, { transactions: transactionsQuery.data ?? [], isLoading: transactionsQuery.isLoading })), view === "users" && (_jsx(AdminUsersView, { users: usersQuery.data ?? [], isLoading: usersQuery.isLoading })), view === "games" && (_jsx(AdminGamesView, { games: gamesQuery.data ?? [], isLoading: gamesQuery.isLoading }))] })] }) })] }));
}
export default AdminPanel;
