import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import api from "./api/http";
import AdminPanel from "./features/admin/AdminPanel";
import { ADMIN_SAMPLE_TRANSACTIONS } from "./features/admin/constants";
import UserDashboardView from "./features/user/views/UserDashboardView";
import UserStatsView from "./features/user/views/UserStatsView";
import UserJoinView from "./features/user/views/UserJoinView";
import UserCreateView from "./features/user/views/UserCreateView";
import UserGameRoomView from "./features/user/views/UserGameRoomView";
import { USER_SAMPLE_TRANSACTIONS } from "./features/user/constants";
import { formatCredits } from "./utils/format";
export default function App() {
    const [email, setEmail] = useState("admin@bingo.local");
    const [password, setPassword] = useState("admin123");
    const [me, setMe] = useState(null);
    const [msg, setMsg] = useState("");
    const [errors, setErrors] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isFetchingMe, setIsFetchingMe] = useState(false);
    const [isTopupProcessing, setIsTopupProcessing] = useState(false);
    const [userTransactions, setUserTransactions] = useState(USER_SAMPLE_TRANSACTIONS);
    const [userView, setUserView] = useState("balance");
    const [activeJoinGame, setActiveJoinGame] = useState(null);
    const [pendingTicketSelection, setPendingTicketSelection] = useState(false);
    const logged = Boolean(localStorage.getItem("token"));
    const isAdmin = me?.is_admin ?? false;
    const emailOk = useMemo(() => /.+@.+\..+/.test(email), [email]);
    const passwordOk = useMemo(() => password.length >= 6, [password]);
    const canLogin = emailOk && passwordOk;
    const handleLoginSubmit = (event) => {
        event.preventDefault();
        login();
    };
    async function login() {
        setErrors("");
        if (!canLogin) {
            setErrors("Email o contraseña inválidos (min 6 caracteres)");
            return;
        }
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.access_token);
            setMsg("Sesión iniciada");
            await fetchMe();
        }
        catch (error) {
            setMsg("");
            if (error && typeof error === "object" && "response" in error && error.response?.data) {
                setErrors(error.response.data);
            }
            else {
                setErrors("No se pudo iniciar sesión, inténtalo de nuevo");
            }
        }
    }
    async function fetchMe() {
        setIsFetchingMe(true);
        try {
            const { data } = await api.get("/auth/me");
            const profile = {
                id: data.id,
                email: data.email,
                balance: data.balance,
                alias: data.alias,
                is_admin: data.is_admin,
                is_verified: data.is_verified,
            };
            setMe(profile);
            if (profile.is_admin) {
                setUserView("balance");
            }
            return profile;
        }
        catch (error) {
            setMe(null);
            if (error && typeof error === "object" && "response" in error && error.response?.status === 401) {
                localStorage.removeItem("token");
                setMsg("La sesión expiró. Inicia sesión nuevamente.");
            }
            return null;
        }
        finally {
            setIsFetchingMe(false);
        }
    }
    async function topup(amount) {
        setErrors("");
        setMsg("");
        if (!logged || !Number.isFinite(amount) || amount <= 0) {
            setErrors("El monto debe ser mayor a 0");
            return;
        }
        try {
            setIsTopupProcessing(true);
            const { data } = await api.post(`/wallet/topup`, { amount });
            setMsg(`Saldo actualizado: ${formatCredits(data.balance)}`);
            await fetchMe();
            setUserTransactions((prev) => [
                {
                    id: `TXU-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: "deposit",
                    description: "Recarga manual de créditos",
                    amount,
                },
                ...prev,
            ].slice(0, 50));
        }
        catch (e) {
            setMsg("");
            setErrors(e?.response?.data || "Error al recargar");
        }
        finally {
            setIsTopupProcessing(false);
        }
    }
    function handleWithdrawal() {
        setMsg("La solicitud de retiro estará disponible próximamente.");
        setUserTransactions((prev) => [
            {
                id: `TXU-${Date.now()}-WD`,
                timestamp: new Date().toISOString(),
                type: "withdraw",
                description: "Solicitud de retiro registrada",
                amount: -50,
            },
            ...prev,
        ].slice(0, 50));
    }
    function logout() {
        localStorage.removeItem("token");
        setMe(null);
        setMsg("Sesión cerrada");
        setErrors("");
        setUserTransactions(USER_SAMPLE_TRANSACTIONS);
        setUserView("balance");
        setActiveJoinGame(null);
        setPendingTicketSelection(false);
    }
    const handleJoinGameRoom = (game) => {
        setActiveJoinGame(game);
        setPendingTicketSelection(true);
        setUserView("room");
    };
    const handleLeaveGameRoom = () => {
        setActiveJoinGame(null);
        setPendingTicketSelection(false);
        setUserView("join");
    };
    const handleConfirmTickets = (count) => {
        setPendingTicketSelection(false);
        setMsg(`Has comprado ${count} cartón${count > 1 ? "es" : ""} por ${formatCredits((activeJoinGame?.price ?? 0) * count)}.`);
    };
    useEffect(() => {
        if (!logged) {
            setMe(null);
            return;
        }
        fetchMe();
    }, [logged]);
    if (!logged) {
        return (_jsx("div", { className: "auth-shell", children: _jsx("div", { className: "auth-card", children: _jsxs("form", { className: "auth-form", onSubmit: handleLoginSubmit, children: [_jsxs("div", { className: "auth-card__header", children: [_jsx("p", { className: "auth-eyebrow", children: "Bienvenido de vuelta" }), _jsx("h1", { className: "auth-title", children: "Inicia sesi\u00F3n en Dino Bingo" }), _jsx("p", { className: "auth-subtitle", children: "Accede para crear partidas, comprar tickets y seguir tus premios." })] }), errors && _jsx("div", { className: "auth-alert auth-alert--error", children: errors }), msg && !errors && _jsx("div", { className: "auth-alert auth-alert--info", children: msg }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "email", className: "auth-label", children: "Correo electr\u00F3nico" }), _jsx("input", { id: "email", className: "auth-input", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "tu@correo.com", autoComplete: "email" })] }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "password", className: "auth-label", children: "Contrase\u00F1a" }), _jsxs("div", { className: "auth-password", children: [_jsx("input", { id: "password", className: "auth-input auth-input--password", type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "M\u00EDnimo 6 caracteres", autoComplete: "current-password" }), _jsx("button", { type: "button", className: "auth-toggle", onClick: () => setShowPassword((prev) => !prev), "aria-label": showPassword ? "Ocultar contraseña" : "Mostrar contraseña", children: showPassword ? "Ocultar" : "Mostrar" })] })] }), _jsx("button", { type: "submit", className: "auth-submit", disabled: !canLogin, children: "Iniciar sesi\u00F3n" }), _jsx("p", { className: "auth-hint", children: "\u00BFEres nuevo? Ponte en contacto con el equipo para crear tu cuenta." })] }) }) }));
    }
    if (logged && isFetchingMe && !me) {
        return (_jsx("div", { className: "auth-shell", children: _jsx("div", { className: "auth-card auth-card--loading", children: _jsx("p", { className: "auth-subtitle", children: "Cargando perfil..." }) }) }));
    }
    if (logged && me && me.is_admin) {
        return _jsx(AdminPanel, { me: me, onLogout: logout, transactions: ADMIN_SAMPLE_TRANSACTIONS });
    }
    if (logged && me && !me.is_admin) {
        if (userView === "room" && activeJoinGame) {
            return (_jsx(UserGameRoomView, { me: me, game: activeJoinGame, onLeave: handleLeaveGameRoom, onLogout: logout, onNavigate: (view) => setUserView(view), pendingTickets: pendingTicketSelection ? 1 : 0, onConfirmTickets: handleConfirmTickets }));
        }
        if (userView === "stats") {
            return _jsx(UserStatsView, { me: me, onLogout: logout, currentView: userView, onNavigate: (view) => setUserView(view) });
        }
        if (userView === "join") {
            return (_jsx(UserJoinView, { me: me, onLogout: logout, currentView: userView, onNavigate: (view) => setUserView(view), onJoinGame: handleJoinGameRoom }));
        }
        if (userView === "create") {
            return _jsx(UserCreateView, { me: me, onLogout: logout, currentView: userView, onNavigate: (view) => setUserView(view) });
        }
        return (_jsx(UserDashboardView, { me: me, onLogout: logout, onTopup: topup, onWithdraw: handleWithdrawal, isProcessingTopup: isTopupProcessing, transactions: userTransactions, message: msg, error: errors, currentView: userView, onNavigate: (view) => setUserView(view) }));
    }
    return (_jsx("div", { className: "auth-shell", children: _jsxs("div", { className: "auth-card auth-card--loading", children: [_jsx("p", { className: "auth-subtitle", children: "No pudimos cargar tu panel, intenta de nuevo." }), _jsx("button", { type: "button", className: "auth-submit", onClick: logout, children: "Cerrar sesi\u00F3n" })] }) }));
}
