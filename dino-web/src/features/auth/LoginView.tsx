import { useState } from "react";
import api from "../../api/http";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alias, setAlias] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        await api.post("/auth/register", { email, password, alias });
        // Auto login after register
      }

      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      onLoginSuccess();
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(typeof err.response.data.detail === 'string' ? err.response.data.detail : "Error en la solicitud");
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Card variant="glass" className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <h1 className="text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              Dino Bingo
            </h1>
            <p className="text-white/60">
              {isRegistering ? "Únete a la nueva era del bingo" : "Bienvenido de nuevo, jugador"}
            </p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <Input
              placeholder="Tu Alias (p.ej. Rex)"
              icon={<User className="w-5 h-5" />}
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required={isRegistering}
            />
          )}

          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            icon={<Mail className="w-5 h-5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-5 h-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full group" isLoading={isLoading}>
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
            {!isLoading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setError(""); setIsRegistering(!isRegistering); }}
            className="text-sm text-white/50 hover:text-primary transition-colors hover:underline underline-offset-4"
          >
            {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿Nuevo aquí? Crea una cuenta gratis"}
          </button>
        </div>
      </Card>
    </div>
  );
}
