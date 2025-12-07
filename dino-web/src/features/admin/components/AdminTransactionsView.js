import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { formatCredits } from "../../../utils/format";
import { useApproveTransaction, useRejectTransaction } from "../../../hooks/useAdmin";
function getInitials(user) {
    const parts = user.split(/[^a-zA-Z0-9]/).filter(Boolean);
    if (parts.length) {
        return parts
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }
    return user.slice(0, 2).toUpperCase();
}
function getTypeMeta(type) {
    return type === "deposit"
        ? { icon: "south_west", label: "Depósito", tone: "deposit" }
        : { icon: "north_east", label: "Retiro", tone: "withdraw" };
}
export function AdminTransactionsView({ transactions, isLoading }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const approveMutation = useApproveTransaction();
    const rejectMutation = useRejectTransaction();
    const filteredTransactions = useMemo(() => {
        let result = transactions;
        if (search.trim()) {
            const term = search.trim().toLowerCase();
            result = transactions.filter((txn) => txn.id.toLowerCase().includes(term) ||
                txn.user.toLowerCase().includes(term) ||
                txn.timestamp.toLowerCase().includes(term));
        }
        return [...result].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [transactions, search]);
    const pendingCount = transactions.filter((txn) => txn.status === "pending").length;
    const totalPages = Math.ceil(filteredTransactions.length / pageSize);
    const paginatedTransactions = filteredTransactions.slice(page * pageSize, (page + 1) * pageSize);
    const handleApprove = (id) => {
        if (approveMutation.isPending)
            return;
        approveMutation.mutate(id);
    };
    const handleReject = (id) => {
        if (!window.confirm("¿Seguro que deseas rechazar esta transacción? Los fondos se devolverán al usuario.")) {
            return;
        }
        if (rejectMutation.isPending)
            return;
        rejectMutation.mutate(id);
    };
    return (_jsxs("section", { className: "admin-card admin-card--table", children: [_jsxs("header", { className: "admin-card__header", children: [_jsxs("div", { children: [_jsx("p", { className: "admin-card__title", children: "Transacciones recientes" }), _jsxs("span", { children: [pendingCount, " pendientes de aprobaci\u00F3n"] })] }), _jsxs("label", { className: "admin-search", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "search" }), _jsx("input", { type: "search", placeholder: "Buscar por usuario o ID", value: search, onChange: (e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                } }), search && (_jsx("button", { type: "button", onClick: () => { setSearch(""); setPage(0); }, className: "admin-search-clear", "aria-label": "Limpiar b\u00FAsqueda", children: _jsx("span", { className: "material-symbols-outlined", style: { fontSize: 18 }, children: "close" }) }))] })] }), _jsx("div", { className: "admin-table-wrapper", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Usuario" }), _jsx("th", { scope: "col", children: "Fecha" }), _jsx("th", { scope: "col", children: "Monto" }), _jsx("th", { scope: "col", children: "Tipo" }), _jsx("th", { scope: "col", children: "Estado" }), _jsx("th", { scope: "col", className: "admin-transactions__actions-header", children: "Acciones" })] }) }), _jsxs("tbody", { children: [isLoading && (_jsx("tr", { children: _jsx("td", { colSpan: 6, children: _jsx("div", { className: "admin-table-loading", children: "Cargando transacciones..." }) }) })), !isLoading && filteredTransactions.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, children: _jsxs("div", { className: "admin-table-empty", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "receipt_long" }), _jsxs("p", { children: ["No hay transacciones", search ? " que coincidan" : ""] })] }) }) })), !isLoading && paginatedTransactions.map((txn) => {
                                    const badge = getTypeMeta(txn.type);
                                    const isPending = txn.status === "pending";
                                    return (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { className: "admin-table-user", children: [_jsx("span", { className: "admin-avatar admin-avatar--small", "aria-hidden": "true", children: getInitials(txn.user) }), _jsxs("div", { children: [_jsx("strong", { children: txn.user }), _jsx("p", { children: txn.id })] })] }) }), _jsx("td", { children: txn.timestamp }), _jsx("td", { className: `admin-amount admin-amount--${txn.type}`, children: formatCredits(txn.amount) }), _jsx("td", { children: _jsxs("span", { className: `admin-chip admin-chip--${badge.tone}`, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: badge.icon }), badge.label] }) }), _jsx("td", { children: _jsx("span", { className: `admin-status admin-status--${txn.status}`, children: txn.status }) }), _jsx("td", { className: "admin-transactions__actions-cell", children: _jsxs("div", { className: "admin-transactions__row-actions", children: [_jsx("button", { type: "button", className: "admin-transactions__row-button admin-transactions__row-button--deny", onClick: () => handleReject(txn.id), disabled: !isPending || rejectMutation.isPending, title: isPending ? "Rechazar" : "Ya procesada", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "cancel" }) }), _jsx("button", { type: "button", className: "admin-transactions__row-button admin-transactions__row-button--approve", onClick: () => handleApprove(txn.id), disabled: !isPending || approveMutation.isPending, title: isPending ? "Aprobar" : "Ya procesada", children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "check_circle" }) })] }) })] }, txn.id));
                                })] })] }) }), totalPages > 1 && (_jsxs("footer", { className: "admin-table-pagination", children: [_jsx("button", { type: "button", disabled: page === 0, onClick: () => setPage((p) => p - 1), children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "chevron_left" }) }), _jsxs("span", { children: ["P\u00E1gina ", page + 1, " de ", totalPages] }), _jsx("button", { type: "button", disabled: page >= totalPages - 1, onClick: () => setPage((p) => p + 1), children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "chevron_right" }) })] }))] }));
}
