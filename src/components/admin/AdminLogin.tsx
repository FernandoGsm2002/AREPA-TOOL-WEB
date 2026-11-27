import "@/styles/auth.css";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyhole, Loader2, ShieldCheck } from "lucide-react";
import { saveSession } from "@/lib/web-session";
import { webLoginStep1, webLoginStep2 } from "@/lib/web-login-api";
import Turnstile from "@/components/auth/Turnstile";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [stage, setStage] = useState<"credentials" | "totp">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
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
    if (!turnstileToken) {
      setError("Completa la verificación de seguridad para continuar.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await webLoginStep1(username.trim(), password, turnstileToken);
      if (!data.success) {
        setError(data.error || "No se pudo iniciar sesión.");
        setTurnstileToken(null);
        setTurnstileKey((key) => key + 1);
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
      setTurnstileToken(null);
      setTurnstileKey((key) => key + 1);
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
    <main className="auth-shell">
      <div className="auth-shell__intro">
        <div className="auth-brand">
          <img src="/pngs/arepatool-logo-mark.webp" width="120" height="92" alt="" />
          <span>ArepaTool</span>
        </div>
        <div className="auth-shell__heading">
          <h1 id="admin-auth-title">Administración</h1>
          <p>Acceso restringido a personal autorizado</p>
        </div>
        <div className="auth-shell__art" aria-hidden="true">
          <img src="/pngs/arepatool-logo-mark.png" width="920" height="660" alt="" />
        </div>
      </div>
      <section className="auth-shell__content" aria-labelledby="admin-auth-title">
        <div className="auth-shell__form">

        {stage === "credentials" ? (
          <form onSubmit={submitCredentials} className="auth-form" aria-busy={loading}>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="admin-username">Usuario</label>
              <Input id="admin-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
            </div>
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="admin-password">Contraseña</label>
              <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <div className="auth-verification"><Turnstile key={turnstileKey} action="web_login" onToken={setTurnstileToken} /></div>
            {error && <p role="alert" className="auth-message">{error}</p>}
            <Button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
              Continuar
            </Button>
          </form>
        ) : (
          <form onSubmit={submitTotp} className="auth-form" aria-busy={loading}>
            <p id="admin-otp-instructions" className="auth-otp-instructions">
              Abre tu app de autenticación (Google Authenticator, Authy, etc.) e ingresa el código actual.
            </p>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              aria-labelledby="admin-otp-instructions"
              className="auth-otp"
            />
            {error && <p role="alert" className="auth-message">{error}</p>}
            <Button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Verificar
            </Button>
            <button
              type="button"
              onClick={() => { setStage("credentials"); setCode(""); setError(null); }}
              className="auth-back"
            >
              ← Volver
            </button>
          </form>
        )}
        </div>
      </section>
    </main>
  );
}
