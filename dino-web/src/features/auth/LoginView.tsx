import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from "../../utils/validations";

export default function LoginView() {
  const { login, register: registerUser } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { alias: "", email: "", password: "" },
  });

  const handleSubmit = async (data: LoginFormData | RegisterFormData) => {
    setIsLoading(true);

    try {
      if (isRegistering) {
        const regData = data as RegisterFormData;
        await registerUser(regData.email, regData.password, regData.alias);
        toast.success("¡Cuenta creada exitosamente!");
      } else {
        const loginData = data as LoginFormData;
        await login(loginData.email, loginData.password);
        toast.success("¡Bienvenido de vuelta!");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const message = error.response?.data?.detail;
      toast.error(typeof message === 'string' ? message : "Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    loginForm.reset();
    registerForm.reset();
    setIsRegistering(!isRegistering);
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

        <form onSubmit={isRegistering ? registerForm.handleSubmit(handleSubmit) : loginForm.handleSubmit(handleSubmit)} className="space-y-5">
          {isRegistering && (
            <Input
              placeholder="Tu Alias (p.ej. Rex)"
              icon={<User className="w-5 h-5" />}
              error={registerForm.formState.errors.alias?.message}
              {...registerForm.register("alias")}
            />
          )}

          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            icon={<Mail className="w-5 h-5" />}
            error={isRegistering
              ? registerForm.formState.errors.email?.message
              : loginForm.formState.errors.email?.message}
            {...(isRegistering ? registerForm.register("email") : loginForm.register("email"))}
          />

          <Input
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-5 h-5" />}
            error={isRegistering
              ? registerForm.formState.errors.password?.message
              : loginForm.formState.errors.password?.message}
            {...(isRegistering ? registerForm.register("password") : loginForm.register("password"))}
          />

          <Button type="submit" variant="primary" className="w-full group" isLoading={isLoading}>
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
            {!isLoading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-white/50 hover:text-primary transition-colors hover:underline underline-offset-4"
          >
            {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿Nuevo aquí? Crea una cuenta gratis"}
          </button>
        </div>
      </Card>
    </div>
  );
}
