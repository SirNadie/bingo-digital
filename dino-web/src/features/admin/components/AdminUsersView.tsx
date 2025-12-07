import { useState, useMemo } from "react";
import { formatCredits } from "../../../utils/format";
import type { AdminUser } from "../../../types";

type AdminUsersViewProps = {
    users: AdminUser[];
    isLoading: boolean;
};

export function AdminUsersView({ users, isLoading }: AdminUsersViewProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const term = search.trim().toLowerCase();
        return users.filter(
            (user) =>
                user.alias?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term)
        );
    }, [users, search]);

    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <>
            <section className="admin-metrics admin-metrics--users">
                <article className="admin-card admin-card--metric admin-card--metricCompact">
                    <header>
                        <span className="material-symbols-outlined" aria-hidden="true">group</span>
                        <p>Total usuarios</p>
                    </header>
                    <strong>{users.length}</strong>
                    <span className="admin-metric__trend admin-metric__trend--neutral">Registrados</span>
                </article>
            </section>
            <section className="admin-card admin-card--table">
                <header className="admin-card__header">
                    <div>
                        <p className="admin-card__title">Jugadores registrados</p>
                        <span>Lista de usuarios en la plataforma</span>
                    </div>
                    <label className="admin-search">
                        <span className="material-symbols-outlined" aria-hidden="true">
                            search
                        </span>
                        <input
                            type="search"
                            placeholder="Buscar por alias o email"
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
                                <th scope="col">Alias</th>
                                <th scope="col">Email</th>
                                <th scope="col">Estado</th>
                                <th scope="col">Balance</th>
                                <th scope="col">Visto</th>
                                <th scope="col">Partidas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="admin-table-loading">Cargando usuarios...</div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="admin-table-empty">
                                            <span className="material-symbols-outlined" aria-hidden="true">person_off</span>
                                            <p>No hay usuarios{search ? " que coincidan" : " registrados"}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && paginatedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.alias}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`admin-status admin-status--${user.tone}`}>{user.status}</span>
                                    </td>
                                    <td>{formatCredits(user.balance)}</td>
                                    <td>{user.lastSeen}</td>
                                    <td>{user.gamesPlayed}</td>
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
        </>
    );
}
