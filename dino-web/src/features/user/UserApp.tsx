import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import api, { fetchTransactions } from "../../api/http";
import toast from "react-hot-toast";
import { formatCredits } from "../../utils/format";
import {
  Me,
  UserTransaction,
  UserView,
} from "../../types";

// Lazy load user views
const UserDashboardView = lazy(() => import("./views/UserDashboardView"));
const UserStatsView = lazy(() => import("./views/UserStatsView"));
const UserJoinView = lazy(() => import("./views/UserJoinView"));
const UserCreateView = lazy(() => import("./views/UserCreateView"));
const UserGameRoomView = lazy(() => import("./views/UserGameRoomView"));

type UserAppProps = {
  me: Me;
  onLogout: () => void;
  onSessionRefresh: () => Promise<Me | null>;
};

function UserLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] opacity-50">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium">Cargando...</p>
    </div>
  );
}

export function UserApp({ me, onLogout, onSessionRefresh }: UserAppProps) {
  const [view, setView] = useState<UserView>("balance");
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isTopupProcessing, setTopupProcessing] = useState(false);
  const [isLoadingTransactions, setLoadingTransactions] = useState(true);

  // Game room state
  const [activeGameId, setActiveGameId] = useState<string | null>(null);



  // Re-implementing correctly:
  const fetchTxns = useCallback(async (offset: number) => {
    try {
      setLoadingTransactions(true);
      const data = await fetchTransactions({ limit: 20, offset });
      const mapped: UserTransaction[] = data.transactions.map((t: any) => ({
        id: t.id,
        timestamp: t.created_at,
        type: t.type as UserTransaction["type"],
        description: t.description,
        amount: t.amount,
        status: t.status as "pending" | "approved" | "rejected",
      }));

      if (offset === 0) {
        setTransactions(mapped);
      } else {
        setTransactions((prev) => [...prev, ...mapped]);
      }
      setTotalTransactions(data.total);
    } catch (err) {
      console.error("Error loading transactions:", err);
      // Only reset/clear if it was an initial load failing? 
      // Or just toast error. 
      if (offset === 0) setTransactions([]);
    } finally {
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

  const handleTopup = async (amount: number) => {
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
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al recargar");
    } finally {
      setTopupProcessing(false);
    }
  };

  const handleWithdrawal = async () => {
    const amount = Number(prompt("Monto a retirar:"));
    if (!amount || amount <= 0) return;

    try {
      await api.post("/wallet/withdraw", { amount });
      toast.success("Solicitud de retiro enviada. Fondos reservados.");
      await onSessionRefresh(); // Update visible balance (deducted)
      await fetchTxns(0); // Show pending txn
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al solicitar retiro");
    }
  };

  const handleEnterRoom = (gameId: string) => {
    setActiveGameId(gameId);
    setView("room");
  };

  const handleLeaveRoom = async () => {
    setActiveGameId(null);
    setView("join");
    // Refresh balance after leaving room
    await onSessionRefresh();
  };

  return (
    <Suspense fallback={<UserLoadingFallback />}>
      {/* Game Room View */}
      {view === "room" && activeGameId && (
        <UserGameRoomView
          me={me}
          gameId={activeGameId}
          onLeave={handleLeaveRoom}
          onLogout={onLogout}
          onNavigate={setView}
        />
      )}

      {/* Stats View */}
      {view === "stats" && (
        <UserStatsView me={me} onLogout={onLogout} currentView={view} onNavigate={setView} />
      )}

      {/* Join Game View */}
      {view === "join" && (
        <UserJoinView
          me={me}
          onLogout={onLogout}
          currentView={view}
          onNavigate={setView}
          onEnterRoom={handleEnterRoom}
        />
      )}

      {/* Create Game View */}
      {view === "create" && (
        <UserCreateView me={me} onLogout={onLogout} currentView={view} onNavigate={setView} />
      )}

      {/* Default: Dashboard View */}
      {(view === "balance" || (!["room", "stats", "join", "create"].includes(view))) && (
        <UserDashboardView
          me={me}
          onLogout={onLogout}
          onTopup={handleTopup}
          onWithdraw={handleWithdrawal}
          isProcessingTopup={isTopupProcessing}
          transactions={transactions}
          message={message}
          error={error}
          currentView={view}
          onNavigate={setView}
          onEnterRoom={handleEnterRoom}
          onLoadMore={handleLoadMore}
          hasMore={transactions.length < totalTransactions}
          isLoadingMore={isLoadingTransactions && transactions.length > 0}
        />
      )}
    </Suspense>
  );
}

export default UserApp;
