import { useState, useMemo } from "react";
import { formatCredits } from "../../../utils/format";
import type { AdminTransaction } from "../../../types";
import { useApproveTransaction, useRejectTransaction } from "../../../hooks/useAdmin";

type AdminTransactionsViewProps = {
    transactions: AdminTransaction[];
    isLoading: boolean;
};

function getInitials(user: string): string {
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

function getTypeMeta(type: AdminTransaction["type"]) {
    return type === "deposit"
        ? { icon: "south_west", label: "Depósito", tone: "deposit" }
        : { icon: "north_east", label: "Retiro", tone: "withdraw" };
}

export function AdminTransactionsView({ transactions, isLoading }: AdminTransactionsViewProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const approveMutation = useApproveTransaction();
    const rejectMutation = useRejectTransaction();

    const filteredTransactions = useMemo(() => {
        let result = transactions;

        if (search.trim()) {
            const term = search.trim().toLowerCase();
            result = transactions.filter(
                (txn) =>
                    txn.id.toLowerCase().includes(term) ||
                    txn.user.toLowerCase().includes(term) ||
                    txn.timestamp.toLowerCase().includes(term)
            );
        }

        return [...result].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [transactions, search]);

    const pendingCount = transactions.filter((txn) => txn.status === "pending").length;
    const totalPages = Math.ceil(filteredTransactions.length / pageSize);
    const paginatedTransactions = filteredTransactions.slice(page * pageSize, (page + 1) * pageSize);

    const handleApprove = (id: string) => {
        if (approveMutation.isPending) return;
        approveMutation.mutate(id);
    };

    const handleReject = (id: string) => {
        if (!window.confirm("¿Seguro que deseas rechazar esta transacción? Los fondos se devolverán al usuario.")) {
            return;
        }
        if (rejectMutation.isPending) return;
        rejectMutation.mutate(id);
    };

    return (
        <section className="admin-card admin-card--table">
            <header className="admin-card__header">
                <div>
                    <p className="admin-card__title">Transacciones recientes</p>
                    <span>{pendingCount} pendientes de aprobación</span>
                </div>
                <label className="admin-search">
                    <span className="material-symbols-outlined" aria-hidden="true">
                        search
                    </span>
                    <input
                        type="search"
                        placeholder="Buscar por usuario o ID"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => { setSearch(""); setPage(0); }}
                            className="admin-search-clear"
                            aria-label="Limpiar búsqueda"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                        </button>
                    )}
                </label>
            </header>
            <div className="admin-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Usuario</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Monto</th>
                            <th scope="col">Tipo</th>
                            <th scope="col">Estado</th>
                            <th scope="col" className="admin-transactions__actions-header">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={6}>
                                    <div className="admin-table-loading">Cargando transacciones...</div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <div className="admin-table-empty">
                                        <span className="material-symbols-outlined" aria-hidden="true">receipt_long</span>
                                        <p>No hay transacciones{search ? " que coincidan" : ""}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && paginatedTransactions.map((txn) => {
                            const badge = getTypeMeta(txn.type);
                            const isPending = txn.status === "pending";
                            return (
                                <tr key={txn.id}>
                                    <td>
                                        <div className="admin-table-user">
                                            <span className="admin-avatar admin-avatar--small" aria-hidden="true">
                                                {getInitials(txn.user)}
                                            </span>
                                            <div>
                                                <strong>{txn.user}</strong>
                                                <p>{txn.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{txn.timestamp}</td>
                                    <td className={`admin-amount admin-amount--${txn.type}`}>{formatCredits(txn.amount)}</td>
                                    <td>
                                        <span className={`admin-chip admin-chip--${badge.tone}`}>
                                            <span className="material-symbols-outlined" aria-hidden="true">
                                                {badge.icon}
                                            </span>
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`admin-status admin-status--${txn.status}`}>{txn.status}</span>
                                    </td>
                                    <td className="admin-transactions__actions-cell">
                                        <div className="admin-transactions__row-actions">
                                            <button
                                                type="button"
                                                className="admin-transactions__row-button admin-transactions__row-button--deny"
                                                onClick={() => handleReject(txn.id)}
                                                disabled={!isPending || rejectMutation.isPending}
                                                title={isPending ? "Rechazar" : "Ya procesada"}
                                            >
                                                <span className="material-symbols-outlined" aria-hidden="true">
                                                    cancel
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-transactions__row-button admin-transactions__row-button--approve"
                                                onClick={() => handleApprove(txn.id)}
                                                disabled={!isPending || approveMutation.isPending}
                                                title={isPending ? "Aprobar" : "Ya procesada"}
                                            >
                                                <span className="material-symbols-outlined" aria-hidden="true">
                                                    check_circle
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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
