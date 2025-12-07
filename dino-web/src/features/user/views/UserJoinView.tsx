import { useState } from "react";
import toast from "react-hot-toast";
import { Me, UserView } from "../../../types";
import { formatCredits } from "../../../utils/format";
import { useGames, useBuyTicket, Game } from "../../../hooks/useGames";
import UserHeader from "../components/UserHeader";

type UserJoinViewProps = {
  me: Me;
  onLogout: () => void;
  currentView: UserView;
  onNavigate: (view: UserView) => void;
  onEnterRoom: (gameId: string) => void;
};

export function UserJoinView({ me, onLogout, currentView, onNavigate, onEnterRoom }: UserJoinViewProps) {
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { data, isLoading } = useGames("OPEN");
  const buyTicket = useBuyTicket();

  const games = data?.items || [];

  const filteredGames = games.filter(g =>
    g.id.toLowerCase().includes(search.toLowerCase()) ||
    g.creator_id.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (game: Game) => {
    if (game.creator_id === me.id) {
      // Creator can enter directly without buying
      onEnterRoom(game.id);
      return;
    }
    setSelectedGame(game);
    setTicketCount(1);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
    setTicketCount(1);
  };

  const handleConfirmEntry = async () => {
    if (!selectedGame) return;

    const totalCost = selectedGame.price * ticketCount;
    if (me.balance < totalCost) {
      toast.error(`Saldo insuficiente. Necesitas ${formatCredits(totalCost)}`);
      return;
    }

    setIsPurchasing(true);

    // Buy tickets sequentially
    for (let i = 0; i < ticketCount; i++) {
      try {
        await new Promise((resolve, reject) => {
          buyTicket.mutate(selectedGame.id, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          });
        });
      } catch (error: any) {
        const message = error?.response?.data?.detail || "Error al comprar cartón";
        toast.error(message);
        setIsPurchasing(false);
        return;
      }
    }

    setIsPurchasing(false);
    handleCloseModal();
    onEnterRoom(selectedGame.id);
  };

  const calculatePot = (game: Game) => {
    return game.sold_tickets * game.price * 0.9;
  };

  const canAfford = (game: Game, count: number) => me.balance >= game.price * count;

  return (
    <div className="user-join-shell">
      <UserHeader view={currentView} balance={me.balance} userEmail={me.email} onNavigate={onNavigate} onLogout={onLogout} />

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
              <input
                type="search"
                placeholder="Buscar por ID o creador"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button type="button" className="user-join-create" onClick={() => onNavigate("create")}>
              <span className="material-symbols-outlined" aria-hidden="true">
                add
              </span>
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="user-join-loading">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p>Cargando partidas...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="user-join-empty">
            <span className="material-symbols-outlined">sports_esports</span>
            <h3>No hay partidas disponibles</h3>
            <p>¡Sé el primero en crear una partida!</p>
            <button onClick={() => onNavigate("create")} className="user-join-primary">
              Crear partida
            </button>
          </div>
        ) : (
          <section className="user-join-grid">
            {filteredGames.map((game) => (
              <article key={game.id} className="user-join-card">
                <header>
                  <div>
                    <p className="user-join-creator">Sala #{game.id.slice(0, 8)}</p>
                    <h3>Bingo de {formatCredits(game.price)}</h3>
                    <p>Mínimo {game.min_tickets} cartones</p>
                  </div>
                  <div className="user-join-pot">
                    <p>Pozo actual</p>
                    <strong>{formatCredits(calculatePot(game))}</strong>
                  </div>
                </header>
                <div className="user-join-divider" />
                <ul>
                  <li>
                    <span>Precio del cartón</span>
                    <span className="user-join-tag">{formatCredits(game.price)}</span>
                  </li>
                  <li>
                    <span>Cartones vendidos</span>
                    <strong>{game.sold_tickets}</strong>
                  </li>
                  <li>
                    <span>Premios</span>
                    <strong>
                      Diagonal {formatCredits(calculatePot(game) * 0.2222)} · Línea {formatCredits(calculatePot(game) * 0.2222)} · Bingo {formatCredits(calculatePot(game) * 0.5556)}
                    </strong>
                  </li>
                  <li>
                    <span>Estado</span>
                    <span className={`user-join-status user-join-status--${game.status.toLowerCase()}`}>
                      {game.status === "OPEN" ? "Abierta" : game.status}
                    </span>
                  </li>
                </ul>
                <footer>
                  <button
                    type="button"
                    className="user-join-primary"
                    onClick={() => handleOpenModal(game)}
                    disabled={!canAfford(game, 1) && game.creator_id !== me.id}
                  >
                    {game.creator_id === me.id ? "Entrar (Tu partida)" :
                      !canAfford(game, 1) ? "Saldo insuficiente" :
                        "Entrar a partida"}
                  </button>
                </footer>
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Modal: Select ticket count */}
      {selectedGame && (
        <div className="user-room-modal">
          <div className="user-room-modal__panel">
            <h4>Entrar a partida</h4>
            <p>¿Con cuántos cartones quieres entrar?</p>
            <p className="user-room-modal__price">
              Precio por cartón: <strong>{formatCredits(selectedGame.price)}</strong>
            </p>

            <div className="user-room-modal__options">
              <button
                type="button"
                onClick={() => setTicketCount(1)}
                className={`user-room-modal__option ${ticketCount === 1 ? 'user-room-modal__option--active' : ''}`}
                disabled={!canAfford(selectedGame, 1)}
              >
                <strong>1 cartón</strong>
                <span>{formatCredits(selectedGame.price)}</span>
              </button>
              <button
                type="button"
                onClick={() => setTicketCount(2)}
                className={`user-room-modal__option ${ticketCount === 2 ? 'user-room-modal__option--active' : ''}`}
                disabled={!canAfford(selectedGame, 2)}
              >
                <strong>2 cartones</strong>
                <span>{formatCredits(selectedGame.price * 2)}</span>
              </button>
            </div>

            <p className="user-room-modal__total">
              Total: <strong>{formatCredits(selectedGame.price * ticketCount)}</strong>
            </p>

            <div className="user-room-modal__actions">
              <button
                type="button"
                className="user-room-modal__confirm"
                onClick={handleConfirmEntry}
                disabled={isPurchasing || !canAfford(selectedGame, ticketCount)}
              >
                {isPurchasing ? "Comprando..." : `Comprar y entrar`}
              </button>
              <button
                type="button"
                className="user-room-modal__cancel"
                onClick={handleCloseModal}
                disabled={isPurchasing}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserJoinView;
