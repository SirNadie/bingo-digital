import { useState } from "react";
import toast from "react-hot-toast";
import { Me, UserView } from "../../../types";
import { useCreateGame } from "../../../hooks/useGames";
import UserHeader from "../components/UserHeader";

type UserCreateViewProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

export function UserCreateView({ me, onLogout, currentView, onNavigate }: UserCreateViewProps) {
  const [price, setPrice] = useState(1);
  const [autostartEnabled, setAutostartEnabled] = useState(true);
  const [autostartThreshold, setAutostartThreshold] = useState(10);

  const createGame = useCreateGame();

  const handleDecreasePrice = () => {
    if (price > 0.5) setPrice(p => Math.round((p - 0.5) * 10) / 10);
  };

  const handleIncreasePrice = () => {
    setPrice(p => Math.round((p + 0.5) * 10) / 10);
  };

  const handleCreate = () => {
    createGame.mutate({
      price,
      autostart_enabled: autostartEnabled,
      autostart_threshold: autostartEnabled ? autostartThreshold : undefined,
    }, {
      onSuccess: () => {
        onNavigate("join");
      }
    });
  };

  const estimatedPool = price * autostartThreshold * 0.9; // 10% comisión

  return (
    <div className="user-create-shell">
      <UserHeader view={currentView} balance={me.balance} userEmail={me.email} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="user-create-main">
        <div className="user-create-content">
          <section className="user-create-form">
            <header className="user-create-heading">
              <div>
                <h2>Crear nueva partida</h2>
                <p>Define precio, premios y condiciones de inicio.</p>
              </div>
              <button type="button" onClick={() => onNavigate("balance")} className="user-create-back">
                <span className="material-symbols-outlined" aria-hidden="true">
                  arrow_back
                </span>
                Volver
              </button>
            </header>

            <div className="user-create-cards">
              <article className="user-create-card">
                <h3>Precio por cartón</h3>
                <div className="user-create-price">
                  <button type="button" onClick={handleDecreasePrice} aria-label="Disminuir precio">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      remove
                    </span>
                  </button>
                  <div className="user-create-price__input">
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={price}
                      onChange={(e) => setPrice(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                      aria-label="Precio del cartón"
                    />
                    <span>créditos</span>
                  </div>
                  <button type="button" onClick={handleIncreasePrice} aria-label="Incrementar precio">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      add
                    </span>
                  </button>
                </div>
                <p className="user-create-note">Mínimo 0.5 créditos, en incrementos de 0.5.</p>
              </article>

              <article className="user-create-card">
                <h3>Distribución de premios</h3>
                <div className="user-create-prizes">
                  <div className="user-create-prize user-create-prize--active">
                    <strong>3 Premios</strong>
                    <span>Diagonal 20% · Línea 20% · Bingo 50%</span>
                  </div>
                </div>
                <p className="user-create-note">La comisión de la plataforma es del 10%.</p>
              </article>

              <article className="user-create-card">
                <h3>Inicio automático</h3>
                <div className="user-create-autostart">
                  <div className="user-create-autostart__row">
                    <div>
                      <p>Mínimo de cartones para iniciar</p>
                      <span>La partida podrá iniciarse al alcanzar este mínimo.</span>
                    </div>
                    <div className="user-create-autostart__controls">
                      <input
                        type="number"
                        min={2}
                        value={autostartThreshold}
                        onChange={(e) => setAutostartThreshold(Math.max(2, parseInt(e.target.value) || 10))}
                        aria-label="Cartones mínimos para iniciar"
                      />
                      <input
                        type="checkbox"
                        checked={autostartEnabled}
                        onChange={(e) => setAutostartEnabled(e.target.checked)}
                        aria-label="Activar inicio automático"
                      />
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <aside className="user-create-summary">
            <article>
              <h3>Resumen de la partida</h3>
              <ul>
                <li>
                  <span>Precio / cartón</span>
                  <strong>{price} créditos</strong>
                </li>
                <li>
                  <span>Premios</span>
                  <div>
                    <strong>Diagonal: 20%</strong>
                    <strong>Línea: 20%</strong>
                    <strong>Bingo: 50%</strong>
                  </div>
                </li>
                <li>
                  <span>Mínimo cartones</span>
                  <strong>{autostartThreshold}</strong>
                </li>
                <li>
                  <span>Pozo estimado</span>
                  <strong>{estimatedPool.toFixed(2)} créditos</strong>
                </li>
              </ul>
            </article>
            <div className="user-create-actions">
              <button
                type="button"
                className="user-create-actions__primary"
                onClick={handleCreate}
                disabled={createGame.isPending}
              >
                {createGame.isPending ? "Creando..." : "Crear partida"}
              </button>
              <button
                type="button"
                className="user-create-actions__secondary"
                onClick={() => onNavigate("balance")}
              >
                Cancelar
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default UserCreateView;
