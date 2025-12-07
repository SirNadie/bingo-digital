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
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-white/60 font-display animate-pulse">Cargando...</p>
      </div>
    </div>
  );
}

// Protected route component
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  if (!requireAdmin && user?.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Auth route - redirects if already logged in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={user?.is_admin ? "/admin" : "/"} replace />;
  }

  return <>{children}</>;
}

// Main app routes
function AppRoutes() {
  const { user, logout, refreshUser } = useAuth();
  const ADMIN_SAMPLE_TRANSACTIONS: any[] = [];  // Placeholder for real data

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <LoginView />
            </Suspense>
          </AuthRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              {user && <UserApp me={user} onLogout={logout} onSessionRefresh={refreshUser} />}
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<LoadingSpinner />}>
              {user && <AdminPanel me={user} onLogout={logout} transactions={ADMIN_SAMPLE_TRANSACTIONS} />}
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <ToastProvider />
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
