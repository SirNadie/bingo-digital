import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useRef } from "react";
import api from "./api/http";
const ADMIN_NAV_ITEMS = [
    { icon: "dashboard", label: "Dashboard", view: "dashboard" },
    { icon: "group", label: "Gestión de Usuarios" },
    { icon: "stadia_controller", label: "Gestión de Partidas" },
    { icon: "account_balance_wallet", label: "Transacciones", view: "transactions" },
];
const ADMIN_SUPPORT_ITEMS = [
    { icon: "settings", label: "Configuración" },
    { icon: "help", label: "Ayuda" },
    { icon: "logout", label: "Cerrar sesión", action: "logout" },
];
const ADMIN_SAMPLE_TRANSACTIONS = [
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
const USER_SAMPLE_TRANSACTIONS = [
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
function UserHeader({ view, balance, onNavigate, onLogout }) {
    const formattedBalance = balance.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (_jsxs("header", { className: "user-topbar", children: [_jsxs("div", { className: "user-brand", children: [_jsx("div", { className: "user-brand__icon", "aria-hidden": "true", children: _jsx("svg", { viewBox: "0 0 48 48", xmlns: "http://www.w3.org/2000/svg", role: "img", "aria-label": "BingoApp", children: _jsx("path", { d: "M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z", fill: "currentColor", fillRule: "evenodd", clipRule: "evenodd" }) }) }), _jsxs("div", { children: [_jsx("h1", { className: "user-brand__title", children: "BingoApp" }), _jsx("p", { className: "user-brand__subtitle", children: "Tu panel personal" })] })] }), _jsxs("nav", { className: "user-topnav", "aria-label": "Navegaci\u00F3n principal", children: [_jsx("button", { type: "button", className: `user-topnav__link ${view === "balance" ? "user-topnav__link--active" : ""}`, onClick: () => onNavigate("balance"), children: "Mi balance" }), _jsx("button", { type: "button", className: `user-topnav__link ${view === "stats" ? "user-topnav__link--active" : ""}`, onClick: () => onNavigate("stats"), children: "Mis estad\u00EDsticas" }), _jsx("button", { type: "button", className: "user-topnav__link", children: "Ayuda" })] }), _jsxs("div", { className: "user-topnav__right", children: [_jsxs("button", { type: "button", className: "user-balance-pill", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "account_balance_wallet" }), _jsxs("span", { className: "user-balance-pill__label", children: [formattedBalance, " cr\u00E9ditos"] })] }), _jsx("div", { className: "user-avatar", "aria-hidden": "true" }), _jsx("button", { type: "button", className: "user-logout", onClick: onLogout, children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "logout" }) })] })] }));
}
function AdminDashboard({ me, onLogout, transactions }) {
    const [view, setView] = useState("dashboard");
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const selectAllRef = useRef(null);
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
        }
        else {
            setSelectedTransactions(filteredTransactions.map((txn) => txn.id));
        }
    };
    const handleToggleRow = (id) => {
        setSelectedTransactions((prev) => (prev.includes(id) ? prev.filter((tx) => tx !== id) : [...prev, id]));
    };
    const handleLogout = () => {
        setView("dashboard");
        onLogout();
    };
    const layoutClassName = isSidebarCollapsed ? "admin-layout admin-layout--collapsed" : "admin-layout";
    return (_jsxs("div", { className: layoutClassName, children: [_jsxs("aside", { className: "admin-sidebar", children: [_jsxs("div", { className: "admin-sidebar__header", children: [_jsxs("div", { className: "admin-sidebar__identity", children: [_jsx("div", { className: "admin-avatar", "aria-hidden": "true" }), _jsxs("div", { children: [_jsx("h1", { className: "admin-sidebar__title", children: "Admin Bingo" }), _jsx("p", { className: "admin-sidebar__subtitle", children: "Panel de Administraci\u00F3n" })] })] }), _jsx("button", { type: "button", className: "admin-sidebar__toggle", onClick: () => setSidebarCollapsed((prev) => !prev), "aria-label": isSidebarCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: isSidebarCollapsed ? "chevron_right" : "chevron_left" }) })] }), _jsx("nav", { className: "admin-sidebar__nav", children: ADMIN_NAV_ITEMS.map((item) => {
                            const targetView = item.view;
                            return (_jsxs("button", { type: "button", className: `admin-sidebar__link ${targetView && view === targetView ? "admin-sidebar__link--active" : ""}`, onClick: targetView ? () => setView(targetView) : undefined, "aria-pressed": targetView ? view === targetView : undefined, "aria-label": item.label, children: [_jsx("span", { className: "material-symbols-outlined", style: targetView && view === targetView ? { fontVariationSettings: "'FILL' 1" } : undefined, "aria-hidden": "true", children: item.icon }), _jsx("span", { className: "admin-sidebar__label", children: item.label })] }, item.label));
                        }) }), _jsx("div", { className: "admin-sidebar__footer", children: ADMIN_SUPPORT_ITEMS.map((item) => (_jsxs("button", { type: "button", className: "admin-sidebar__link", onClick: item.action === "logout" ? handleLogout : undefined, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: item.icon }), _jsx("span", { children: item.label })] }, item.label))) })] }), _jsx("main", { className: "admin-dashboard", children: _jsx("div", { className: "admin-dashboard__inner", children: view === "dashboard" ? (_jsxs(_Fragment, { children: [_jsxs("section", { className: "admin-chipbar", "aria-label": "Filtros temporales", children: [_jsx("button", { type: "button", className: "admin-chip admin-chip--active", children: "Ultimas 24h" }), _jsx("button", { type: "button", className: "admin-chip", children: "\u00DAltimos 7 d\u00EDas" }), _jsx("button", { type: "button", className: "admin-chip", children: "\u00DAltimos 30 d\u00EDas" }), _jsxs("button", { type: "button", className: "admin-chip admin-chip--icon", children: [_jsx("span", { children: "Rango personalizado" }), _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "calendar_month" })] })] }), _jsxs("section", { className: "admin-metrics", children: [_jsxs("article", { className: "admin-card admin-card--metric", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "group" }), _jsx("p", { children: "Usuarios totales" })] }), _jsx("strong", { children: "12,456" }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--up", children: "+2.5%" })] }), _jsxs("article", { className: "admin-card admin-card--metric", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "casino" }), _jsx("p", { children: "Partidas activas" })] }), _jsx("strong", { children: "87" }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--up", children: "+5.1%" })] }), _jsxs("article", { className: "admin-card admin-card--metric", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "payments" }), _jsx("p", { children: "Ingresos totales" })] }), _jsx("strong", { children: "$98,230" }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--up", children: "+10.2%" })] }), _jsxs("article", { className: "admin-card admin-card--metric", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "account_balance_wallet" }), _jsx("p", { children: "Movimientos hoy" })] }), _jsx("strong", { children: totalTransactions }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--neutral", children: "Resumen" })] })] }), _jsxs("section", { className: "admin-grid", children: [_jsxs("article", { className: "admin-card admin-card--chart", children: [_jsxs("header", { children: [_jsx("p", { className: "admin-card__title", children: "Ingresos plataforma (30 d\u00EDas)" }), _jsxs("div", { className: "admin-card__summary", children: [_jsx("strong", { children: "$45,890" }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--up", children: "+12.5%" })] })] }), _jsx("p", { className: "admin-card__caption", children: "Comparativa semanal" }), _jsx("div", { className: "admin-chart admin-chart--line", "aria-hidden": "true", children: _jsxs("svg", { viewBox: "-3 0 478 150", xmlns: "http://www.w3.org/2000/svg", role: "img", "aria-label": "Evoluci\u00F3n de ingresos", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "revenueGradient", x1: "236", x2: "236", y1: "1", y2: "149", gradientUnits: "userSpaceOnUse", children: [_jsx("stop", { stopColor: "#13ec5b", stopOpacity: "0.3" }), _jsx("stop", { offset: "1", stopColor: "#13ec5b", stopOpacity: "0" })] }) }), _jsx("path", { d: "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z", fill: "url(#revenueGradient)" }), _jsx("path", { d: "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25", strokeWidth: 3, stroke: "currentColor", className: "admin-chart__line", strokeLinecap: "round" })] }) }), _jsxs("ul", { className: "admin-chart__ticks", children: [_jsx("li", { children: "Semana 1" }), _jsx("li", { children: "Semana 2" }), _jsx("li", { children: "Semana 3" }), _jsx("li", { children: "Semana 4" })] })] }), _jsxs("article", { className: "admin-card admin-card--donut", children: [_jsx("header", { children: _jsx("p", { className: "admin-card__title", children: "Packs de cr\u00E9ditos populares" }) }), _jsxs("div", { className: "admin-donut", children: [_jsxs("svg", { viewBox: "0 0 36 36", role: "img", "aria-label": "Distribuci\u00F3n de ventas de cr\u00E9ditos", children: [_jsx("path", { className: "admin-donut__track", d: "M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831", fill: "none", strokeWidth: 3 }), _jsx("path", { className: "admin-donut__slice admin-donut__slice--primary", d: "M18 2.0845a15.9155 15.9155 0 0 1 0 31.831", fill: "none", strokeWidth: 3, strokeDasharray: "60 100", strokeLinecap: "round" }), _jsx("path", { className: "admin-donut__slice admin-donut__slice--secondary", d: "M18 2.0845a15.9155 15.9155 0 0 1 0 31.831", fill: "none", strokeWidth: 3, strokeDasharray: "30 100", strokeDashoffset: -60, strokeLinecap: "round" }), _jsx("path", { className: "admin-donut__slice admin-donut__slice--tertiary", d: "M18 2.0845a15.9155 15.9155 0 0 1 0 31.831", fill: "none", strokeWidth: 3, strokeDasharray: "10 100", strokeDashoffset: -90, strokeLinecap: "round" })] }), _jsxs("div", { className: "admin-donut__center", children: [_jsx("strong", { children: "2,430" }), _jsx("span", { children: "Total de packs" })] })] }), _jsxs("ul", { className: "admin-donut__legend", children: [_jsxs("li", { children: [_jsx("span", { className: "admin-donut__dot admin-donut__dot--primary" }), _jsx("span", { children: "Starter Pack" }), _jsx("strong", { children: "60%" })] }), _jsxs("li", { children: [_jsx("span", { className: "admin-donut__dot admin-donut__dot--secondary" }), _jsx("span", { children: "Pro Pack" }), _jsx("strong", { children: "30%" })] }), _jsxs("li", { children: [_jsx("span", { className: "admin-donut__dot admin-donut__dot--tertiary" }), _jsx("span", { children: "Whale Pack" }), _jsx("strong", { children: "10%" })] })] })] })] }), _jsxs("section", { className: "admin-card admin-card--activity", children: [_jsx("header", { children: _jsx("p", { className: "admin-card__title", children: "Actividad reciente" }) }), _jsxs("ul", { className: "admin-activity", children: [_jsxs("li", { children: [_jsx("div", { className: "admin-activity__icon admin-activity__icon--primary", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "emoji_events" }) }), _jsxs("div", { className: "admin-activity__content", children: [_jsxs("p", { children: ["Usuario ", _jsx("strong", { children: "PlayerOne" }), " gan\u00F3 ", _jsx("strong", { children: "$50" }), " en la partida #1024."] }), _jsx("time", { children: "Hace 2 minutos" })] })] }), _jsxs("li", { children: [_jsx("div", { className: "admin-activity__icon admin-activity__icon--success", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "shopping_cart" }) }), _jsxs("div", { className: "admin-activity__content", children: [_jsxs("p", { children: ["Usuario ", _jsx("strong", { children: "BingoMaster" }), " compr\u00F3 el ", _jsx("strong", { children: "Pro Pack" }), "."] }), _jsx("time", { children: "Hace 15 minutos" })] })] }), _jsxs("li", { children: [_jsx("div", { className: "admin-activity__icon admin-activity__icon--warning", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "person_add" }) }), _jsxs("div", { className: "admin-activity__content", children: [_jsxs("p", { children: ["Nuevo registro realizado por ", _jsx("strong", { children: "Newbie23" }), "."] }), _jsx("time", { children: "Hace 30 minutos" })] })] }), _jsxs("li", { children: [_jsx("div", { className: "admin-activity__icon admin-activity__icon--primary", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "emoji_events" }) }), _jsxs("div", { className: "admin-activity__content", children: [_jsxs("p", { children: ["Usuario ", _jsx("strong", { children: "LuckyStar" }), " gan\u00F3 ", _jsx("strong", { children: "$120" }), " en la partida #1023."] }), _jsx("time", { children: "Hace 1 hora" })] })] })] })] })] })) : (_jsxs("section", { className: "admin-transactions", children: [_jsxs("header", { className: "admin-transactions__header", children: [_jsxs("div", { children: [_jsx("h2", { className: "admin-transactions__title", children: "Gesti\u00F3n de Transacciones" }), _jsx("p", { className: "admin-transactions__subtitle", children: "Controla dep\u00F3sitos y retiros en tiempo real." })] }), _jsxs("div", { className: "admin-transactions__badge", children: ["Pendientes: ", _jsx("strong", { children: pendingCount })] })] }), _jsxs("div", { className: "admin-transactions__toolbar", children: [_jsxs("div", { className: "admin-transactions__filters", children: [_jsx("button", { type: "button", className: "admin-icon-btn", "aria-label": "Filtrar transacciones", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "filter_list" }) }), _jsx("button", { type: "button", className: "admin-icon-btn", "aria-label": "Elegir periodo", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "calendar_today" }) }), _jsxs("label", { className: "admin-transactions__search", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "search" }), _jsx("input", { type: "search", placeholder: "Buscar por ID, usuario...", value: search, onChange: (event) => setSearch(event.target.value) })] })] }), _jsxs("div", { className: "admin-transactions__actions", children: [_jsxs("button", { type: "button", className: "admin-transactions__bulk admin-transactions__bulk--deny", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", style: { fontVariationSettings: "'FILL' 1" }, children: "cancel" }), _jsx("span", { children: "Rechazar seleccionados" })] }), _jsxs("button", { type: "button", className: "admin-transactions__bulk admin-transactions__bulk--approve", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", style: { fontVariationSettings: "'FILL' 1" }, children: "check_circle" }), _jsx("span", { children: "Aprobar seleccionados" })] })] })] }), _jsx("div", { className: "admin-transactions__table-wrapper", children: _jsx("div", { className: "admin-transactions__table-scroll", children: _jsxs("table", { className: "admin-transactions__table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: _jsx("input", { ref: selectAllRef, type: "checkbox", checked: allSelected, onChange: handleToggleAll, "aria-label": "Seleccionar todas las transacciones visibles" }) }), _jsx("th", { scope: "col", children: "ID Transacci\u00F3n" }), _jsx("th", { scope: "col", children: "Usuario" }), _jsx("th", { scope: "col", children: "Fecha y hora" }), _jsx("th", { scope: "col", children: "Monto" }), _jsx("th", { scope: "col", children: "Tipo" }), _jsx("th", { scope: "col", children: "Estado" }), _jsx("th", { scope: "col", className: "admin-transactions__actions-header", children: "Acciones" })] }) }), _jsxs("tbody", { children: [filteredTransactions.map((txn) => {
                                                        const isSelected = selectedTransactions.includes(txn.id);
                                                        const statusLabel = txn.status === "pending" ? "Pendiente" : txn.status === "approved" ? "Aprobado" : "Rechazado";
                                                        return (_jsxs("tr", { className: isSelected ? "admin-transactions__row admin-transactions__row--selected" : "admin-transactions__row", children: [_jsx("td", { children: _jsx("input", { type: "checkbox", checked: isSelected, onChange: () => handleToggleRow(txn.id), "aria-label": `Seleccionar ${txn.id}` }) }), _jsx("td", { className: "admin-transactions__cell--highlight", children: txn.id }), _jsx("td", { children: txn.user }), _jsx("td", { children: txn.timestamp }), _jsxs("td", { className: "admin-transactions__cell--highlight", children: ["$", txn.amount.toFixed(2)] }), _jsx("td", { children: _jsx("span", { className: `admin-transactions__chip ${txn.type === "deposit"
                                                                            ? "admin-transactions__chip--deposit"
                                                                            : "admin-transactions__chip--withdraw"}`, children: txn.type === "deposit" ? "Depósito" : "Retiro" }) }), _jsx("td", { children: _jsx("span", { className: `admin-transactions__chip admin-transactions__chip--${txn.status}`, children: statusLabel }) }), _jsx("td", { children: _jsxs("div", { className: "admin-transactions__row-actions", children: [_jsx("button", { type: "button", className: "admin-transactions__row-button admin-transactions__row-button--deny", "aria-label": "Rechazar", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "cancel" }) }), _jsx("button", { type: "button", className: "admin-transactions__row-button admin-transactions__row-button--approve", "aria-label": "Aprobar", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "check_circle" }) }), _jsx("button", { type: "button", className: "admin-transactions__row-button admin-transactions__row-button--neutral", "aria-label": "M\u00E1s acciones", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "more_vert" }) })] }) })] }, txn.id));
                                                    }), filteredTransactions.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, className: "admin-transactions__empty", children: "No hay transacciones que coincidan con la b\u00FAsqueda." }) }))] })] }) }) }), _jsxs("nav", { className: "admin-transactions__pagination", "aria-label": "Paginaci\u00F3n de transacciones", children: [_jsx("button", { type: "button", className: "admin-transactions__page-btn", "aria-label": "Anterior", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "chevron_left" }) }), _jsx("button", { type: "button", className: "admin-transactions__page-btn admin-transactions__page-btn--active", children: "1" }), _jsx("button", { type: "button", className: "admin-transactions__page-btn", children: "2" }), _jsx("button", { type: "button", className: "admin-transactions__page-btn", children: "3" }), _jsx("span", { className: "admin-transactions__page-ellipsis", children: "..." }), _jsx("button", { type: "button", className: "admin-transactions__page-btn", children: "10" }), _jsx("button", { type: "button", className: "admin-transactions__page-btn", "aria-label": "Siguiente", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "chevron_right" }) })] })] })) }) })] }));
}
function UserStats({ me, onLogout, currentView, onNavigate }) {
    return (_jsxs("div", { className: "user-stats-shell", children: [_jsx(UserHeader, { view: currentView, balance: me.balance, onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "user-stats-main", children: [_jsxs("section", { className: "user-stats-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Mis estad\u00EDsticas" }), _jsx("p", { children: "Tu rendimiento y actividad en el juego." })] }), _jsxs("div", { className: "user-stats-filters", children: [_jsx("button", { type: "button", className: "user-stats-chip user-stats-chip--ghost", children: "\u00DAltimos 7 d\u00EDas" }), _jsx("button", { type: "button", className: "user-stats-chip user-stats-chip--active", children: "\u00DAltimo mes" }), _jsx("button", { type: "button", className: "user-stats-chip user-stats-chip--ghost", children: "Desde siempre" })] })] }), _jsx("section", { className: "user-stats-overview", children: USER_STATS_OVERVIEW.map((item) => (_jsxs("article", { children: [_jsx("p", { children: item.label }), _jsx("strong", { children: item.value })] }, item.label))) }), _jsxs("section", { className: "user-stats-panels", children: [_jsxs("article", { className: "user-stats-chart", children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("p", { children: "Actividad reciente" }), _jsx("span", { children: "\u00DAltimo mes" })] }), _jsxs("div", { className: "user-stats-chart__highlight", children: [_jsx("strong", { children: "+12.5%" }), _jsx("span", { children: "Cr\u00E9ditos" })] })] }), _jsxs("div", { className: "user-stats-chart__graph", children: [_jsxs("svg", { viewBox: "-3 0 478 150", xmlns: "http://www.w3.org/2000/svg", role: "img", "aria-label": "tendencia de cr\u00E9ditos", children: [_jsx("path", { d: "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z", fill: "url(#user-stats-gradient)", fillOpacity: "0.18" }), _jsx("path", { d: "M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25", stroke: "#135bec", strokeLinecap: "round", strokeWidth: "3" }), _jsx("defs", { children: _jsxs("linearGradient", { id: "user-stats-gradient", x1: "236", x2: "236", y1: "1", y2: "149", gradientUnits: "userSpaceOnUse", children: [_jsx("stop", { stopColor: "#135bec" }), _jsx("stop", { offset: "1", stopColor: "#135bec", stopOpacity: "0" })] }) })] }), _jsxs("div", { className: "user-stats-chart__ticks", children: [_jsx("span", { children: "Semana 1" }), _jsx("span", { children: "Semana 2" }), _jsx("span", { children: "Semana 3" }), _jsx("span", { children: "Semana 4" })] })] })] }), _jsxs("article", { className: "user-stats-highlights", children: [_jsx("h3", { children: "Tus mejores momentos" }), _jsx("ul", { children: USER_STATS_HIGHLIGHTS.map((item) => (_jsxs("li", { children: [_jsx("div", { className: "user-stats-highlights__icon", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: item.icon }) }), _jsxs("div", { children: [_jsx("p", { children: item.label }), _jsx("strong", { children: item.value })] })] }, item.label))) })] })] })] })] }));
}
function UserDashboard({ me, onLogout, onTopup, onWithdraw, isProcessingTopup, transactions, message, error, currentView, onNavigate, }) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [rangeFilter, setRangeFilter] = useState("30");
    const [depositAmount, setDepositAmount] = useState(50);
    const filteredTransactions = useMemo(() => {
        const threshold = rangeFilter === "all" ? null : Number.parseInt(rangeFilter, 10);
        const minDate = threshold ? (() => { const d = new Date(); d.setDate(d.getDate() - threshold); return d; })() : null;
        return transactions.filter((txn) => {
            const matchesType = typeFilter === "all" || txn.type === typeFilter;
            const matchesSearch = !search.trim() ||
                txn.description.toLowerCase().includes(search.trim().toLowerCase()) ||
                txn.id.toLowerCase().includes(search.trim().toLowerCase());
            const matchesRange = !minDate || new Date(txn.timestamp) >= minDate;
            return matchesType && matchesSearch && matchesRange;
        });
    }, [transactions, search, typeFilter, rangeFilter]);
    function formatAmount(amount) {
        const sign = amount >= 0 ? "+" : "-";
        return `${sign}$${Math.abs(amount).toFixed(2)}`;
    }
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
    function typeBadge(type) {
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
    return (_jsxs("div", { className: "user-shell", children: [_jsx(UserHeader, { view: currentView, balance: balance, onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "user-main", children: [_jsxs("section", { className: "user-quick-actions", children: [_jsxs("button", { type: "button", className: "user-quick-actions__primary", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "group_add" }), "Unirse a partida"] }), _jsxs("button", { type: "button", className: "user-quick-actions__secondary", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "add_circle" }), "Crear partida"] })] }), (error || message) && (_jsx("div", { className: "user-alerts", children: error ? (_jsx("div", { className: "user-alert user-alert--error", children: error })) : (message && _jsx("div", { className: "user-alert user-alert--info", children: message })) })), _jsxs("section", { className: "user-summary", children: [_jsxs("article", { className: "user-summary__card", children: [_jsxs("div", { className: "user-summary__heading", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "savings" }), _jsx("h2", { children: "Cr\u00E9ditos disponibles" })] }), _jsx("p", { className: "user-summary__balance", children: balance.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }), _jsxs("span", { className: "user-summary__caption", children: ["Actualizado al ", new Date().toLocaleDateString("es-ES")] })] }), _jsxs("article", { className: "user-actions", children: [_jsxs("div", { className: "user-actions__input", children: [_jsx("label", { htmlFor: "deposit-amount", children: "Monto a depositar" }), _jsxs("div", { className: "user-actions__amount", children: [_jsx("span", { children: "$" }), _jsx("input", { id: "deposit-amount", type: "number", min: 5, step: 5, value: depositAmount, onChange: (event) => setDepositAmount(Number(event.target.value) || 0) })] }), _jsx("div", { className: "user-actions__quick", children: [25, 50, 100].map((preset) => (_jsxs("button", { type: "button", onClick: () => setDepositAmount(preset), children: ["$", preset] }, preset))) })] }), _jsxs("div", { className: "user-actions__buttons", children: [_jsxs("button", { type: "button", className: "user-actions__primary", onClick: () => onTopup(depositAmount), disabled: isProcessingTopup || depositAmount <= 0, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "add_card" }), isProcessingTopup ? "Procesando..." : "Depositar créditos"] }), _jsxs("button", { type: "button", className: "user-actions__secondary", onClick: onWithdraw, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "payments" }), "Retirar cr\u00E9ditos"] })] })] })] }), _jsxs("section", { className: "user-transactions", children: [_jsxs("header", { className: "user-transactions__header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Historial de transacciones" }), _jsx("p", { children: "Movimientos recientes en tu cuenta" })] }), _jsxs("div", { className: "user-transactions__filters", children: [_jsxs("label", { className: "user-search", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "search" }), _jsx("input", { type: "search", placeholder: "Buscar transacci\u00F3n...", value: search, onChange: (event) => setSearch(event.target.value) })] }), _jsxs("select", { className: "user-select", value: typeFilter, onChange: (event) => setTypeFilter(event.target.value), children: [_jsx("option", { value: "all", children: "Todos los tipos" }), _jsx("option", { value: "deposit", children: "Dep\u00F3sitos" }), _jsx("option", { value: "withdraw", children: "Retiros" }), _jsx("option", { value: "purchase", children: "Compras" }), _jsx("option", { value: "prize", children: "Premios" })] }), _jsxs("select", { className: "user-select", value: rangeFilter, onChange: (event) => setRangeFilter(event.target.value), children: [_jsx("option", { value: "30", children: "\u00DAltimos 30 d\u00EDas" }), _jsx("option", { value: "90", children: "\u00DAltimos 3 meses" }), _jsx("option", { value: "365", children: "Este a\u00F1o" }), _jsx("option", { value: "all", children: "Todos" })] })] })] }), _jsx("div", { className: "user-transactions__table-wrapper", children: _jsxs("table", { className: "user-transactions__table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Fecha" }), _jsx("th", { scope: "col", children: "Tipo" }), _jsx("th", { scope: "col", children: "Descripci\u00F3n" }), _jsx("th", { scope: "col", className: "user-transactions__amount-heading", children: "Monto" })] }) }), _jsxs("tbody", { children: [filteredTransactions.map((txn) => {
                                                    const badge = typeBadge(txn.type);
                                                    return (_jsxs("tr", { children: [_jsx("td", { children: formatDate(txn.timestamp) }), _jsx("td", { children: _jsxs("span", { className: badge.className, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: badge.icon }), badge.label] }) }), _jsx("td", { children: txn.description }), _jsx("td", { className: `user-transactions__amount user-transactions__amount--${txn.type}`, children: formatAmount(txn.amount) })] }, txn.id));
                                                }), filteredTransactions.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "user-transactions__empty", children: "No se encontraron movimientos para los filtros seleccionados." }) }))] })] }) })] })] })] }));
}
export default function App() {
    const [email, setEmail] = useState("admin@bingo.local");
    const [password, setPassword] = useState("admin123");
    const [games, setGames] = useState([]);
    const [price, setPrice] = useState(0.5);
    const [autoEnabled, setAutoEnabled] = useState(false);
    const [autoThreshold, setAutoThreshold] = useState(undefined);
    const [autoDelay, setAutoDelay] = useState(undefined);
    const [msg, setMsg] = useState("");
    const [me, setMe] = useState(null);
    const [topupAmount, setTopupAmount] = useState(5);
    const [tickets, setTickets] = useState([]);
    const [errors, setErrors] = useState("");
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isFetchingMe, setIsFetchingMe] = useState(false);
    const [isTopupProcessing, setIsTopupProcessing] = useState(false);
    const [userTransactions, setUserTransactions] = useState(USER_SAMPLE_TRANSACTIONS);
    const [userView, setUserView] = useState("balance");
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
        }
        catch (error) {
            setMsg("");
            if (error &&
                typeof error === "object" &&
                "response" in error &&
                error.response?.data) {
                setErrors(error.response.data);
            }
            else {
                setErrors("No se pudo iniciar sesión, inténtalo de nuevo");
            }
        }
    }
    async function fetchGames() {
        const res = await api.get("/games");
        setGames(res.data.items);
    }
    async function fetchMe() {
        setIsFetchingMe(true);
        try {
            const { data } = await api.get("/auth/me");
            const profile = {
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
        }
        catch (error) {
            setMe(null);
            if (error &&
                typeof error === "object" &&
                "response" in error &&
                error.response?.status === 401) {
                localStorage.removeItem("token");
                setMsg("La sesión expiró. Inicia sesión nuevamente.");
            }
            return null;
        }
        finally {
            setIsFetchingMe(false);
        }
    }
    async function fetchTickets() {
        try {
            const { data } = await api.get("/tickets/me");
            setTickets(data);
        }
        catch {
            setTickets([]);
        }
    }
    async function createGame() {
        try {
            if (!canCreate)
                return;
            const res = await api.post("/games", {
                price,
                autostart_enabled: autoEnabled,
                autostart_threshold: autoThreshold,
                autostart_delay_minutes: autoDelay,
            });
            setMsg(`Partida creada: ${res.data.id}`);
            fetchGames();
        }
        catch (e) {
            setMsg(e?.response?.data || "Error al crear partida");
        }
    }
    async function draw(gameId) {
        try {
            const { data } = await api.post(`/games/${gameId}/draw`);
            setMsg(`Salió el ${data.number}. Premios: D:${data.paid_diagonal ? '✔' : '✗'} L:${data.paid_line ? '✔' : '✗'} B:${data.paid_bingo ? '✔' : '✗'}`);
            await fetchMe();
            await fetchGames();
            await fetchTickets();
        }
        catch (e) {
            setMsg(e?.response?.data || "No se pudo sortear");
        }
    }
    function randomMatrix() {
        const m = [];
        for (let i = 0; i < 5; i++) {
            const row = [];
            for (let j = 0; j < 5; j++) {
                row.push(Math.floor(Math.random() * 75) + 1);
            }
            m.push(row);
        }
        return m;
    }
    async function fetchGameState(gameId) {
        try {
            const { data } = await api.get(`/games/${gameId}/state`);
            setGameState(data);
        }
        catch {
            setGameState(null);
        }
    }
    async function buyTicket(gameId) {
        try {
            const numbers = randomMatrix();
            await api.post(`/tickets/games/${gameId}`, { numbers });
            setMsg("Ticket comprado");
            await fetchMe();
            await fetchTickets();
            await fetchGames();
        }
        catch (e) {
            setMsg(e?.response?.data || "Error al comprar ticket");
        }
    }
    async function topup(amountOverride) {
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
                    type: "deposit",
                    description: "Recarga manual de créditos",
                    amount,
                },
                ...prev,
            ].slice(0, 50));
        }
        catch (e) {
            setMsg("");
            setErrors(e?.response?.data || "Error al recargar");
        }
        finally {
            setIsTopupProcessing(false);
        }
    }
    function handleWithdrawal() {
        setMsg("La solicitud de retiro estará disponible próximamente.");
        setUserTransactions((prev) => [
            {
                id: `TXU-${Date.now()}-WD`,
                timestamp: new Date().toISOString(),
                type: "withdraw",
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
        if (!selectedGameId || !autoRefresh)
            return;
        const t = setInterval(() => fetchGameState(selectedGameId), 3000);
        return () => clearInterval(t);
    }, [selectedGameId, autoRefresh]);
    function BingoBoard({ drawn }) {
        const cols = [
            Array.from({ length: 15 }, (_, i) => i + 1),
            Array.from({ length: 15 }, (_, i) => i + 16),
            Array.from({ length: 15 }, (_, i) => i + 31),
            Array.from({ length: 15 }, (_, i) => i + 46),
            Array.from({ length: 15 }, (_, i) => i + 61),
        ];
        const letters = ["B", "I", "N", "G", "O"];
        return (_jsx("div", { className: "stack", children: _jsx("div", { className: "row", style: { justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, children: letters.map((L, idx) => (_jsxs("div", { style: { width: "100%" }, children: [_jsx("div", { className: "muted", style: { textAlign: "center", marginBottom: 4 }, children: L }), _jsx("div", { className: "board", children: cols[idx].map((n) => (_jsx("div", { className: `cell ${drawn.has(n) ? 'hit' : ''}`, children: n }, n))) })] }, idx))) }) }));
    }
    if (!logged) {
        return (_jsx("div", { className: "auth-shell", children: _jsxs("div", { className: "auth-card", children: [_jsxs("div", { className: "auth-card__header", children: [_jsx("p", { className: "auth-eyebrow", children: "Bienvenido de vuelta" }), _jsx("h1", { className: "auth-title", children: "Inicia sesi\u00F3n en Dino Bingo" }), _jsx("p", { className: "auth-subtitle", children: "Accede para crear partidas, comprar tickets y seguir tus premios." })] }), errors && _jsx("div", { className: "auth-alert auth-alert--error", children: errors }), msg && !errors && _jsx("div", { className: "auth-alert auth-alert--info", children: msg }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "email", className: "auth-label", children: "Correo electr\u00F3nico" }), _jsx("input", { id: "email", className: "auth-input", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "tu@correo.com", autoComplete: "email" })] }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "password", className: "auth-label", children: "Contrase\u00F1a" }), _jsxs("div", { className: "auth-password", children: [_jsx("input", { id: "password", className: "auth-input auth-input--password", type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "M\u00EDnimo 6 caracteres", autoComplete: "current-password" }), _jsx("button", { type: "button", className: "auth-toggle", onClick: () => setShowPassword((prev) => !prev), "aria-label": showPassword ? "Ocultar contraseña" : "Mostrar contraseña", children: showPassword ? "Ocultar" : "Mostrar" })] })] }), _jsx("button", { className: "auth-submit", onClick: login, disabled: !canLogin, children: "Iniciar sesi\u00F3n" }), _jsx("p", { className: "auth-hint", children: "\u00BFEres nuevo? Ponte en contacto con el equipo para crear tu cuenta." })] }) }));
    }
    if (logged && isFetchingMe && !me) {
        return (_jsx("div", { className: "auth-shell", children: _jsx("div", { className: "auth-card auth-card--loading", children: _jsx("p", { className: "auth-subtitle", children: "Cargando perfil..." }) }) }));
    }
    if (logged && me && me.is_admin) {
        return _jsx(AdminDashboard, { me: me, onLogout: logout, transactions: ADMIN_SAMPLE_TRANSACTIONS });
    }
    if (logged && me && !me.is_admin) {
        if (userView === "stats") {
            return _jsx(UserStats, { me: me, onLogout: logout, currentView: userView, onNavigate: (view) => setUserView(view) });
        }
        return (_jsx(UserDashboard, { me: me, onLogout: logout, onTopup: topup, onWithdraw: handleWithdrawal, isProcessingTopup: isTopupProcessing, transactions: userTransactions, message: msg, error: errors, currentView: userView, onNavigate: (view) => setUserView(view) }));
    }
    return (_jsxs("div", { className: "container stack", children: [_jsxs("header", { className: "stack", children: [_jsx("h1", { className: "title", children: "Dino Bingo" }), errors && _jsx("div", { className: "error", children: errors }), msg && _jsx("div", { className: "muted", children: msg })] }), _jsxs("section", { className: "card stack", children: [_jsxs("div", { className: "row", style: { justifyContent: "space-between" }, children: [_jsxs("div", { children: ["Sesi\u00F3n: ", me ? _jsx("strong", { children: me.email }) : "-", " \u00B7 Saldo: ", me ? `$${me.balance.toFixed(2)}` : "-"] }), _jsx("button", { className: "btn", onClick: logout, children: "Salir" })] }), _jsxs("div", { className: "row", children: [_jsx("input", { className: "input", type: "number", min: 0.5, step: 0.5, value: topupAmount, onChange: (e) => setTopupAmount(parseFloat(e.target.value) || 0) }), _jsx("button", { className: "btn primary", onClick: () => topup(), disabled: !canTopup, children: "Recargar" })] })] }), _jsxs("section", { className: "card stack", children: [_jsx("h3", { className: "title", children: "Crear partida" }), _jsxs("div", { className: "row", children: [_jsx("label", { className: "muted", children: "Precio (m\u00EDn. 0.5)" }), _jsx("input", { className: "input", type: "number", min: 0.5, step: 0.5, value: price, onChange: e => setPrice(parseFloat(e.target.value) || 0) })] }), _jsxs("div", { className: "row", children: [_jsx("label", { className: "muted", children: "Autoinicio" }), _jsx("input", { type: "checkbox", checked: autoEnabled, onChange: e => setAutoEnabled(e.target.checked) }), _jsx("label", { className: "muted", children: "Umbral (tickets)" }), _jsx("input", { className: "input", type: "number", min: 10, step: 1, value: autoThreshold ?? '', onChange: e => setAutoThreshold(e.target.value ? parseInt(e.target.value) : undefined) }), _jsx("label", { className: "muted", children: "Demora (min)" }), _jsx("input", { className: "input", type: "number", min: 0, step: 5, value: autoDelay ?? '', onChange: e => setAutoDelay(e.target.value ? parseInt(e.target.value) : undefined) })] }), _jsx("div", { className: "row", children: _jsx("button", { className: "btn primary", onClick: createGame, disabled: !canCreate, children: "Crear" }) })] }), _jsxs("section", { className: "card stack", children: [_jsx("h3", { className: "title", children: "Partidas" }), _jsx("ul", { className: "list", children: games.map(g => (_jsxs("li", { className: "row", style: { justifyContent: "space-between" }, children: [_jsxs("span", { children: [_jsx("b", { children: g.id.slice(0, 8) }), " \u00B7 ", g.status, " \u00B7 $", g.price, " \u00B7 vendidos: ", g.sold_tickets] }), _jsxs("span", { className: "row", children: [_jsx("button", { className: "btn", onClick: () => { setSelectedGameId(g.id); setGameState(null); fetchGameState(g.id); }, children: "Ver estado" }), me && g.creator_id === me.id && g.status === 'OPEN' && (g.sold_tickets >= (g.min_tickets ?? 10)) && (_jsx("button", { className: "btn primary", onClick: async () => {
                                                try {
                                                    await api.post(`/games/${g.id}/start`);
                                                    setMsg('Partida iniciada');
                                                    fetchGames();
                                                }
                                                catch (e) {
                                                    setMsg(e?.response?.data || 'No se pudo iniciar');
                                                }
                                            }, children: "Iniciar" })), me && g.creator_id === me.id && g.status === 'RUNNING' && (_jsx("button", { className: "btn primary", onClick: () => draw(g.id), children: "Sortear" })), _jsx("button", { className: "btn", onClick: () => buyTicket(g.id), disabled: !logged, children: "Comprar ticket" })] })] }, g.id))) })] }), selectedGameId && (_jsxs("section", { className: "card stack", children: [_jsxs("div", { className: "row", style: { justifyContent: "space-between" }, children: [_jsx("h3", { className: "title", children: "Detalle de partida" }), _jsxs("div", { className: "row", children: [_jsx("label", { className: "muted", children: "Auto-refresco" }), _jsx("input", { type: "checkbox", checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked) }), _jsx("button", { className: "btn", onClick: () => fetchGameState(selectedGameId), children: "Refrescar" }), _jsx("button", { className: "btn", onClick: () => { setSelectedGameId(null); setGameState(null); }, children: "Cerrar" })] })] }), !gameState ? (_jsx("p", { className: "muted", children: "Cargando estado..." })) : (_jsxs("div", { className: "stack", children: [_jsxs("div", { className: "row", style: { justifyContent: "space-between" }, children: [_jsxs("div", { children: ["Estado: ", _jsx("b", { children: gameState.status }), " \u2014 Vendidos: ", _jsx("b", { children: gameState.sold_tickets }), " \u2014 Precio: ", _jsxs("b", { children: ["$", gameState.price] })] }), me && games.find(g => g.id === selectedGameId)?.creator_id === me?.id && gameState.status === 'RUNNING' && (_jsx("button", { className: "btn primary", onClick: () => draw(selectedGameId), children: "Sortear" }))] }), _jsxs("div", { className: "row", children: [_jsx("div", { className: "muted", children: "Pagados:" }), _jsxs("div", { children: ["Diagonal ", gameState.paid_diagonal ? '✔' : '✗'] }), _jsxs("div", { children: ["L\u00EDnea ", gameState.paid_line ? '✔' : '✗'] }), _jsxs("div", { children: ["Bingo ", gameState.paid_bingo ? '✔' : '✗'] })] }), _jsx(BingoBoard, { drawn: new Set(gameState.drawn_numbers) })] }))] })), _jsxs("section", { className: "card stack", children: [_jsx("h3", { className: "title", children: "Mis tickets" }), tickets.length === 0 ? (_jsx("p", { className: "muted", children: "Sin tickets" })) : (_jsx("ul", { className: "list", children: tickets.map(t => (_jsxs("li", { children: [_jsx("b", { children: t.id.slice(0, 8) }), " \u00B7 juego ", t.game_id.slice(0, 8), " \u00B7 ", t.numbers.flat().length, " n\u00FAmeros"] }, t.id))) }))] })] }));
}
