import "@/styles/auth.css";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock3, ExternalLink, Globe, LockKeyhole, Loader2, MapPin, MessageCircle, Send } from "lucide-react";
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
      <section className="auth-pending" aria-live="polite">
        <div className="auth-pending__notice">
          <Clock3 aria-hidden="true" />
          <h2>Activación de licencia pendiente</h2>
          <p>
            Tu registro está completo y tu cuenta ya existe. Solo falta activar la licencia con un reseller oficial.
            Contacta a uno de los resellers oficiales para completar la activación.
          </p>
        </div>

        <div>
          <h3 id="auth-resellers-title">Resellers oficiales</h3>
          <p className="auth-pending__description">Elige uno para consultar la activación.</p>
          <div className="auth-resellers" role="region" aria-labelledby="auth-resellers-title" tabIndex={0}>
            {resellers.map((reseller) => (
              <article key={reseller.name} className="auth-reseller">
                <h4>{reseller.name}</h4>
                <p className="auth-reseller__region">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />{reseller.region}
                </p>
                {reseller.phone && <p className="auth-reseller__phone">WhatsApp: {reseller.phone}</p>}
                <p className="auth-reseller__details">{reseller.details}</p>
                <div className="auth-reseller__links">
                  {reseller.links.map((link) => {
                    const Icon = link.icon === "whatsapp" ? MessageCircle : link.icon === "telegram" ? Send : Globe;
                    const label = link.label || (link.icon === "whatsapp" ? "WhatsApp" : link.icon === "telegram" ? "Telegram" : "Sitio web");
                    return (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                         className="auth-reseller__link">
                        <Icon className="size-3.5" aria-hidden="true" />{label}<ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>

        <Button type="button" variant="outline" className="auth-submit"
                onClick={() => setActivationPending(false)}>
          Volver al inicio de sesión
        </Button>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="auth-form" aria-busy={loading}>
      <div className="auth-field">
        <label className="auth-field-label" htmlFor="username">
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
      <div className="auth-field">
        <label className="auth-field-label" htmlFor="password">
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

      <div className="auth-verification"><Turnstile key={turnstileKey} action="web_login" onToken={setTurnstileToken} /></div>

      <TermsConsent
        accepted={termsAccepted}
        onAcceptedChange={setTermsAccepted}
        disabled={loading}
      />

      {error && <p role="alert" className="auth-message">{error}</p>}

      <Button type="submit" className="auth-submit" disabled={loading || !termsAccepted}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
        Iniciar sesión
      </Button>

      <div className="auth-links">
        <p>
          ¿No tienes cuenta?{" "}
          <a href="/register">
            Regístrate
          </a>
        </p>
        <p>
          <a href="/recover">
            ¿Olvidaste tu contraseña?
          </a>
        </p>
      </div>
    </form>
  );
}
