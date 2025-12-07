import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastProvider";
// Lazy loaded components
const LoginView = lazy(() => import("./features/auth/LoginView"));
const UserApp = lazy(() => import("./features/user/UserApp"));
const AdminPanel = lazy(() => import("./features/admin/AdminPanel"));
// React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});
// Loading spinner component
function LoadingSpinner() {
    return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }), _jsx("p", { className: "text-white/60 font-display animate-pulse", children: "Cargando..." })] }) }));
}
// Protected route component
function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/auth", replace: true });
    }
    if (requireAdmin && !user?.is_admin) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    if (!requireAdmin && user?.is_admin) {
        return _jsx(Navigate, { to: "/admin", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
// Auth route - redirects if already logged in
function AuthRoute({ children }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (isAuthenticated) {
        return _jsx(Navigate, { to: user?.is_admin ? "/admin" : "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
// Main app routes
function AppRoutes() {
    const { user, logout, refreshUser } = useAuth();
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/auth", element: _jsx(AuthRoute, { children: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(LoginView, {}) }) }) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: user && _jsx(UserApp, { me: user, onLogout: logout, onSessionRefresh: refreshUser }) }) }) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { requireAdmin: true, children: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: user && _jsx(AdminPanel, { me: user, onLogout: logout }) }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/auth", replace: true }) })] }));
}
export default function App() {
    return (_jsx(ErrorBoundary, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsxs(BrowserRouter, { children: [_jsx(ToastProvider, {}), _jsx(AppRoutes, {})] }) }) }) }));
}
