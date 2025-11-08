import { useMemo, useState } from "react";
import { Me, UserTransaction, UserTransactionType, UserView } from "../../../types";
import { formatCredits } from "../../../utils/format";
import UserHeader from "../components/UserHeader";

type UserDashboardViewProps = {
  me: Me;
  onLogout: () => void;
  onTopup: (amount: number) => Promise<void>;
  onWithdraw: () => void;
  isProcessingTopup: boolean;
  transactions: UserTransaction[];
  message: string;
  error: string;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

export function UserDashboardView({
  me,
  onLogout,
  onTopup,
  onWithdraw,
  isProcessingTopup,
  transactions,
  message,
  error,
  currentView,
  onNavigate,
}: UserDashboardViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<UserTransactionType | "all">("all");
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
      const matchesSearch =
        !search.trim() ||
        txn.description.toLowerCase().includes(search.trim().toLowerCase()) ||
        txn.id.toLowerCase().includes(search.trim().toLowerCase());
      const matchesRange = !minDate || new Date(txn.timestamp) >= minDate;
      return matchesType && matchesSearch && matchesRange;
    });
  }, [transactions, search, typeFilter, rangeFilter]);

  const balance = Number.isFinite(me.balance) ? me.balance : 0;

  const formatAmount = (amount: number) => formatCredits(amount, { showSign: true });

  const formatDate = (timestamp: string) =>
    new Date(timestamp).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const typeBadge = (type: UserTransactionType) => {
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

  return (
    <div className="user-shell">
      <UserHeader view={currentView} balance={balance} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="user-main">
        <section className="user-quick-actions">
          <button type="button" className="user-quick-actions__primary" onClick={() => onNavigate("join")}>
            <span className="material-symbols-outlined" aria-hidden="true">
              group_add
            </span>
            Unirse a partida
          </button>
          <button type="button" className="user-quick-actions__secondary" onClick={() => onNavigate("create")}>
            <span className="material-symbols-outlined" aria-hidden="true">
              add_circle
            </span>
            Crear partida
          </button>
        </section>

        {(error || message) && (
          <div className="user-alerts">
            {error ? (
              <div className="user-alert user-alert--error">{error}</div>
            ) : (
              message && <div className="user-alert user-alert--info">{message}</div>
            )}
          </div>
        )}

        <section className="user-summary">
          <article className="user-summary__card">
            <div className="user-summary__heading">
              <span className="material-symbols-outlined" aria-hidden="true">
                savings
              </span>
              <h2>Créditos disponibles</h2>
            </div>
            <p className="user-summary__balance">{formatCredits(balance)}</p>
            <span className="user-summary__caption">Actualizado al {new Date().toLocaleDateString("es-ES")}</span>
          </article>
          <article className="user-actions">
            <div className="user-actions__input">
              <label htmlFor="deposit-amount">Monto a depositar</label>
              <div className="user-actions__amount">
                <span>cr</span>
                <input
                  id="deposit-amount"
                  type="number"
                  min={5}
                  step={5}
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(Number(event.target.value) || 0)}
                />
              </div>
              <div className="user-actions__quick">
                {[25, 50, 100].map((preset) => (
                  <button key={preset} type="button" onClick={() => setDepositAmount(preset)}>
                    {preset} cr
                  </button>
                ))}
              </div>
            </div>
            <div className="user-actions__buttons">
              <button
                type="button"
                className="user-actions__primary"
                onClick={() => onTopup(depositAmount)}
                disabled={isProcessingTopup || depositAmount <= 0}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  add_card
                </span>
                {isProcessingTopup ? "Procesando..." : "Depositar créditos"}
              </button>
              <button type="button" className="user-actions__secondary" onClick={onWithdraw}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  payments
                </span>
                Retirar créditos
              </button>
            </div>
          </article>
        </section>

        <section className="user-transactions">
          <header className="user-transactions__header">
            <div>
              <h2>Historial de transacciones</h2>
              <p>Movimientos recientes en tu cuenta</p>
            </div>
            <div className="user-transactions__filters">
              <label className="user-search">
                <span className="material-symbols-outlined" aria-hidden="true">
                  search
                </span>
                <input
                  type="search"
                  placeholder="Buscar transacción..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                className="user-select"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as UserTransactionType | "all")}
              >
                <option value="all">Todos los tipos</option>
                <option value="deposit">Depósitos</option>
                <option value="withdraw">Retiros</option>
                <option value="purchase">Compras</option>
                <option value="prize">Premios</option>
              </select>
              <select className="user-select" value={rangeFilter} onChange={(event) => setRangeFilter(event.target.value)}>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Este año</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </header>

          <div className="user-transactions__table-wrapper">
            <table className="user-transactions__table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Descripción</th>
                  <th scope="col" className="user-transactions__amount-heading">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => {
                  const badge = typeBadge(txn.type);
                  return (
                    <tr key={txn.id}>
                      <td data-label="Fecha">{formatDate(txn.timestamp)}</td>
                      <td data-label="Tipo">
                        <span className={badge.className}>
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {badge.icon}
                          </span>
                          {badge.label}
                        </span>
                      </td>
                      <td data-label="Descripción">{txn.description}</td>
                      <td className={`user-transactions__amount user-transactions__amount--${txn.type}`}>
                        {formatAmount(txn.amount)}
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="user-transactions__empty">
                      No se encontraron movimientos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserDashboardView;
