import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { formatCredits } from "../../../utils/format";
export function AdminUsersView({ users, isLoading }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const filteredUsers = useMemo(() => {
        if (!search.trim())
            return users;
        const term = search.trim().toLowerCase();
        return users.filter((user) => user.alias?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term));
    }, [users, search]);
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);
    return (_jsxs(_Fragment, { children: [_jsx("section", { className: "admin-metrics admin-metrics--users", children: _jsxs("article", { className: "admin-card admin-card--metric admin-card--metricCompact", children: [_jsxs("header", { children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "group" }), _jsx("p", { children: "Total usuarios" })] }), _jsx("strong", { children: users.length }), _jsx("span", { className: "admin-metric__trend admin-metric__trend--neutral", children: "Registrados" })] }) }), _jsxs("section", { className: "admin-card admin-card--table", children: [_jsxs("header", { className: "admin-card__header", children: [_jsxs("div", { children: [_jsx("p", { className: "admin-card__title", children: "Jugadores registrados" }), _jsx("span", { children: "Lista de usuarios en la plataforma" })] }), _jsxs("label", { className: "admin-search", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "search" }), _jsx("input", { type: "search", placeholder: "Buscar por alias o email", value: search, onChange: (e) => {
                                            setSearch(e.target.value);
                                            setPage(0);
                                        } })] })] }), _jsx("div", { className: "admin-table-wrapper", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Alias" }), _jsx("th", { scope: "col", children: "Email" }), _jsx("th", { scope: "col", children: "Estado" }), _jsx("th", { scope: "col", children: "Balance" }), _jsx("th", { scope: "col", children: "Visto" }), _jsx("th", { scope: "col", children: "Partidas" })] }) }), _jsxs("tbody", { children: [isLoading && (_jsx("tr", { children: _jsx("td", { colSpan: 6, children: _jsx("div", { className: "admin-table-loading", children: "Cargando usuarios..." }) }) })), !isLoading && filteredUsers.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, children: _jsxs("div", { className: "admin-table-empty", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "person_off" }), _jsxs("p", { children: ["No hay usuarios", search ? " que coincidan" : " registrados"] })] }) }) })), !isLoading && paginatedUsers.map((user) => (_jsxs("tr", { children: [_jsx("td", { children: user.alias }), _jsx("td", { children: user.email }), _jsx("td", { children: _jsx("span", { className: `admin-status admin-status--${user.tone}`, children: user.status }) }), _jsx("td", { children: formatCredits(user.balance) }), _jsx("td", { children: user.lastSeen }), _jsx("td", { children: user.gamesPlayed })] }, user.id)))] })] }) }), totalPages > 1 && (_jsxs("footer", { className: "admin-table-pagination", children: [_jsx("button", { type: "button", disabled: page === 0, onClick: () => setPage((p) => p - 1), children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "chevron_left" }) }), _jsxs("span", { children: ["P\u00E1gina ", page + 1, " de ", totalPages] }), _jsx("button", { type: "button", disabled: page >= totalPages - 1, onClick: () => setPage((p) => p + 1), children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "chevron_right" }) })] }))] })] }));
}
