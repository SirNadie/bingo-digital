import { Me, UserView } from "../../../types";
import { formatCredits } from "../../../utils/format";
import UserHeader from "../components/UserHeader";
import { JOINABLE_GAMES } from "../constants";
import { JoinableGameCard } from "../../../types";

type UserJoinViewProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
  onJoinGame: (game: JoinableGameCard) => void;
};

export function UserJoinView({ me, onLogout, currentView, onNavigate, onJoinGame }: UserJoinViewProps) {
  return (
    <div className="user-join-shell">
      <UserHeader view={currentView} balance={me.balance} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="user-join-main">
        <section className="user-join-header">
          <div>
            <h2>Partidas activas</h2>
            <p>Salas disponibles para unirte ahora mismo.</p>
          </div>
          <div className="user-join-actions">
            <label className="user-join-search">
              <span className="material-symbols-outlined" aria-hidden="true">
                search
              </span>
              <input type="search" placeholder="Buscar sala, anfitrión o ID" />
            </label>
            <button type="button" className="user-join-filter" aria-label="Filtrar partidas">
              <span className="material-symbols-outlined" aria-hidden="true">
                tune
              </span>
            </button>
            <button type="button" className="user-join-create" onClick={() => onNavigate("create")}>
              <span className="material-symbols-outlined" aria-hidden="true">
                add
              </span>
            </button>
          </div>
        </section>

        <section className="user-join-grid">
          {JOINABLE_GAMES.map((game) => (
            <article key={game.id} className="user-join-card">
              <header>
                <div>
                  <p className="user-join-creator">{game.creator}</p>
                  <h3>{game.roomName}</h3>
                  <p>{game.description}</p>
                </div>
                <div className="user-join-pot">
                  <p>Pozo actual</p>
                  <strong>{formatCredits(game.pot)}</strong>
                </div>
              </header>
              <div className="user-join-divider" />
              <ul>
                <li>
                  <span>Descripción</span>
                  <strong>{game.description}</strong>
                </li>
                <li>
                  <span>Precio del cartón</span>
                  <span className="user-join-tag">{formatCredits(game.price)}</span>
                </li>
                <li>
                  <span>Cartones vendidos</span>
                  <strong>{game.sold}</strong>
                </li>
                <li>
                  <span>Plantilla de premios</span>
                  <strong>{game.rewards}</strong>
                </li>
                <li className="user-join-breakdown">{game.breakdown}</li>
              </ul>
              <footer>
                <button type="button" className="user-join-primary" onClick={() => onJoinGame(game)}>
                  {game.actionLabel}
                </button>
                <button type="button" className="user-join-secondary">
                  Ver detalles
                </button>
              </footer>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default UserJoinView;
