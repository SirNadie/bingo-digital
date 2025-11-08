import { Me, UserView } from "../../../types";
import UserHeader from "../components/UserHeader";

type UserCreateViewProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
};

export function UserCreateView({ me, onLogout, currentView, onNavigate }: UserCreateViewProps) {
  return (
    <div className="user-create-shell">
      <UserHeader view={currentView} balance={me.balance} onNavigate={onNavigate} onLogout={onLogout} />

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
                  <button type="button" aria-label="Disminuir precio">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      remove
                    </span>
                  </button>
                  <div className="user-create-price__input">
                    <input type="number" min={0.5} step={0.5} value={0.5} readOnly aria-label="Precio del cartón" />
                    <span>créditos</span>
                  </div>
                  <button type="button" aria-label="Incrementar precio">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      add
                    </span>
                  </button>
                </div>
                <p className="user-create-note">Mínimo 0.5 créditos, en incrementos de 0.5.</p>
              </article>

              <article className="user-create-card">
                <h3>Plantilla de premios</h3>
                <div className="user-create-prizes">
                  <button type="button" className="user-create-prize">
                    <strong>1 Premio</strong>
                    <span>Línea · 100% del pozo</span>
                  </button>
                  <button type="button" className="user-create-prize user-create-prize--active">
                    <strong>2 Premios</strong>
                    <span>Línea 40% · Bingo 60%</span>
                  </button>
                  <button type="button" className="user-create-prize">
                    <strong>3 Premios</strong>
                    <span>Línea 20% · Doble 30% · Bingo 50%</span>
                  </button>
                </div>
              </article>

              <article className="user-create-card">
                <h3>Inicio automático</h3>
                <div className="user-create-autostart">
                  <div className="user-create-autostart__row">
                    <div>
                      <p>Iniciar por cartones vendidos</p>
                      <span>La partida inicia al alcanzar un número de cartones.</span>
                    </div>
                    <div className="user-create-autostart__controls">
                      <input type="number" min={10} value={50} readOnly aria-label="Cartones para iniciar" />
                      <input type="checkbox" checked readOnly aria-label="Activar inicio por cartones" />
                    </div>
                  </div>
                  <div className="user-create-autostart__row">
                    <div>
                      <p>Iniciar por tiempo</p>
                      <span>La partida inicia luego de un tiempo determinado.</span>
                    </div>
                    <div className="user-create-autostart__controls">
                      <input type="number" value={0} readOnly aria-label="Minutos para iniciar" disabled />
                      <input type="checkbox" aria-label="Activar inicio por tiempo" />
                    </div>
                  </div>
                </div>
                <p className="user-create-hint">La partida comenzará cuando se cumpla la primera condición alcanzada.</p>
              </article>
            </div>
          </section>

          <aside className="user-create-summary">
            <article>
              <h3>Resumen de la partida</h3>
              <ul>
                <li>
                  <span>Precio / cartón</span>
                  <strong>0.5 créditos</strong>
                </li>
                <li>
                  <span>Premios</span>
                  <div>
                    <strong>Línea: 40%</strong>
                    <strong>Bingo: 60%</strong>
                  </div>
                </li>
                <li>
                  <span>Inicio automático</span>
                  <strong>Por cartones</strong>
                </li>
                <li>
                  <span>Cartones máximos</span>
                  <strong>Sin límite</strong>
                </li>
              </ul>
            </article>
            <div className="user-create-actions">
              <button type="button" className="user-create-actions__primary">
                Crear partida
              </button>
              <button type="button" className="user-create-actions__secondary" onClick={() => onNavigate("balance")}>
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
