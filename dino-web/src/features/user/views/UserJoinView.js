import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import toast from "react-hot-toast";
import { formatCredits } from "../../../utils/format";
import { useGames, useBuyTicket } from "../../../hooks/useGames";
import UserHeader from "../components/UserHeader";
export function UserJoinView({ me, onLogout, currentView, onNavigate, onEnterRoom }) {
    const [search, setSearch] = useState("");
    const [selectedGame, setSelectedGame] = useState(null);
    const [ticketCount, setTicketCount] = useState(1);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const { data, isLoading } = useGames("OPEN");
    const buyTicket = useBuyTicket();
    const games = data?.items || [];
    const filteredGames = games.filter(g => g.id.toLowerCase().includes(search.toLowerCase()) ||
        g.creator_id.toLowerCase().includes(search.toLowerCase()));
    const handleOpenModal = (game) => {
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
        if (!selectedGame)
            return;
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
            }
            catch (error) {
                const err = error;
                const message = err?.response?.data?.detail || "Error al comprar cartón";
                toast.error(message);
                setIsPurchasing(false);
                return;
            }
        }
        setIsPurchasing(false);
        handleCloseModal();
        onEnterRoom(selectedGame.id);
    };
    const calculatePot = (game) => {
        return game.sold_tickets * game.price * 0.9;
    };
    const canAfford = (game, count) => me.balance >= game.price * count;
    return (_jsxs("div", { className: "user-join-shell", children: [_jsx(UserHeader, { view: currentView, balance: me.balance, userEmail: me.email, onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "user-join-main", children: [_jsxs("section", { className: "user-join-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Partidas activas" }), _jsx("p", { children: "Salas disponibles para unirte ahora mismo." })] }), _jsxs("div", { className: "user-join-actions", children: [_jsxs("label", { className: "user-join-search", children: [_jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "search" }), _jsx("input", { type: "search", placeholder: "Buscar por ID o creador", value: search, onChange: (e) => setSearch(e.target.value) })] }), _jsx("button", { type: "button", className: "user-join-create", onClick: () => onNavigate("create"), children: _jsx("span", { className: "material-symbols-outlined", "aria-hidden": "true", children: "add" }) })] })] }), isLoading ? (_jsxs("div", { className: "user-join-loading", children: [_jsx("div", { className: "w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }), _jsx("p", { children: "Cargando partidas..." })] })) : filteredGames.length === 0 ? (_jsxs("div", { className: "user-join-empty", children: [_jsx("span", { className: "material-symbols-outlined", children: "sports_esports" }), _jsx("h3", { children: "No hay partidas disponibles" }), _jsx("p", { children: "\u00A1S\u00E9 el primero en crear una partida!" }), _jsx("button", { onClick: () => onNavigate("create"), className: "user-join-primary", children: "Crear partida" })] })) : (_jsx("section", { className: "user-join-grid", children: filteredGames.map((game) => (_jsxs("article", { className: "user-join-card", children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsxs("p", { className: "user-join-creator", children: ["Sala #", game.id.slice(0, 8)] }), _jsxs("h3", { children: ["Bingo de ", formatCredits(game.price)] }), _jsxs("p", { children: ["M\u00EDnimo ", game.min_tickets, " cartones"] })] }), _jsxs("div", { className: "user-join-pot", children: [_jsx("p", { children: "Pozo actual" }), _jsx("strong", { children: formatCredits(calculatePot(game)) })] })] }), _jsx("div", { className: "user-join-divider" }), _jsxs("ul", { children: [_jsxs("li", { children: [_jsx("span", { children: "Precio del cart\u00F3n" }), _jsx("span", { className: "user-join-tag", children: formatCredits(game.price) })] }), _jsxs("li", { children: [_jsx("span", { children: "Cartones vendidos" }), _jsx("strong", { children: game.sold_tickets })] }), _jsxs("li", { children: [_jsx("span", { children: "Premios" }), _jsxs("strong", { children: ["Diagonal ", formatCredits(calculatePot(game) * 0.2222), " \u00B7 L\u00EDnea ", formatCredits(calculatePot(game) * 0.2222), " \u00B7 Bingo ", formatCredits(calculatePot(game) * 0.5556)] })] }), _jsxs("li", { children: [_jsx("span", { children: "Estado" }), _jsx("span", { className: `user-join-status user-join-status--${game.status.toLowerCase()}`, children: game.status === "OPEN" ? "Abierta" : game.status })] })] }), _jsx("footer", { children: _jsx("button", { type: "button", className: "user-join-primary", onClick: () => handleOpenModal(game), disabled: !canAfford(game, 1) && game.creator_id !== me.id, children: game.creator_id === me.id ? "Entrar (Tu partida)" :
                                            !canAfford(game, 1) ? "Saldo insuficiente" :
                                                "Entrar a partida" }) })] }, game.id))) }))] }), selectedGame && (_jsx("div", { className: "user-room-modal", children: _jsxs("div", { className: "user-room-modal__panel", children: [_jsx("h4", { children: "Entrar a partida" }), _jsx("p", { children: "\u00BFCon cu\u00E1ntos cartones quieres entrar?" }), _jsxs("p", { className: "user-room-modal__price", children: ["Precio por cart\u00F3n: ", _jsx("strong", { children: formatCredits(selectedGame.price) })] }), _jsxs("div", { className: "user-room-modal__options", children: [_jsxs("button", { type: "button", onClick: () => setTicketCount(1), className: `user-room-modal__option ${ticketCount === 1 ? 'user-room-modal__option--active' : ''}`, disabled: !canAfford(selectedGame, 1), children: [_jsx("strong", { children: "1 cart\u00F3n" }), _jsx("span", { children: formatCredits(selectedGame.price) })] }), _jsxs("button", { type: "button", onClick: () => setTicketCount(2), className: `user-room-modal__option ${ticketCount === 2 ? 'user-room-modal__option--active' : ''}`, disabled: !canAfford(selectedGame, 2), children: [_jsx("strong", { children: "2 cartones" }), _jsx("span", { children: formatCredits(selectedGame.price * 2) })] })] }), _jsxs("p", { className: "user-room-modal__total", children: ["Total: ", _jsx("strong", { children: formatCredits(selectedGame.price * ticketCount) })] }), _jsxs("div", { className: "user-room-modal__actions", children: [_jsx("button", { type: "button", className: "user-room-modal__confirm", onClick: handleConfirmEntry, disabled: isPurchasing || !canAfford(selectedGame, ticketCount), children: isPurchasing ? "Comprando..." : `Comprar y entrar` }), _jsx("button", { type: "button", className: "user-room-modal__cancel", onClick: handleCloseModal, disabled: isPurchasing, children: "Cancelar" })] })] }) }))] }));
}
export default UserJoinView;
