import { useState, useMemo } from "react";
import { formatCredits } from "../../../utils/format";
import type { AdminGame } from "../../../types";

type AdminGamesViewProps = {
    games: AdminGame[];
    isLoading: boolean;
};

export function AdminGamesView({ games, isLoading }: AdminGamesViewProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const filteredGames = useMemo(() => {
        if (!search.trim()) return games;
        const term = search.trim().toLowerCase();
        return games.filter(
            (game) =>
                game.name?.toLowerCase().includes(term) ||
                game.host?.toLowerCase().includes(term) ||
                game.status?.toLowerCase().includes(term)
        );
    }, [games, search]);

    const totalPages = Math.ceil(filteredGames.length / pageSize);
    const paginatedGames = filteredGames.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <section className="admin-card admin-card--table">
            <header className="admin-card__header">
                <div>
                    <p className="admin-card__title">Salas de juego</p>
                    <span>Monitorea partidas y su evolución</span>
                </div>
                <label className="admin-search">
                    <span className="material-symbols-outlined" aria-hidden="true">
                        search
                    </span>
                    <input
                        type="search"
                        placeholder="Buscar sala o anfitrión"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                    />
                </label>
            </header>
            <div className="admin-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Sala</th>
                            <th scope="col">Anfitrión</th>
                            <th scope="col">Horario</th>
                            <th scope="col">Premios</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Buy-in</th>
                            <th scope="col">Pozo</th>
                            <th scope="col">Jugadores</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={8}>
                                    <div className="admin-table-loading">Cargando partidas...</div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && filteredGames.length === 0 && (
                            <tr>
                                <td colSpan={8}>
                                    <div className="admin-table-empty">
                                        <span className="material-symbols-outlined" aria-hidden="true">sports_esports</span>
                                        <p>No hay partidas{search ? " que coincidan" : " registradas"}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && paginatedGames.map((game) => (
                            <tr key={game.id}>
                                <td>{game.name}</td>
                                <td>{game.host}</td>
                                <td>{game.schedule}</td>
                                <td>{game.reward}</td>
                                <td>
                                    <span className={`admin-status admin-status--${game.tone}`}>{game.status}</span>
                                </td>
                                <td>{formatCredits(game.buyIn)}</td>
                                <td>{formatCredits(game.pot)}</td>
                                <td>{game.players}/{game.capacity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <footer className="admin-table-pagination">
                    <button
                        type="button"
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                    </button>
                    <span>
                        Página {page + 1} de {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                    </button>
                </footer>
            )}
        </section>
    );
}
