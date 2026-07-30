import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyhole, Loader2 } from "lucide-react";
import { saveSession } from "@/lib/web-session";
import { webLoginStep1 } from "@/lib/web-login-api";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Usuario y contraseña son obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await webLoginStep1(username.trim(), password);

      if (!data.success) {
        setError(data.error || "No se pudo iniciar sesión.");
        setLoading(false);
        return;
      }

      // Esta pantalla es solo para técnicos. Las cuentas admin (con o sin
      // 2FA) inician sesión desde /admin, que tiene su propio flujo.
      if (data.status === "admin" || data.requiresTotp) {
        setError("Las cuentas de administrador inician sesión desde /admin.");
        setLoading(false);
        return;
      }

      saveSession({
        token: data.token!,
        user: {
          userId: data.userId!,
          username: data.username!,
          email: data.email!,
          status: data.status!,
          subscriptionEnd: data.subscriptionEnd ?? null,
          dhruOrderId: data.dhruOrderId ?? null,
        },
      });

      window.location.href = "/dashboard";
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="username">
          Usuario o email
        </label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="tu.usuario"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="password">
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
        Iniciar sesión
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        ¿No tienes cuenta?{" "}
        <a href="/register" className="text-primary font-medium hover:underline">
          Regístrate
        </a>
      </p>
      <p className="text-center text-sm">
        <a href="/recover" className="text-muted-foreground hover:text-foreground">
          ¿Olvidaste tu contraseña?
        </a>
      </p>
    </form>
  );
}
