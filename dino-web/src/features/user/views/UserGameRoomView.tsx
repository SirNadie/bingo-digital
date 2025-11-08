import { JoinableGameCard, Me, UserView } from "../../../types";
import { formatCredits } from "../../../utils/format";
import UserHeader from "../components/UserHeader";
import { USER_ROOM_CALLED_NUMBERS, USER_ROOM_SAMPLE_CARDS, USER_ROOM_SAMPLE_CHAT } from "../constants";

type UserGameRoomViewProps = {
  me: Me;
  game: JoinableGameCard;
  onLeave: () => void;
  onLogout: () => void;
  onNavigate: (view: UserView) => void;
  pendingTickets: number;
  onConfirmTickets: (count: number) => void;
};

export function UserGameRoomView({
  me,
  game,
  onLeave,
  onLogout,
  onNavigate,
  pendingTickets,
  onConfirmTickets,
}: UserGameRoomViewProps) {
  const calledNumbers = USER_ROOM_CALLED_NUMBERS;

  return (
    <div className="user-room-shell">
      <UserHeader
        view="room"
        balance={me.balance}
        onNavigate={onNavigate}
        onLogout={onLogout}
        roomMode
        onRequestExit={onLeave}
      />

      <main className="user-room-main">
        <header className="user-room-header">
          <div>
            <p className="user-room-eyebrow">Ronda #{game.id.slice(0, 5)}</p>
            <h2>{game.roomName}</h2>
            <p className="user-room-subtitle">{game.description}</p>
          </div>
          <div className="user-room-actions">
            <button type="button" className="user-room-button user-room-button--ghost" onClick={onLeave}>
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
              Salir de la sala
            </button>
            <button type="button" className="user-room-button">
              <span className="material-symbols-outlined" aria-hidden="true">
                refresh
              </span>
              Actualizar estado
            </button>
          </div>
        </header>

        <section className="user-room-layout">
          <aside className="user-room-sidebar">
            <div className="user-room-heading">
              <p className="user-room-eyebrow">Información</p>
              <h3>Pozo en juego</h3>
              <p>{formatCredits(game.pot)}</p>
            </div>
            <div className="user-room-stats">
              <div className="user-room-stat">
                <p>Última bola</p>
                <strong>{calledNumbers.lastBall}</strong>
              </div>
              <div className="user-room-stat">
                <p>Premio línea</p>
                <strong>{formatCredits(calledNumbers.linePrize)}</strong>
              </div>
              <div className="user-room-stat">
                <p>Premio bingo</p>
                <strong>{formatCredits(calledNumbers.bingoPrize)}</strong>
              </div>
            </div>
            <ul className="user-room-sidebar-list">
              <li>
                <p>Cartones vendidos</p>
                <strong>{game.sold}</strong>
              </li>
              <li>
                <p>Precio</p>
                <strong>{formatCredits(game.price)}</strong>
              </li>
              <li>
                <p>Reparto</p>
                <strong>{game.breakdown}</strong>
              </li>
            </ul>
            <button className="user-room-call" type="button">
              <span className="material-symbols-outlined" aria-hidden="true">
                campaign
              </span>
              Pedir verificación
            </button>
          </aside>

          <section className="user-room-center">
            <h3 className="user-room-section-title">Tus cartones</h3>
            <div className="user-room-cardgrid">
              {USER_ROOM_SAMPLE_CARDS.map((card, index) => (
                <div key={`card-${index}`} className="user-room-card">
                  <div className="user-room-card-header">
                    <p>Cartón #{index + 1}</p>
                    <span>ID: {Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
                  </div>
                  <div className="user-room-card-body">
                    {card.map((row, rowIdx) => (
                      <div key={rowIdx} className="user-room-card-row">
                        {row.map((cell, cellIdx) => {
                          const isFree = cell === 0;
                          const isHit = calledNumbers.highlights.has(cell);
                          return (
                            <div
                              key={`${rowIdx}-${cellIdx}`}
                              className={[
                                "user-room-card-cell",
                                isFree ? "user-room-card-cell--free" : "",
                                isHit ? "user-room-card-cell--hit" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {isFree ? (
                                <span className="material-symbols-outlined" aria-hidden="true">
                                  star
                                </span>
                              ) : (
                                cell
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="user-room-called">
            <h3 className="user-room-section-title">Números cantados</h3>
            <div className="user-room-called-grid">
              {Object.entries(calledNumbers.board).map(([letter, numbers]) => (
                <div key={letter} className="user-room-called-column">
                  <span>{letter}</span>
                  {numbers.map((number) => {
                    const isHit = calledNumbers.highlights.has(number);
                    return (
                      <span
                        key={`${letter}-${number}`}
                        className={
                          isHit ? "user-room-called-number user-room-called-number--hit" : "user-room-called-number"
                        }
                      >
                        {number}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <div className="user-room-toast">
          <p>Modo demo: pronto verás aquí tus logros en vivo.</p>
        </div>
      </main>

      {pendingTickets > 0 && (
        <div className="user-room-modal">
          <div className="user-room-modal__panel">
            <h4>Selecciona cartones</h4>
            <p>¿Con cuántos cartones quieres entrar a esta partida?</p>
            <div className="user-room-modal__options">
              {[1, 2].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onConfirmTickets(option)}
                  className="user-room-modal__option"
                >
                  {option} cartón{option > 1 ? "es" : ""}
                </button>
              ))}
            </div>
            <button type="button" className="user-room-modal__cancel" onClick={onLeave}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserGameRoomView;
