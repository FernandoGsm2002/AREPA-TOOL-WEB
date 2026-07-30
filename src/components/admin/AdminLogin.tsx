import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyhole, Loader2, ShieldCheck } from "lucide-react";
import { saveSession } from "@/lib/web-session";
import { webLoginStep1, webLoginStep2 } from "@/lib/web-login-api";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [stage, setStage] = useState<"credentials" | "totp">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loginTicket, setLoginTicket] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function finish(data: { token?: string; userId?: string; username?: string; email?: string; status?: string; subscriptionEnd?: string | null; dhruOrderId?: string | null }) {
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
    onSuccess();
  }

  async function submitCredentials(e: React.FormEvent) {
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
      if (data.requiresTotp) {
        setLoginTicket(data.loginTicket!);
        setStage("totp");
        setLoading(false);
        return;
      }
      if (data.status !== "admin") {
        setError("Esta cuenta no tiene permisos administrativos.");
        setLoading(false);
        return;
      }
      finish(data);
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
  }

  async function submitTotp(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await webLoginStep2(loginTicket, code.trim());
      if (!data.success) {
        setError(data.error || "Código incorrecto.");
        setLoading(false);
        setCode("");
        return;
      }
      finish(data);
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="border-border/60 bg-card w-full max-w-sm rounded-2xl border p-8 shadow-xl">
        <div className="mb-6 text-center">
          <img src="/pngs/arepalanding.png" alt="ArepaTool" className="mx-auto h-12 w-auto" />
          <h1 className="font-display mt-4 text-xl font-bold">Administración</h1>
          <p className="text-muted-foreground mt-1 text-sm">Acceso restringido a personal autorizado</p>
        </div>

        {stage === "credentials" ? (
          <form onSubmit={submitCredentials} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="admin-username">Usuario</label>
              <Input id="admin-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="admin-password">Contraseña</label>
              <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
              Continuar
            </Button>
          </form>
        ) : (
          <form onSubmit={submitTotp} className="space-y-4">
            <p className="text-muted-foreground text-center text-sm">
              Abre tu app de autenticación (Google Authenticator, Authy, etc.) e ingresa el código actual.
            </p>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              className="text-center font-mono text-lg tracking-[0.5em]"
            />
            {error && <p className="text-destructive text-center text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Verificar
            </Button>
            <button
              type="button"
              onClick={() => { setStage("credentials"); setCode(""); setError(null); }}
              className="text-muted-foreground hover:text-foreground block w-full text-center text-xs"
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
