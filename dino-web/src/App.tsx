import { useCallback, useEffect, useState } from "react";
import api from "./api/http";
import AdminPanel from "./features/admin/AdminPanel";
import { ADMIN_SAMPLE_TRANSACTIONS } from "./features/admin/constants";
import LoginView from "./features/auth/LoginView";
import UserApp from "./features/user/UserApp";
import { Me } from "./types";

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isFetchingMe, setIsFetchingMe] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const fetchMe = useCallback(async (): Promise<Me | null> => {
    setIsFetchingMe(true);
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
    } catch (error: unknown) {
      setMe(null);
      if (error && typeof error === "object" && "response" in error && (error as any).response?.status === 401) {
        localStorage.removeItem("token");
        setAuthMessage("La sesión expiró. Inicia sesión nuevamente.");
      }
      return null;
    } finally {
      setIsFetchingMe(false);
    }
  }, []);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setAuthError("");
      setAuthMessage("");
      if (!/.+@.+\..+/.test(email) || password.length < 6) {
        setAuthError("Email o contraseña inválidos (min 6 caracteres)");
        return;
      }

      try {
        setIsAuthenticating(true);
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.access_token);
        setAuthMessage("Sesión iniciada");
        await fetchMe();
      } catch (error: unknown) {
        if (error && typeof error === "object" && "response" in error && (error as any).response?.data) {
          setAuthError((error as any).response.data as string);
        } else {
          setAuthError("No se pudo iniciar sesión, inténtalo de nuevo");
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
    [fetchMe],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setMe(null);
    setAuthMessage("");
    setAuthError("");
  }, []);

  const logged = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!logged) {
      setMe(null);
      return;
    }
    fetchMe();
  }, [logged, fetchMe]);

  useEffect(() => {
    if (me) {
      setAuthMessage("");
      setAuthError("");
    }
  }, [me]);

  if (!logged) {
    return <LoginView onSubmit={login} error={authError} message={authMessage} isSubmitting={isAuthenticating} />;
  }

  if (logged && isFetchingMe && !me) {
    return (
      <div className="auth-shell">
        <div className="auth-card auth-card--loading">
          <p className="auth-subtitle">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (logged && me && me.is_admin) {
    return <AdminPanel me={me} onLogout={logout} transactions={ADMIN_SAMPLE_TRANSACTIONS} />;
  }

  if (logged && me && !me.is_admin) {
    return <UserApp me={me} onLogout={logout} onSessionRefresh={fetchMe} />;
  }

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card--loading">
        <p className="auth-subtitle">No pudimos cargar tu panel, intenta de nuevo.</p>
        <button type="button" className="auth-submit" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
