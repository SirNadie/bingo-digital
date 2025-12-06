import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import api from "../../api/http";
import { formatCredits } from "../../utils/format";
import { USER_SAMPLE_TRANSACTIONS, } from "./constants";
import UserDashboardView from "./views/UserDashboardView";
import UserStatsView from "./views/UserStatsView";
import UserJoinView from "./views/UserJoinView";
import UserCreateView from "./views/UserCreateView";
import UserGameRoomView from "./views/UserGameRoomView";
export function UserApp({ me, onLogout, onSessionRefresh }) {
    const [view, setView] = useState("balance");
    const [transactions, setTransactions] = useState(USER_SAMPLE_TRANSACTIONS);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isTopupProcessing, setTopupProcessing] = useState(false);
    const [activeJoinGame, setActiveJoinGame] = useState(null);
    const [pendingTicketSelection, setPendingTicketSelection] = useState(false);
    useEffect(() => {
        setTransactions(USER_SAMPLE_TRANSACTIONS);
        setView("balance");
        setMessage("");
        setError("");
        setActiveJoinGame(null);
        setPendingTicketSelection(false);
    }, [me.id]);
    const pushTransaction = (txn) => {
        setTransactions((prev) => [txn, ...prev].slice(0, 50));
    };
    const handleTopup = async (amount) => {
        setError("");
        setMessage("");
        if (!Number.isFinite(amount) || amount <= 0) {
            setError("El monto debe ser mayor a 0");
            return;
        }
        try {
            setTopupProcessing(true);
            const { data } = await api.post("/wallet/topup", { amount });
            setMessage(`Saldo actualizado: ${formatCredits(data.balance)}`);
            await onSessionRefresh();
            pushTransaction({
                id: `TXU-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: "deposit",
                description: "Recarga manual de créditos",
                amount,
            });
        }
        catch (err) {
            setMessage("");
            setError(err?.response?.data || "Error al recargar");
        }
        finally {
            setTopupProcessing(false);
        }
    };
    const handleWithdrawal = () => {
        setMessage("La solicitud de retiro estará disponible próximamente.");
        pushTransaction({
            id: `TXU-${Date.now()}-WD`,
            timestamp: new Date().toISOString(),
            type: "withdraw",
            description: "Solicitud de retiro registrada",
            amount: -50,
        });
    };
    const handleJoinGame = (game) => {
        setActiveJoinGame(game);
        setPendingTicketSelection(true);
        setView("room");
    };
    const handleLeaveGame = () => {
        setActiveJoinGame(null);
        setPendingTicketSelection(false);
        setView("join");
    };
    const handleConfirmTickets = (count) => {
        setPendingTicketSelection(false);
        setMessage(`Has comprado ${count} cartón${count > 1 ? "es" : ""} por ${formatCredits((activeJoinGame?.price ?? 0) * count)}.`);
    };
    if (view === "room" && activeJoinGame) {
        return (_jsx(UserGameRoomView, { me: me, game: activeJoinGame, onLeave: handleLeaveGame, onLogout: onLogout, onNavigate: setView, pendingTickets: pendingTicketSelection ? 1 : 0, onConfirmTickets: handleConfirmTickets }));
    }
    if (view === "stats") {
        return _jsx(UserStatsView, { me: me, onLogout: onLogout, currentView: view, onNavigate: setView });
    }
    if (view === "join") {
        return (_jsx(UserJoinView, { me: me, onLogout: onLogout, currentView: view, onNavigate: setView, onJoinGame: handleJoinGame }));
    }
    if (view === "create") {
        return _jsx(UserCreateView, { me: me, onLogout: onLogout, currentView: view, onNavigate: setView });
    }
    return (_jsx(UserDashboardView, { me: me, onLogout: onLogout, onTopup: handleTopup, onWithdraw: handleWithdrawal, isProcessingTopup: isTopupProcessing, transactions: transactions, message: message, error: error, currentView: view, onNavigate: setView }));
}
export default UserApp;
