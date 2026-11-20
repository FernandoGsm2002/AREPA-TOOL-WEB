import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Globe, LockKeyhole, Loader2, MapPin, MessageCircle, Send } from "lucide-react";
import { saveSession } from "@/lib/web-session";
import { webLoginStep1 } from "@/lib/web-login-api";
import Turnstile from "@/components/auth/Turnstile";
import TermsConsent from "@/components/auth/TermsConsent";
import { resellers } from "@/lib/site-data";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activationPending, setActivationPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Usuario y contraseña son obligatorios.");
      return;
    }
    if (!termsAccepted) {
      setError("Debes aceptar los términos y condiciones para continuar.");
      return;
    }
    if (!turnstileToken) {
      setError("Completa la verificación de seguridad para continuar.");
      return;
    }

    setLoading(true);
    setError(null);
    setActivationPending(false);

    try {
      const data = await webLoginStep1(username.trim(), password, turnstileToken);

      if (!data.success) {
        if (data.category === "license_pending" || data.error?.startsWith("Cuenta pendiente de aprobación")) {
          setActivationPending(true);
        } else {
          setError(data.error || "No se pudo iniciar sesión.");
        }
        setTurnstileToken(null);
        setTurnstileKey((key) => key + 1);
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
      setTurnstileToken(null);
      setTurnstileKey((key) => key + 1);
      setLoading(false);
    }
  }

  if (activationPending) {
    return (
      <section className="space-y-5" aria-live="polite">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <h2 className="text-xl font-bold">Activación de licencia pendiente</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Tu registro está completo y tu cuenta ya existe. Solo falta activar la licencia con un reseller oficial.
            Contacta a uno de los resellers oficiales para completar la activación.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Resellers oficiales</h3>
          <p className="text-muted-foreground mt-1 text-sm">Elige uno para consultar la activación.</p>
          <div className="mt-3 max-h-[45vh] space-y-3 overflow-y-auto pr-1">
            {resellers.map((reseller) => (
              <article key={reseller.name} className="bg-card rounded-xl border p-4">
                <h4 className="font-semibold">{reseller.name}</h4>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                  <MapPin className="size-3.5 shrink-0" />{reseller.region}
                </p>
                {reseller.phone && <p className="mt-2 text-xs">WhatsApp: {reseller.phone}</p>}
                <p className="text-muted-foreground mt-2 text-xs">{reseller.details}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {reseller.links.map((link) => {
                    const Icon = link.icon === "whatsapp" ? MessageCircle : link.icon === "telegram" ? Send : Globe;
                    const label = link.label || (link.icon === "whatsapp" ? "WhatsApp" : link.icon === "telegram" ? "Telegram" : "Sitio web");
                    return (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                         className="border-border hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors">
                        <Icon className="size-3.5" />{label}<ExternalLink className="size-3" />
                      </a>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full"
                onClick={() => setActivationPending(false)}>
          Volver al inicio de sesión
        </Button>
      </section>
    );
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

      <Turnstile key={turnstileKey} action="web_login" onToken={setTurnstileToken} />

      <TermsConsent
        accepted={termsAccepted}
        onAcceptedChange={setTermsAccepted}
        disabled={loading}
      />

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading || !termsAccepted}>
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
