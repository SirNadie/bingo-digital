import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Me, UserView } from "../../../types";
import { formatCredits } from "../../../utils/format";
import { useGameState, useMyTickets, useStartGame, useDrawNumber, useCancelGame } from "../../../hooks/useGames";
import { useWebSocket } from "../../../hooks/useWebSocket";
import UserHeader from "../components/UserHeader";

type UserGameRoomViewProps = {
  me: Me;
  gameId: string;
  onLeave: () => void;
  onLogout: () => void;
  onNavigate: (view: UserView) => void;
};

export function UserGameRoomView({
  me,
  gameId,
  onLeave,
  onLogout,
  onNavigate,
}: UserGameRoomViewProps) {
  const [lastDrawnNumber, setLastDrawnNumber] = useState<number | null>(null);
  const [autoDrawEnabled, setAutoDrawEnabled] = useState(false);

  // API hooks
  const { data: gameState, refetch: refetchState } = useGameState(gameId);
  const { data: myTicketsData } = useMyTickets(gameId);
  const startGame = useStartGame();
  const drawNumber = useDrawNumber();
  const cancelGame = useCancelGame();

  const myTickets = myTicketsData?.items || [];
  const drawnNumbers = new Set(gameState?.drawn_numbers || []);

  // WebSocket connection
  const wsUrl = `${import.meta.env.VITE_API_URL?.replace('http', 'ws') || 'ws://localhost:8000'}/ws/games/${gameId}`;
  const { isConnected } = useWebSocket({
    url: wsUrl,
    enabled: true,
    onMessage: (msg) => {
      switch (msg.type) {
        case "number_drawn":
          const payload = msg.payload as { number: number };
          setLastDrawnNumber(payload.number);
          refetchState();
          break;
        case "winner":
          const winnerPayload = msg.payload as { user_id: string; category: string; amount: number };
          if (winnerPayload.user_id === me.id) {
            toast.success(`¡Ganaste ${winnerPayload.category}! +${formatCredits(winnerPayload.amount)}`);
          } else {
            toast(`¡Hay un ganador de ${winnerPayload.category}!`);
          }
          refetchState();
          break;
        case "game_started":
          toast.success("¡La partida ha comenzado!");
          refetchState();
          break;
        case "game_finished":
          toast("¡La partida ha terminado!");
          refetchState();
          break;
        case "player_joined":
          refetchState();
          break;
      }
    },
    onOpen: () => {
      console.log("WebSocket connected to game", gameId);
    }
  });

  // Calculate prizes (20% diagonal, 20% line, 50% bingo, 5% creator, 5% system)
  const pot = (gameState?.sold_tickets || 0) * (gameState?.price || 0) * 0.9; // 90% goes to prizes
  const diagonalPrize = pot * 0.2222; // ~20% of total
  const linePrize = pot * 0.2222; // ~20% of total
  const bingoPrize = pot * 0.5556; // ~50% of total

  // Check if user is creator (can start/draw/cancel)
  const isCreator = gameState?.creator_id === me.id;
  const canStart = isCreator && gameState?.status === "OPEN" && (gameState?.sold_tickets || 0) >= (gameState?.min_tickets || 1);
  const canCancel = isCreator && (gameState?.status === "OPEN" || gameState?.status === "READY");
  const isRunning = gameState?.status === "RUNNING";
  const isFinished = gameState?.status === "FINISHED";
  const isCancelled = gameState?.status === "CANCELLED";

  // Build the called numbers board (B-I-N-G-O columns)
  const calledBoard = useMemo(() => {
    const board: Record<string, number[]> = {
      B: Array.from({ length: 15 }, (_, i) => i + 1),
      I: Array.from({ length: 15 }, (_, i) => i + 16),
      N: Array.from({ length: 15 }, (_, i) => i + 31),
      G: Array.from({ length: 15 }, (_, i) => i + 46),
      O: Array.from({ length: 15 }, (_, i) => i + 61),
    };
    return board;
  }, []);

  const handleStartGame = () => {
    startGame.mutate(gameId);
  };

  const handleDrawNumber = () => {
    drawNumber.mutate(gameId);
  };

  const handleCancelGame = () => {
    if (confirm('¿Estás seguro de cancelar la partida? Se reembolsarán todos los cartones.')) {
      cancelGame.mutate(gameId, {
        onSuccess: () => {
          onLeave();
        }
      });
    }
  };

  const handleToggleAutoDraw = () => {
    setAutoDrawEnabled(prev => !prev);
  };

  // Auto-draw logic: draw a number every 5 seconds when enabled
  useEffect(() => {
    if (!autoDrawEnabled || !isRunning || !isCreator || isFinished) {
      return;
    }

    const interval = setInterval(() => {
      if (!drawNumber.isPending) {
        drawNumber.mutate(gameId);
      }
    }, 5000); // Draw every 5 seconds

    return () => clearInterval(interval);
  }, [autoDrawEnabled, isRunning, isCreator, isFinished, drawNumber, gameId]);

  // Stop auto-draw when game ends
  useEffect(() => {
    if (isFinished || isCancelled) {
      setAutoDrawEnabled(false);
    }
  }, [isFinished, isCancelled]);

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
            <p className="user-room-eyebrow">
              Sala #{gameId.slice(0, 8)}
              {isConnected && <span className="user-room-live">● LIVE</span>}
            </p>
            <h2>
              {gameState?.status === "OPEN" ? "Esperando jugadores..." :
                gameState?.status === "RUNNING" ? "¡Partida en curso!" :
                  gameState?.status === "FINISHED" ? "Partida finalizada" :
                    gameState?.status === "CANCELLED" ? "Partida cancelada" : "Cargando..."}
            </h2>
            <p className="user-room-subtitle">
              {gameState?.sold_tickets || 0} / {gameState?.min_tickets || 1} cartones vendidos
            </p>
          </div>
          <div className="user-room-actions">
            {canStart && (
              <button
                type="button"
                className="user-room-button"
                onClick={handleStartGame}
                disabled={startGame.isPending}
              >
                <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                {startGame.isPending ? "Iniciando..." : "Iniciar partida"}
              </button>
            )}
            {isRunning && isCreator && (
              <>
                <button
                  type="button"
                  className="user-room-button"
                  onClick={handleDrawNumber}
                  disabled={drawNumber.isPending || autoDrawEnabled}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">casino</span>
                  {drawNumber.isPending ? "Sorteando..." : "Sortear número"}
                </button>
                <button
                  type="button"
                  className={`user-room-button ${autoDrawEnabled ? 'user-room-button--active' : 'user-room-button--secondary'}`}
                  onClick={handleToggleAutoDraw}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {autoDrawEnabled ? 'pause' : 'play_arrow'}
                  </span>
                  {autoDrawEnabled ? "Pausar auto" : "Auto (5s)"}
                </button>
              </>
            )}
            {canCancel && isCreator && (
              <button
                type="button"
                className="user-room-button user-room-button--danger"
                onClick={handleCancelGame}
                disabled={cancelGame.isPending}
              >
                <span className="material-symbols-outlined" aria-hidden="true">cancel</span>
                {cancelGame.isPending ? "Cancelando..." : "Cancelar partida"}
              </button>
            )}
            <button type="button" className="user-room-button user-room-button--ghost" onClick={onLeave}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
              Salir
            </button>
          </div>
        </header>

        <section className="user-room-layout">
          <aside className="user-room-sidebar">
            <div className="user-room-heading">
              <p className="user-room-eyebrow">Información</p>
              <h3>Pozo en juego</h3>
              <p>{formatCredits(pot)}</p>
            </div>
            <div className="user-room-stats">
              <div className="user-room-stat">
                <p>Última bola</p>
                <strong>{lastDrawnNumber || (gameState?.drawn_numbers?.slice(-1)[0]) || "-"}</strong>
              </div>
              <div className={`user-room-stat ${gameState?.paid_diagonal ? 'user-room-stat--paid' : ''}`}>
                <p>Diagonal {gameState?.paid_diagonal ? '✓' : ''}</p>
                <strong>{formatCredits(diagonalPrize)}</strong>
              </div>
              <div className={`user-room-stat ${gameState?.paid_line ? 'user-room-stat--paid' : ''}`}>
                <p>Línea {gameState?.paid_line ? '✓' : ''}</p>
                <strong>{formatCredits(linePrize)}</strong>
              </div>
              <div className={`user-room-stat ${gameState?.paid_bingo ? 'user-room-stat--paid' : ''}`}>
                <p>Bingo {gameState?.paid_bingo ? '✓' : ''}</p>
                <strong>{formatCredits(bingoPrize)}</strong>
              </div>
            </div>
            <ul className="user-room-sidebar-list">
              <li>
                <p>Cartones vendidos</p>
                <strong>{gameState?.sold_tickets || 0}</strong>
              </li>
              <li>
                <p>Precio</p>
                <strong>{formatCredits(gameState?.price || 0)}</strong>
              </li>
              <li>
                <p>Números cantados</p>
                <strong>{gameState?.drawn_numbers?.length || 0} / 75</strong>
              </li>
            </ul>
          </aside>

          <section className="user-room-center">
            <h3 className="user-room-section-title">Tus cartones ({myTickets.length})</h3>
            {myTickets.length === 0 ? (
              <div className="user-room-empty">
                <span className="material-symbols-outlined">confirmation_number</span>
                <p>No tienes cartones en esta partida</p>
              </div>
            ) : (
              <div className="user-room-cardgrid">
                {myTickets.map((ticket, index) => (
                  <div key={ticket.id} className="user-room-card">
                    <div className="user-room-card-header">
                      <p>Cartón #{index + 1}</p>
                      <span>ID: {ticket.id.slice(0, 6).toUpperCase()}</span>
                    </div>
                    <div className="user-room-card-body">
                      <div className="user-room-card-header-row">
                        <span>B</span><span>I</span><span>N</span><span>G</span><span>O</span>
                      </div>
                      {ticket.numbers.map((row, rowIdx) => (
                        <div key={rowIdx} className="user-room-card-row">
                          {row.map((cell, cellIdx) => {
                            const isFree = cell === 0;
                            const isHit = drawnNumbers.has(cell) || isFree;
                            return (
                              <div
                                key={`${rowIdx}-${cellIdx}`}
                                className={[
                                  "user-room-card-cell",
                                  isFree ? "user-room-card-cell--free" : "",
                                  isHit && !isFree ? "user-room-card-cell--hit" : "",
                                ].filter(Boolean).join(" ")}
                              >
                                {isFree ? "LIBRE" : cell}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="user-room-called">
            <h3 className="user-room-section-title">Números cantados</h3>
            <div className="user-room-called-grid">
              {Object.entries(calledBoard).map(([letter, numbers]) => (
                <div key={letter} className="user-room-called-column">
                  <span>{letter}</span>
                  {numbers.map((number) => (
                    <span
                      key={`${letter}-${number}`}
                      className={drawnNumbers.has(number)
                        ? "user-room-called-number user-room-called-number--hit"
                        : "user-room-called-number"}
                    >
                      {number}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        </section>

        {isFinished && (
          <div className="user-room-toast user-room-toast--success">
            <p>🎉 ¡La partida ha terminado! Los premios han sido distribuidos.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserGameRoomView;
