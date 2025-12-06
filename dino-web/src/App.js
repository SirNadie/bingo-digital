import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/http";
import LoginView from "./features/auth/LoginView";
import UserApp from "./features/user/UserApp";
import AdminPanel from "./features/admin/AdminPanel";
import { ADMIN_SAMPLE_TRANSACTIONS } from "./features/admin/constants";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
export default function App() {
    const [me, setMe] = useState(null);
    const [isFetchingMe, setIsFetchingMe] = useState(true);
    const fetchMe = useCallback(async () => {
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
            return profile;
        }
        catch (error) {
            localStorage.removeItem("token");
            setMe(null);
            return null;
        }
        finally {
            setIsFetchingMe(false);
        }
    }, []);
    useEffect(() => {
        fetchMe();
    }, [fetchMe]);
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setMe(null);
        window.location.href = "/auth";
    }, []);
    if (isFetchingMe) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }), _jsx("p", { className: "text-white/60 font-display animate-pulse", children: "Iniciando sistema..." })] }) }));
    }
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/auth", element: !me ? _jsx(LoginView, { onLoginSuccess: fetchMe }) : _jsx(Navigate, { to: me.is_admin ? "/admin" : "/", replace: true }) }), _jsx(Route, { element: _jsx(ProtectedRoute, { user: me, allowedRoles: ['user'] }), children: _jsx(Route, { path: "/", element: me && _jsx(Layout, { user: me, onLogout: logout, children: _jsx(UserApp, { me: me, onLogout: logout, onSessionRefresh: fetchMe }) }) }) }), _jsx(Route, { element: _jsx(ProtectedRoute, { user: me, allowedRoles: ['admin'] }), children: _jsx(Route, { path: "/admin", element: me && _jsx(AdminPanel, { me: me, onLogout: logout, transactions: ADMIN_SAMPLE_TRANSACTIONS }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: me ? "/" : "/auth", replace: true }) })] }) }));
}
