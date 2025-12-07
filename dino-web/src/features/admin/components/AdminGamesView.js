import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { formatCredits } from "../../../utils/format";
export function AdminGamesView({ games, isLoading }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const filteredGames = useMemo(() => {
        if (!search.trim())
            return games;
        const term = search.trim().toLowerCase();
        return games.filter((game) => game.name?.toLowerCase().includes(term) ||
            game.host?.toLowerCase().includes(term) ||
            game.status?.toLowerCase().includes(term));
    }, [games, search]);
    const totalPages = Math.ceil(filteredGames.length / pageSize);
    const paginatedGames = filteredGames.slice(page * pageSize, (page + 1) * pageSize);
    return (_jsxs("section", { className: "admin-card admin-card--table", children: [_jsxs("header", { className: "admin-card__header", children: [_jsxs("div", { children: [_jsx("p", { className: "admin-card__title", children: "Salas de juego" }), _jsx("span", { children: "Monitorea partidas y su evoluci\u00F3n" })] }), _jsxs("label", { className: "admin-search", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "search" }), _jsx("input", { type: "search", placeholder: "Buscar sala o anfitri\u00F3n", value: search, onChange: (e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                } })] })] }), _jsx("div", { className: "admin-table-wrapper", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Sala" }), _jsx("th", { scope: "col", children: "Anfitri\u00F3n" }), _jsx("th", { scope: "col", children: "Horario" }), _jsx("th", { scope: "col", children: "Premios" }), _jsx("th", { scope: "col", children: "Estado" }), _jsx("th", { scope: "col", children: "Buy-in" }), _jsx("th", { scope: "col", children: "Pozo" }), _jsx("th", { scope: "col", children: "Jugadores" })] }) }), _jsxs("tbody", { children: [isLoading && (_jsx("tr", { children: _jsx("td", { colSpan: 8, children: _jsx("div", { className: "admin-table-loading", children: "Cargando partidas..." }) }) })), !isLoading && filteredGames.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, children: _jsxs("div", { className: "admin-table-empty", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "sports_esports" }), _jsxs("p", { children: ["No hay partidas", search ? " que coincidan" : " registradas"] })] }) }) })), !isLoading && paginatedGames.map((game) => (_jsxs("tr", { children: [_jsx("td", { children: game.name }), _jsx("td", { children: game.host }), _jsx("td", { children: game.schedule }), _jsx("td", { children: game.reward }), _jsx("td", { children: _jsx("span", { className: `admin-status admin-status--${game.tone}`, children: game.status }) }), _jsx("td", { children: formatCredits(game.buyIn) }), _jsx("td", { children: formatCredits(game.pot) }), _jsxs("td", { children: [game.players, "/", game.capacity] })] }, game.id)))] })] }) }), totalPages > 1 && (_jsxs("footer", { className: "admin-table-pagination", children: [_jsx("button", { type: "button", disabled: page === 0, onClick: () => setPage((p) => p - 1), children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "chevron_left" }) }), _jsxs("span", { children: ["P\u00E1gina ", page + 1, " de ", totalPages] }), _jsx("button", { type: "button", disabled: page >= totalPages - 1, onClick: () => setPage((p) => p + 1), children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "chevron_right" }) })] }))] }));
}
