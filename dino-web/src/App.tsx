import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import api from "./api/http";
import LoginView from "./features/auth/LoginView";
import UserApp from "./features/user/UserApp";
import AdminPanel from "./features/admin/AdminPanel";
import { ADMIN_SAMPLE_TRANSACTIONS } from "./features/admin/constants";
import { Me } from "./types";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [isFetchingMe, setIsFetchingMe] = useState(true);

  const fetchMe = useCallback(async (): Promise<Me | null> => {
    try {
      const { data } = await api.get("/auth/me");
      const profile: Me = {
        id: data.id,
        email: data.email,
        balance: data.balance,
        alias: data.alias,
        is_admin: data.is_admin,
        is_verified: data.is_verified,
      };
      setMe(profile);
      return profile;
    } catch (error) {
      localStorage.removeItem("token");
      setMe(null);
      return null;
    } finally {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/60 font-display animate-pulse">Iniciando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/auth" element={
          !me ? <LoginView onLoginSuccess={fetchMe} /> : <Navigate to={me.is_admin ? "/admin" : "/"} replace />
        } />

        {/* User Routes */}
        <Route element={<ProtectedRoute user={me} allowedRoles={['user']} />}>
          <Route path="/" element={
            me && <Layout user={me} onLogout={logout}>
              <UserApp me={me} onLogout={logout} onSessionRefresh={fetchMe} />
            </Layout>
          } />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute user={me} allowedRoles={['admin']} />}>
          <Route path="/admin" element={
            me && <AdminPanel me={me} onLogout={logout} transactions={ADMIN_SAMPLE_TRANSACTIONS} />
          } />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={me ? "/" : "/auth"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
