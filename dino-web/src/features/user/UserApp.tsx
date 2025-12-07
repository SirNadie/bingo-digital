import { useEffect, useState } from "react";
import api from "../../api/http";
import toast from "react-hot-toast";
import { formatCredits } from "../../utils/format";
import {
  Me,
  UserTransaction,
  UserView,
} from "../../types";
import {
  USER_SAMPLE_TRANSACTIONS,
} from "./constants";
import UserDashboardView from "./views/UserDashboardView";
import UserStatsView from "./views/UserStatsView";
import UserJoinView from "./views/UserJoinView";
import UserCreateView from "./views/UserCreateView";
import UserGameRoomView from "./views/UserGameRoomView";

type UserAppProps = {
  me: Me;
  onLogout: () => void;
  onSessionRefresh: () => Promise<Me | null>;
};

export function UserApp({ me, onLogout, onSessionRefresh }: UserAppProps) {
  const [view, setView] = useState<UserView>("balance");
  const [transactions, setTransactions] = useState<UserTransaction[]>(USER_SAMPLE_TRANSACTIONS);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isTopupProcessing, setTopupProcessing] = useState(false);

  // Game room state
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  useEffect(() => {
    setTransactions(USER_SAMPLE_TRANSACTIONS);
    setView("balance");
    setMessage("");
    setError("");
    setActiveGameId(null);
  }, [me.id]);

  const pushTransaction = (txn: UserTransaction) => {
    setTransactions((prev) => [txn, ...prev].slice(0, 50));
  };

  const handleTopup = async (amount: number) => {
    setError("");
    setMessage("");
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    try {
      setTopupProcessing(true);
      const { data } = await api.post("/wallet/topup", { amount });
      toast.success(`Saldo actualizado: ${formatCredits(data.balance)}`);
      await onSessionRefresh();
      pushTransaction({
        id: `TXU-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "deposit",
        description: "Recarga manual de créditos",
        amount,
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al recargar");
    } finally {
      setTopupProcessing(false);
    }
  };

  const handleWithdrawal = () => {
    toast("La solicitud de retiro estará disponible próximamente.");
    pushTransaction({
      id: `TXU-${Date.now()}-WD`,
      timestamp: new Date().toISOString(),
      type: "withdraw",
      description: "Solicitud de retiro registrada",
      amount: -50,
    });
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

  // Game Room View
  if (view === "room" && activeGameId) {
    return (
      <UserGameRoomView
        me={me}
        gameId={activeGameId}
        onLeave={handleLeaveRoom}
        onLogout={onLogout}
        onNavigate={setView}
      />
    );
  }

  // Stats View
  if (view === "stats") {
    return <UserStatsView me={me} onLogout={onLogout} currentView={view} onNavigate={setView} />;
  }

  // Join Game View
  if (view === "join") {
    return (
      <UserJoinView
        me={me}
        onLogout={onLogout}
        currentView={view}
        onNavigate={setView}
        onEnterRoom={handleEnterRoom}
      />
    );
  }

  // Create Game View
  if (view === "create") {
    return <UserCreateView me={me} onLogout={onLogout} currentView={view} onNavigate={setView} />;
  }

  // Default: Dashboard View
  return (
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
    />
  );
}

export default UserApp;
