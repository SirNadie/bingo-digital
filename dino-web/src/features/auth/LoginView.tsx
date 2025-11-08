import { FormEvent, useMemo, useState } from "react";

type LoginCredentials = {
  email: string;
  password: string;
};

type LoginViewProps = {
  onSubmit: (credentials: LoginCredentials) => void;
  error?: string;
  message?: string;
  isSubmitting?: boolean;
};

const DEFAULT_EMAIL = "admin@bingo.local";
const DEFAULT_PASSWORD = "admin123";

export function LoginView({ onSubmit, error, message, isSubmitting }: LoginViewProps) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const canSubmit = useMemo(() => /.+@.+\..+/.test(email) && password.length >= 6, [email, password]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setLocalError("Email o contraseña inválidos (min 6 caracteres).");
      return;
    }
    setLocalError("");
    onSubmit({ email, password });
  };

  const feedback = error || localError || "";
  const successMessage = !feedback ? message : "";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-card__header">
            <p className="auth-eyebrow">Bienvenido de vuelta</p>
            <h1 className="auth-title">Inicia sesión en Dino Bingo</h1>
            <p className="auth-subtitle">Accede para crear partidas, comprar tickets y seguir tus premios.</p>
          </div>
          {feedback && <div className="auth-alert auth-alert--error">{feedback}</div>}
          {successMessage && <div className="auth-alert auth-alert--info">{successMessage}</div>}
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Correo electrónico
            </label>
            <input
              id="email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Contraseña
            </label>
            <div className="auth-password">
              <input
                id="password"
                className="auth-input auth-input--password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <button type="submit" className="auth-submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
          <p className="auth-hint">¿Eres nuevo? Ponte en contacto con el equipo para crear tu cuenta.</p>
        </form>
      </div>
    </div>
  );
}

export default LoginView;
