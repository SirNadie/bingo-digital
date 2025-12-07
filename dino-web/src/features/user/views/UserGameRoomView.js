import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { formatCredits } from "../../../utils/format";
import { useGameState, useMyTickets, useStartGame, useDrawNumber, useCancelGame } from "../../../hooks/useGames";
import { useWebSocket } from "../../../hooks/useWebSocket";
import UserHeader from "../components/UserHeader";
// Helper to get BINGO letter based on number
function getBingoLetter(num) {
    if (num >= 1 && num <= 15)
        return "B";
    if (num >= 16 && num <= 30)
        return "I";
    if (num >= 31 && num <= 45)
        return "N";
    if (num >= 46 && num <= 60)
        return "G";
    if (num >= 61 && num <= 75)
        return "O";
    return "";
}
export function UserGameRoomView({ me, gameId, onLeave, onLogout, onNavigate, }) {
    const [lastDrawnNumber, setLastDrawnNumber] = useState(null);
    const [autoDrawEnabled, setAutoDrawEnabled] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const audioRef = useRef(null);
    // Base64 encoded short beep sound (simple wav)
    const BEEP_SOUND = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2LkZWTh3lwY2Rxf46Wm5eLfnNpZXB/jpadl4x/dG1tcXyKl52blIZ6cW5xfIqWnZmSh3t0cXJ7iZSam5WJfXZzcnmGkZeXk4l9d3V0eIWPlJSTin54dnZ4g42SkZGKf3l3d3qCjJCQj4p/eXd4eYGKj4+Oi4B6eHl6gIiNjoyKgXt5eXqAh4uNjImBe3p6e4CGiouKiIF8enp7gIWIioiHgXx7e3yAhIeIh4aBfHt7fICEhoaFgn18fH2Ag4WFhIJ+fX1+gIOEhIOCfn5+f4GDg4OCgX9/f4CCgoKBgH9/gICBgYGAgICAgICAgICAgICAgA==";
    // Enable sound - must be called from user interaction
    const enableSound = useCallback(() => {
        try {
            // Create audio element and test play
            const audio = new Audio(BEEP_SOUND);
            audio.volume = 0.5;
            audioRef.current = audio;
            // Play immediately to unlock audio
            audio.play().then(() => {
                setSoundEnabled(true);
                toast.success('🔊 Sonido activado');
            }).catch((e) => {
                console.error('Could not play audio:', e);
                toast.error('No se pudo activar el sonido');
            });
        }
        catch (e) {
            console.error('Could not enable sound:', e);
            toast.error('No se pudo activar el sonido');
        }
    }, []);
    // Play bingo ball sound effect
    const playBallSound = useCallback(() => {
        if (!soundEnabled)
            return;
        try {
            const audio = new Audio(BEEP_SOUND);
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('Could not play sound:', e));
        }
        catch (e) {
            console.warn('Could not play sound:', e);
        }
    }, [soundEnabled]);
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
                    const payload = msg.payload;
                    setLastDrawnNumber(payload.number);
                    playBallSound();
                    // Show notification with letter + number
                    const letter = getBingoLetter(payload.number);
                    toast(`🎱 ${letter}-${payload.number}`, {
                        duration: 2000,
                        style: {
                            background: 'linear-gradient(135deg, #00f0ff, #7c3aed)',
                            color: '#0a0a0f',
                            fontWeight: 'bold',
                            fontSize: '18px'
                        }
                    });
                    refetchState();
                    break;
                case "winner":
                    const winnerPayload = msg.payload;
                    if (winnerPayload.user_id === me.id) {
                        toast.success(`¡Ganaste ${winnerPayload.category}! +${formatCredits(winnerPayload.amount)}`);
                    }
                    else {
                        toast(`¡${winnerPayload.username} ganó ${winnerPayload.category}!`);
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
            onOpen: () => {
            };
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
        const board = {
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
        drawNumber.mutate(gameId, {
            onSuccess: () => {
                // Play sound for creator too
                playBallSound();
            }
        });
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
    return (_jsxs("div", { className: "user-room-shell", children: [_jsx(UserHeader, { view: "room", balance: me.balance, onNavigate: onNavigate, onLogout: onLogout, roomMode: true, onRequestExit: onLeave }), _jsxs("main", { className: "user-room-main", children: [_jsxs("header", { className: "user-room-header", children: [_jsxs("div", { children: [_jsxs("p", { className: "user-room-eyebrow", children: ["Sala #", gameId.slice(0, 8), isConnected && _jsx("span", { className: "user-room-live", children: "\u25CF LIVE" })] }), _jsx("h2", { children: gameState?.status === "OPEN" ? "Esperando jugadores..." :
                                            gameState?.status === "RUNNING" ? "¡Partida en curso!" :
                                                gameState?.status === "FINISHED" ? "Partida finalizada" :
                                                    gameState?.status === "CANCELLED" ? "Partida cancelada" : "Cargando..." }), _jsxs("p", { className: "user-room-subtitle", children: [gameState?.sold_tickets || 0, " / ", gameState?.min_tickets || 1, " cartones vendidos"] })] }), _jsxs("div", { className: "user-room-actions", children: [_jsxs("button", { type: "button", className: `user-room-button ${soundEnabled ? 'user-room-button--active' : 'user-room-button--secondary'}`, onClick: enableSound, disabled: soundEnabled, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: soundEnabled ? 'volume_up' : 'volume_off' }), soundEnabled ? 'Sonido ON' : 'Activar sonido'] }), canStart && (_jsxs("button", { type: "button", className: "user-room-button", onClick: handleStartGame, disabled: startGame.isPending, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "play_arrow" }), startGame.isPending ? "Iniciando..." : "Iniciar partida"] })), isRunning && isCreator && (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", className: "user-room-button", onClick: handleDrawNumber, disabled: drawNumber.isPending || autoDrawEnabled, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "casino" }), drawNumber.isPending ? "Sorteando..." : "Sortear número"] }), _jsxs("button", { type: "button", className: `user-room-button ${autoDrawEnabled ? 'user-room-button--active' : 'user-room-button--secondary'}`, onClick: handleToggleAutoDraw, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: autoDrawEnabled ? 'pause' : 'play_arrow' }), autoDrawEnabled ? "Pausar auto" : "Auto (5s)"] })] })), canCancel && isCreator && (_jsxs("button", { type: "button", className: "user-room-button user-room-button--danger", onClick: handleCancelGame, disabled: cancelGame.isPending, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "cancel" }), cancelGame.isPending ? "Cancelando..." : "Cancelar partida"] })), _jsxs("button", { type: "button", className: "user-room-button user-room-button--ghost", onClick: onLeave, children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "close" }), "Salir"] })] })] }), _jsxs("section", { className: "user-room-layout", children: [_jsxs("aside", { className: "user-room-sidebar", children: [_jsxs("div", { className: "user-room-heading", children: [_jsx("p", { className: "user-room-eyebrow", children: "Informaci\u00F3n" }), _jsx("h3", { children: "Pozo en juego" }), _jsx("p", { children: formatCredits(pot) })] }), _jsxs("div", { className: "user-room-stats", children: [_jsxs("div", { className: "user-room-stat user-room-stat--last-ball", children: [_jsx("p", { children: "\u00DAltima bola" }), _jsx("strong", { children: lastDrawnNumber || gameState?.drawn_numbers?.slice(-1)[0] ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "user-room-ball-letter", children: getBingoLetter(lastDrawnNumber || gameState?.drawn_numbers?.slice(-1)[0] || 0) }), _jsx("span", { className: "user-room-ball-number", children: lastDrawnNumber || gameState?.drawn_numbers?.slice(-1)[0] })] })) : "-" })] }), _jsxs("div", { className: `user-room-stat ${gameState?.paid_diagonal ? 'user-room-stat--paid' : ''}`, children: [_jsxs("p", { children: ["Diagonal ", gameState?.paid_diagonal ? '✓' : ''] }), _jsx("strong", { children: formatCredits(diagonalPrize) })] }), _jsxs("div", { className: `user-room-stat ${gameState?.paid_line ? 'user-room-stat--paid' : ''}`, children: [_jsxs("p", { children: ["L\u00EDnea ", gameState?.paid_line ? '✓' : ''] }), _jsx("strong", { children: formatCredits(linePrize) })] }), _jsxs("div", { className: `user-room-stat ${gameState?.paid_bingo ? 'user-room-stat--paid' : ''}`, children: [_jsxs("p", { children: ["Bingo ", gameState?.paid_bingo ? '✓' : ''] }), _jsx("strong", { children: formatCredits(bingoPrize) })] })] }), _jsxs("ul", { className: "user-room-sidebar-list", children: [_jsxs("li", { children: [_jsx("p", { children: "Cartones vendidos" }), _jsx("strong", { children: gameState?.sold_tickets || 0 })] }), _jsxs("li", { children: [_jsx("p", { children: "Precio" }), _jsx("strong", { children: formatCredits(gameState?.price || 0) })] }), _jsxs("li", { children: [_jsx("p", { children: "N\u00FAmeros cantados" }), _jsxs("strong", { children: [gameState?.drawn_numbers?.length || 0, " / 75"] })] })] })] }), _jsxs("section", { className: "user-room-center", children: [_jsxs("h3", { className: "user-room-section-title", children: ["Tus cartones (", myTickets.length, ")"] }), myTickets.length === 0 ? (_jsxs("div", { className: "user-room-empty", children: [_jsx("span", { className: "material-symbols-outlined", children: "confirmation_number" }), _jsx("p", { children: "No tienes cartones en esta partida" })] })) : (_jsx("div", { className: "user-room-cardgrid", children: myTickets.map((ticket, index) => (_jsxs("div", { className: "user-room-card", children: [_jsxs("div", { className: "user-room-card-header", children: [_jsxs("p", { children: ["Cart\u00F3n #", index + 1] }), _jsxs("span", { children: ["ID: ", ticket.id.slice(0, 6).toUpperCase()] })] }), _jsxs("div", { className: "user-room-card-body", children: [_jsxs("div", { className: "user-room-card-header-row", children: [_jsx("span", { children: "B" }), _jsx("span", { children: "I" }), _jsx("span", { children: "N" }), _jsx("span", { children: "G" }), _jsx("span", { children: "O" })] }), ticket.numbers.map((row, rowIdx) => (_jsx("div", { className: "user-room-card-row", children: row.map((cell, cellIdx) => {
                                                                const isFree = cell === 0;
                                                                const isHit = drawnNumbers.has(cell) || isFree;
                                                                return (_jsx("div", { className: [
                                                                        "user-room-card-cell",
                                                                        isFree ? "user-room-card-cell--free" : "",
                                                                        isHit && !isFree ? "user-room-card-cell--hit" : "",
                                                                    ].filter(Boolean).join(" "), children: isFree ? "LIBRE" : cell }, `${rowIdx}-${cellIdx}`));
                                                            }) }, rowIdx)))] })] }, ticket.id))) }))] }), _jsxs("aside", { className: "user-room-called", children: [_jsx("h3", { className: "user-room-section-title", children: "N\u00FAmeros cantados" }), _jsx("div", { className: "user-room-called-grid", children: Object.entries(calledBoard).map(([letter, numbers]) => (_jsxs("div", { className: "user-room-called-column", children: [_jsx("span", { children: letter }), numbers.map((number) => (_jsx("span", { className: drawnNumbers.has(number)
                                                        ? "user-room-called-number user-room-called-number--hit"
                                                        : "user-room-called-number", children: number }, `${letter}-${number}`)))] }, letter))) })] })] }), isFinished && (_jsx("div", { className: "user-room-toast user-room-toast--success", children: _jsx("p", { children: "\uD83C\uDF89 \u00A1La partida ha terminado! Los premios han sido distribuidos." }) }))] })] }));
}
export default UserGameRoomView;
