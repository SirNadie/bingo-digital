import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { formatCredits } from "../../../utils/format";
import UserHeader from "../components/UserHeader";
export function UserDashboardView({ me, onLogout, onTopup, onWithdraw, isProcessingTopup, transactions, message, error, currentView, onNavigate, }) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [rangeFilter, setRangeFilter] = useState("30");
    const [depositAmount, setDepositAmount] = useState(50);
    const filteredTransactions = useMemo(() => {
        const threshold = rangeFilter === "all" ? null : Number.parseInt(rangeFilter, 10);
        const minDate = threshold
            ? (() => {
                const d = new Date();
                d.setDate(d.getDate() - threshold);
                return d;
            })()
            : null;
        return transactions.filter((txn) => {
            const matchesType = typeFilter === "all" || txn.type === typeFilter;
            const matchesSearch = !search.trim() ||
                txn.description.toLowerCase().includes(search.trim().toLowerCase()) ||
                txn.id.toLowerCase().includes(search.trim().toLowerCase());
            const matchesRange = !minDate || new Date(txn.timestamp) >= minDate;
            return matchesType && matchesSearch && matchesRange;
        });
    }, [transactions, search, typeFilter, rangeFilter]);
    const balance = Number.isFinite(me.balance) ? me.balance : 0;
    const formatAmount = (amount) => formatCredits(amount, { showSign: true });
    const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const typeBadge = (type) => {
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
    };
    return (_jsxs("div", { className: "user-shell", children: [_jsx(UserHeader, { view: currentView, balance: balance, onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "user-main", children: [_jsxs("section", { className: "user-quick-actions", children: [_jsxs("button", { type: "button", className: "user-quick-actions__primary", onClick: () => onNavigate("join"), children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "group_add" }), "Unirse a partida"] }), _jsxs("button", { type: "button", className: "user-quick-actions__secondary", onClick: () => onNavigate("create"), children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "add_circle" }), "Crear partida"] })] }), (error || message) && (_jsx("div", { className: "user-alerts", children: error ? (_jsx("div", { className: "user-alert user-alert--error", children: error })) : (message && _jsx("div", { className: "user-alert user-alert--info", children: message })) })), _jsxs("section", { className: "user-summary", children: [_jsxs("article", { className: "user-summary__card", children: [_jsxs("div", { className: "user-summary__heading", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "savings" }), _jsx("h2", { children: "Cr\u00E9ditos disponibles" })] }), _jsx("p", { className: "user-summary__balance", children: formatCredits(balance) }), _jsxs("span", { className: "user-summary__caption", children: ["Actualizado al ", new Date().toLocaleDateString("es-ES")] })] }), _jsxs("article", { className: "user-actions", children: [_jsxs("div", { className: "user-actions__input", children: [_jsx("label", { htmlFor: "deposit-amount", children: "Monto a depositar" }), _jsxs("div", { className: "user-actions__amount", children: [_jsx("span", { children: "cr" }), _jsx("input", { id: "deposit-amount", type: "number", min: 5, step: 5, value: depositAmount, onChange: (event) => setDepositAmount(Number(event.target.value) || 0) })] }), _jsx("div", { className: "user-actions__quick", children: [25, 50, 100].map((preset) => (_jsxs("button", { type: "button", onClick: () => setDepositAmount(preset), children: [preset, " cr"] }, preset))) })] }), _jsxs("div", { className: "user-actions__buttons", children: [_jsxs("button", { type: "button", className: "user-actions__primary", onClick: () => onTopup(depositAmount), disabled: isProcessingTopup || depositAmount <= 0, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "add_card" }), isProcessingTopup ? "Procesando..." : "Depositar créditos"] }), _jsxs("button", { type: "button", className: "user-actions__secondary", onClick: onWithdraw, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "payments" }), "Retirar cr\u00E9ditos"] })] })] })] }), _jsxs("section", { className: "user-transactions", children: [_jsxs("header", { className: "user-transactions__header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Historial de transacciones" }), _jsx("p", { children: "Movimientos recientes en tu cuenta" })] }), _jsxs("div", { className: "user-transactions__filters", children: [_jsxs("label", { className: "user-search", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "search" }), _jsx("input", { type: "search", placeholder: "Buscar transacci\u00F3n...", value: search, onChange: (event) => setSearch(event.target.value) })] }), _jsxs("select", { className: "user-select", value: typeFilter, onChange: (event) => setTypeFilter(event.target.value), children: [_jsx("option", { value: "all", children: "Todos los tipos" }), _jsx("option", { value: "deposit", children: "Dep\u00F3sitos" }), _jsx("option", { value: "withdraw", children: "Retiros" }), _jsx("option", { value: "purchase", children: "Compras" }), _jsx("option", { value: "prize", children: "Premios" })] }), _jsxs("select", { className: "user-select", value: rangeFilter, onChange: (event) => setRangeFilter(event.target.value), children: [_jsx("option", { value: "30", children: "\u00DAltimos 30 d\u00EDas" }), _jsx("option", { value: "90", children: "\u00DAltimos 3 meses" }), _jsx("option", { value: "365", children: "Este a\u00F1o" }), _jsx("option", { value: "all", children: "Todos" })] })] })] }), _jsx("div", { className: "user-transactions__table-wrapper", children: _jsxs("table", { className: "user-transactions__table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Fecha" }), _jsx("th", { scope: "col", children: "Tipo" }), _jsx("th", { scope: "col", children: "Descripci\u00F3n" }), _jsx("th", { scope: "col", className: "user-transactions__amount-heading", children: "Monto" })] }) }), _jsxs("tbody", { children: [filteredTransactions.map((txn) => {
                                                    const badge = typeBadge(txn.type);
                                                    return (_jsxs("tr", { children: [_jsx("td", { "data-label": "Fecha", children: formatDate(txn.timestamp) }), _jsx("td", { "data-label": "Tipo", children: _jsxs("span", { className: badge.className, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: badge.icon }), badge.label] }) }), _jsx("td", { "data-label": "Descripci\u00F3n", children: txn.description }), _jsx("td", { className: `user-transactions__amount user-transactions__amount--${txn.type}`, children: formatAmount(txn.amount) })] }, txn.id));
                                                }), filteredTransactions.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "user-transactions__empty", children: "No se encontraron movimientos para los filtros seleccionados." }) }))] })] }) })] })] })] }));
}
export default UserDashboardView;
