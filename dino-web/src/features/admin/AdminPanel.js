import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { formatCredits } from "../../utils/format";
import { ADMIN_ACTIVITY_ITEMS, ADMIN_NAV_ITEMS, ADMIN_SAMPLE_GAMES, ADMIN_SAMPLE_USERS, ADMIN_SUPPORT_ITEMS, ADMIN_USER_METRICS, ADMIN_VIEW_META, } from "./constants";
export function AdminPanel({ me, transactions, onLogout }) {
    const [view, setView] = useState("dashboard");
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [search, setSearch] = useState("");
    const filteredTransactions = useMemo(() => {
        if (!search.trim())
            return transactions;
        const term = search.trim().toLowerCase();
        return transactions.filter((txn) => txn.id.toLowerCase().includes(term) ||
            txn.user.toLowerCase().includes(term) ||
            txn.timestamp.toLowerCase().includes(term));
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
    const getInitials = (user) => {
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
    const getTypeMeta = (type) => type === "deposit"
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
    return (_jsxs("div", { className: layoutClassName, children: [_jsx("aside", { id: "admin-sidebar", className: "admin-sidebar", "aria-hidden": isMobile ? !isSidebarOpen : false, children: _jsxs("div", { className: "admin-sidebar__scroll", children: [_jsx("div", { className: "admin-sidebar__header", children: _jsx("button", { type: "button", className: "admin-sidebar__toggle", onClick: () => setSidebarCollapsed((prev) => !prev), "aria-label": isSidebarCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: isSidebarCollapsed ? "chevron_right" : "chevron_left" }) }) }), _jsx("nav", { className: "admin-sidebar__nav", children: ADMIN_NAV_ITEMS.map((item) => (_jsxs("button", { type: "button", className: `admin-sidebar__link ${view === item.view ? "admin-sidebar__link--active" : ""}`, onClick: () => {
                                    setView(item.view);
                                    if (isMobile) {
                                        setSidebarOpen(false);
                                    }
                                }, "aria-pressed": view === item.view, "aria-label": item.label, children: [_jsx("span", { className: "material-symbols-outlined", style: view === item.view ? { fontVariationSettings: "'FILL' 1" } : undefined, "aria-hidden": "true", children: item.icon }), _jsx("span", { className: "admin-sidebar__label", children: item.label })] }, item.label))) }), _jsx("div", { className: "admin-sidebar__footer", children: ADMIN_SUPPORT_ITEMS.map((item) => (_jsxs("button", { type: "button", className: "admin-sidebar__link", onClick: item.action === "logout"
                                    ? handleLogout
                                    : () => {
                                        if (isMobile) {
                                            setSidebarOpen(false);
                                        }
                                    }, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: item.icon }), _jsx("span", { className: "admin-sidebar__label", children: item.label })] }, item.label))) })] }) }), isMobile && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "admin-sidebar__hamburger", onClick: () => setSidebarOpen(true), "aria-label": "Abrir men\u00FA de administraci\u00F3n", "aria-expanded": isSidebarOpen, "aria-controls": "admin-sidebar", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "menu" }) }), _jsx("div", { className: "admin-layout__overlay", role: "presentation", onClick: () => setSidebarOpen(false), "aria-hidden": !isSidebarOpen })] })), _jsx("main", { className: "admin-dashboard", children: _jsxs("div", { className: "admin-dashboard__inner", children: [_jsxs("div", { className: "admin-brand-chip", children: [_jsx("div", { className: "admin-avatar", "aria-hidden": "true" }), _jsxs("div", { className: "admin-brand-chip__text", children: [_jsx("h1", { className: "admin-brand-chip__title", children: "Admin Bingo" }), _jsx("p", { className: "admin-brand-chip__subtitle", children: "Panel de Administraci\u00F3n" })] })] }), _jsxs("header", { className: "admin-page-header", children: [_jsxs("div", { children: [viewMeta.eyebrow && _jsx("p", { className: "admin-page-header__eyebrow", children: viewMeta.eyebrow }), _jsx("h2", { className: "admin-page-header__title", children: viewMeta.title }), viewMeta.subtitle && _jsx("p", { className: "admin-page-header__subtitle", children: viewMeta.subtitle })] }), _jsxs("div", { className: "admin-page-header__actions", children: [viewMeta.secondaryAction && (_jsxs("button", { type: "button", className: "admin-page-header__button admin-page-header__button--ghost", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: viewMeta.secondaryAction.icon }), _jsx("span", { children: viewMeta.secondaryAction.label })] })), _jsxs("button", { type: "button", className: "admin-page-header__button", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: viewMeta.primaryAction.icon }), _jsx("span", { children: viewMeta.primaryAction.label })] })] })] }), view === "dashboard" && _jsx(AdminDashboardView, { totalTransactions: totalTransactions }), view === "transactions" && (_jsx(AdminTransactionsView, { search: search, onSearch: setSearch, transactions: filteredTransactions, pendingCount: pendingCount, getTypeMeta: getTypeMeta, getInitials: getInitials })), view === "users" && _jsx(AdminUsersView, {}), view === "games" && _jsx(AdminGamesView, {})] }) })] }));
}
const AdminDashboardView = ({ totalTransactions }) => (_jsxs(_Fragment, { children: [_jsxs("section", { className: "admin-chipbar", "aria-label": "Filtros temporales", children: [_jsx("button", { type: "button", className: "admin-chip admin-chip--active", children: "\u00DAltimas 24h" }), _jsx("button", { type: "button", className: "admin-chip", children: "\u00DAltimos 7 d\u00EDas" }), _jsx("button", { type: "button", className: "admin-chip", children: "\u00DAltimos 30 d\u00EDas" }), _jsxs("button", { type: "button", className: "admin-chip admin-chip--icon", children: [_jsx("span", { children: "Rango personalizado" }), _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "calendar_month" })] })] }), _jsxs("section", { className: "admin-metrics", children: [_jsxs("article", { className: "admin-card admin-card--metric", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "group" }), _jsx("p", { children: "Usuarios totales" })] }), _jsx("strong", { children: "12,456" }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--up", children: "+2.5%" })] }), _jsxs("article", { className: "admin-card admin-card--metric", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "casino" }), _jsx("p", { children: "Partidas activas" })] }), _jsx("strong", { children: "87" }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--up", children: "+5.1%" })] }), _jsxs("article", { className: "admin-card admin-card--metric", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "payments" }), _jsx("p", { children: "Ingresos totales" })] }), _jsx("strong", { children: formatCredits(98230) }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--up", children: "+10.2%" })] }), _jsxs("article", { className: "admin-card admin-card--metric", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "account_balance_wallet" }), _jsx("p", { children: "Movimientos hoy" })] }), _jsx("strong", { children: totalTransactions }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--neutral", children: "Resumen" })] })] }), _jsxs("section", { className: "admin-grid", children: [_jsxs("article", { className: "admin-card admin-card--chart", children: [_jsxs("header", { children: [_jsx("p", { className: "admin-card__title", children: "Ingresos plataforma (30 d\u00EDas)" }), _jsxs("div", { className: "admin-card__summary", children: [_jsx("strong", { children: formatCredits(45890) }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--up", children: "+12.5%" })] })] }), _jsx("p", { className: "admin-card__caption", children: "Comparativa semanal" }), _jsx("div", { className: "admin-chart admin-chart--line", "aria-hidden": "true", children: _jsxs("svg", { viewBox: "-3 0 478 150", xmlns: "http://www.w3.org/2000/svg", role: "img", "aria-label": "Evoluci\u00F3n de ingresos", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "revenueGradient", x1: "236", x2: "236", y1: "1", y2: "149", gradientUnits: "userSpaceOnUse", children: [_jsx("stop", { stopColor: "#13ec5b", stopOpacity: "0.3" }), _jsx("stop", { offset: "1", stopColor: "#13ec5b", stopOpacity: "0" })] }) }), _jsx("path", { d: "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z", fill: "url(#revenueGradient)" }), _jsx("path", { d: "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25", strokeWidth: "3", stroke: "currentColor", className: "admin-chart__line", strokeLinecap: "round" })] }) }), _jsxs("ul", { className: "admin-chart__ticks", children: [_jsx("li", { children: "Semana 1" }), _jsx("li", { children: "Semana 2" }), _jsx("li", { children: "Semana 3" }), _jsx("li", { children: "Semana 4" })] })] }), _jsxs("article", { className: "admin-card admin-card--activity", children: [_jsx("header", { children: _jsx("p", { className: "admin-card__title", children: "Actividad reciente" }) }), _jsx("ul", { className: "admin-activity", children: ADMIN_ACTIVITY_ITEMS.slice(0, 20).map((item) => (_jsxs("li", { children: [_jsx("div", { className: `admin-activity__icon admin-activity__icon--${item.tone}`, children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: item.icon }) }), _jsxs("div", { className: "admin-activity__content", children: [_jsxs("p", { children: [item.description, " ", _jsx("strong", { children: item.title })] }), _jsx("time", { children: item.time })] })] }, item.id))) })] })] })] }));
const AdminTransactionsView = ({ search, onSearch, transactions, pendingCount, getInitials, getTypeMeta, }) => (_jsxs("section", { className: "admin-card admin-card--table", children: [_jsxs("header", { className: "admin-card__header", children: [_jsxs("div", { children: [_jsx("p", { className: "admin-card__title", children: "Transacciones recientes" }), _jsxs("span", { children: [pendingCount, " pendientes de aprobaci\u00F3n"] })] }), _jsxs("label", { className: "admin-search", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "search" }), _jsx("input", { type: "search", placeholder: "Buscar por usuario o ID", value: search, onChange: (event) => onSearch(event.target.value) })] })] }), _jsx("div", { className: "admin-table-wrapper", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Usuario" }), _jsx("th", { scope: "col", children: "Fecha" }), _jsx("th", { scope: "col", children: "Monto" }), _jsx("th", { scope: "col", children: "Tipo" }), _jsx("th", { scope: "col", children: "Estado" }), _jsx("th", { scope: "col", className: "admin-transactions__actions-header", children: "Acciones" })] }) }), _jsx("tbody", { children: transactions.map((txn) => {
                            const badge = getTypeMeta(txn.type);
                            return (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { className: "admin-table-user", children: [_jsx("span", { className: "admin-avatar admin-avatar--small", "aria-hidden": "true", children: getInitials(txn.user) }), _jsxs("div", { children: [_jsx("strong", { children: txn.user }), _jsx("p", { children: txn.id })] })] }) }), _jsx("td", { children: txn.timestamp }), _jsx("td", { className: `admin-amount admin-amount--${txn.type}`, children: formatCredits(txn.amount) }), _jsx("td", { children: _jsxs("span", { className: `admin-chip admin-chip--${badge.tone}`, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: badge.icon }), badge.label] }) }), _jsx("td", { children: _jsx("span", { className: `admin-status admin-status--${txn.status}`, children: txn.status }) }), _jsx("td", { className: "admin-transactions__actions-cell", children: _jsxs("div", { className: "admin-transactions__row-actions", children: [_jsx("button", { type: "button", className: "admin-transactions__row-button admin-transactions__row-button--deny", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "cancel" }) }), _jsx("button", { type: "button", className: "admin-transactions__row-button admin-transactions__row-button--approve", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "check_circle" }) }), _jsx("button", { type: "button", className: "admin-transactions__row-button admin-transactions__row-button--neutral", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "more_vert" }) })] }) })] }, txn.id));
                        }) })] }) })] }));
const AdminUsersView = () => (_jsxs(_Fragment, { children: [_jsx("section", { className: "admin-metrics admin-metrics--users", children: ADMIN_USER_METRICS.map((metric) => (_jsxs("article", { className: "admin-card admin-card--metric admin-card--metricCompact", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: metric.icon }), _jsx("p", { children: metric.label })] }), _jsx("strong", { children: metric.value }), _jsx("span", { className: `admin-metric__trend admin-metric__trend--${metric.tone}`, children: metric.trend })] }, metric.label))) }), _jsxs("section", { className: "admin-card admin-card--table", children: [_jsx("header", { className: "admin-card__header", children: _jsxs("div", { children: [_jsx("p", { className: "admin-card__title", children: "Jugadores recientes" }), _jsx("span", { children: "\u00DAltimas actividades en la plataforma" })] }) }), _jsx("div", { className: "admin-table-wrapper", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Alias" }), _jsx("th", { scope: "col", children: "Email" }), _jsx("th", { scope: "col", children: "Estado" }), _jsx("th", { scope: "col", children: "Balance" }), _jsx("th", { scope: "col", children: "Visto" }), _jsx("th", { scope: "col", children: "Partidas" })] }) }), _jsx("tbody", { children: ADMIN_SAMPLE_USERS.map((user) => (_jsxs("tr", { children: [_jsx("td", { children: user.alias }), _jsx("td", { children: user.email }), _jsx("td", { children: _jsx("span", { className: `admin-status admin-status--${user.tone}`, children: user.status }) }), _jsx("td", { children: formatCredits(user.balance) }), _jsx("td", { children: user.lastSeen }), _jsx("td", { children: user.gamesPlayed })] }, user.id))) })] }) })] })] }));
const AdminGamesView = () => (_jsxs("section", { className: "admin-card admin-card--table", children: [_jsx("header", { className: "admin-card__header", children: _jsxs("div", { children: [_jsx("p", { className: "admin-card__title", children: "Salas activas" }), _jsx("span", { children: "Monitorea partidas y su evoluci\u00F3n" })] }) }), _jsx("div", { className: "admin-table-wrapper", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Sala" }), _jsx("th", { scope: "col", children: "Anfitri\u00F3n" }), _jsx("th", { scope: "col", children: "Horario" }), _jsx("th", { scope: "col", children: "Premios" }), _jsx("th", { scope: "col", children: "Estado" }), _jsx("th", { scope: "col", children: "Buy-in" }), _jsx("th", { scope: "col", children: "Pozo" }), _jsx("th", { scope: "col", children: "Jugadores" })] }) }), _jsx("tbody", { children: ADMIN_SAMPLE_GAMES.map((game) => (_jsxs("tr", { children: [_jsx("td", { children: game.name }), _jsx("td", { children: game.host }), _jsx("td", { children: game.schedule }), _jsx("td", { children: game.reward }), _jsx("td", { children: _jsx("span", { className: `admin-status admin-status--${game.tone}`, children: game.status }) }), _jsx("td", { children: formatCredits(game.buyIn) }), _jsx("td", { children: formatCredits(game.pot) }), _jsxs("td", { children: [game.players, "/", game.capacity] })] }, game.id))) })] }) })] }));
export default AdminPanel;
