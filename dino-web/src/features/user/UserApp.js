import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import api, { fetchTransactions } from "../../api/http";
import toast from "react-hot-toast";
// Lazy load user views
const UserDashboardView = lazy(() => import("./views/UserDashboardView"));
const UserStatsView = lazy(() => import("./views/UserStatsView"));
const UserJoinView = lazy(() => import("./views/UserJoinView"));
const UserCreateView = lazy(() => import("./views/UserCreateView"));
const UserGameRoomView = lazy(() => import("./views/UserGameRoomView"));
function UserLoadingFallback() {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[50vh] opacity-50", children: [_jsx("div", { className: "w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" }), _jsx("p", { className: "text-sm font-medium", children: "Cargando..." })] }));
}
export function UserApp({ me, onLogout, onSessionRefresh }) {
    const [view, setView] = useState("balance");
    const [transactions, setTransactions] = useState([]);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isTopupProcessing, setTopupProcessing] = useState(false);
    const [isLoadingTransactions, setLoadingTransactions] = useState(true);
    // Game room state
    const [activeGameId, setActiveGameId] = useState(null);
    // Re-implementing correctly:
    const fetchTxns = useCallback(async (offset) => {
        try {
            setLoadingTransactions(true);
            const data = await fetchTransactions({ limit: 20, offset });
            const mapped = data.transactions.map((t) => ({
                id: t.id,
                timestamp: t.created_at,
                type: t.type,
                description: t.description,
                amount: t.amount,
                status: t.status,
            }));
            if (offset === 0) {
                setTransactions(mapped);
            }
            else {
                setTransactions((prev) => [...prev, ...mapped]);
            }
            setTotalTransactions(data.total);
        }
        catch (err) {
            console.error("Error loading transactions:", err);
            // Only reset/clear if it was an initial load failing? 
            // Or just toast error. 
            if (offset === 0)
                setTransactions([]);
        }
        finally {
            setLoadingTransactions(false);
        }
    }, []);
    const handleLoadMore = () => {
        fetchTxns(transactions.length);
    };
    useEffect(() => {
        fetchTxns(0);
        setView("balance");
        setMessage("");
        setError("");
        setActiveGameId(null);
    }, [me.id, fetchTxns]);
    const handleTopup = async (amount) => {
        setError("");
        setMessage("");
        if (!Number.isFinite(amount) || amount <= 0) {
            setError("El monto debe ser mayor a 0");
            return;
        }
        try {
            setTopupProcessing(true);
            await api.post("/wallet/topup", { amount });
            toast.success("Solicitud de recarga enviada. Esperando aprobación.");
            // Reload transactions to show pending
            await fetchTxns(0);
        }
        catch (err) {
            toast.error(err?.response?.data?.detail || "Error al recargar");
        }
        finally {
            setTopupProcessing(false);
        }
    };
    const handleWithdrawal = async () => {
        const amount = Number(prompt("Monto a retirar:"));
        if (!amount || amount <= 0)
            return;
        try {
            await api.post("/wallet/withdraw", { amount });
            toast.success("Solicitud de retiro enviada. Fondos reservados.");
            await onSessionRefresh(); // Update visible balance (deducted)
            await fetchTxns(0); // Show pending txn
        }
        catch (err) {
            toast.error(err?.response?.data?.detail || "Error al solicitar retiro");
        }
    };
    const handleEnterRoom = (gameId) => {
        setActiveGameId(gameId);
        setView("room");
    };
    const handleLeaveRoom = async () => {
        setActiveGameId(null);
        setView("join");
        // Refresh balance after leaving room
        await onSessionRefresh();
    };
    return (_jsxs(Suspense, { fallback: _jsx(UserLoadingFallback, {}), children: [view === "room" && activeGameId && (_jsx(UserGameRoomView, { me: me, gameId: activeGameId, onLeave: handleLeaveRoom, onLogout: onLogout, onNavigate: setView })), view === "stats" && (_jsx(UserStatsView, { me: me, onLogout: onLogout, currentView: view, onNavigate: setView })), view === "join" && (_jsx(UserJoinView, { me: me, onLogout: onLogout, currentView: view, onNavigate: setView, onEnterRoom: handleEnterRoom })), view === "create" && (_jsx(UserCreateView, { me: me, onLogout: onLogout, currentView: view, onNavigate: setView })), (view === "balance" || (!["room", "stats", "join", "create"].includes(view))) && (_jsx(UserDashboardView, { me: me, onLogout: onLogout, onTopup: handleTopup, onWithdraw: handleWithdrawal, isProcessingTopup: isTopupProcessing, transactions: transactions, message: message, error: error, currentView: view, onNavigate: setView, onEnterRoom: handleEnterRoom, onLoadMore: handleLoadMore, hasMore: transactions.length < totalTransactions, isLoadingMore: isLoadingTransactions && transactions.length > 0 }))] }));
}
export default UserApp;
