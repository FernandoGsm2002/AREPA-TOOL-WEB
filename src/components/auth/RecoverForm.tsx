import "@/styles/auth.css";
import { useEffect, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Turnstile from "./Turnstile";

const API_BASE = "https://api2.arepatool.com";

export default function RecoverForm() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (token) {
      if (password !== confirmPassword) return setStatus("Las contraseñas no coinciden");
      if (password.length < 6) return setStatus("Mínimo 6 caracteres");
    } else if (!turnstileToken) {
      return setStatus("Completa la verificación de seguridad.");
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}${token ? "/api/reset-password" : "/api/forgot-password"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token, password } : { email, turnstileToken }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatus(data.error || (token ? "No se pudo actualizar la contraseña" : "Error al enviar email"));
        return;
      }
      setComplete(true);
      setStatus(data.message || (token ? "¡Contraseña Actualizada!" : "Si el correo está registrado, recibirás un link de recuperación."));
    } catch {
      setStatus("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth-form" aria-busy={loading}>
      {token ? <>
        <div className="auth-field"><label className="auth-field-label" htmlFor="new-password">Nueva Contraseña</label><Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} autoComplete="new-password" required disabled={complete} /></div>
        <div className="auth-field"><label className="auth-field-label" htmlFor="confirm-password">Confirmar Contraseña</label><Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" minLength={6} autoComplete="new-password" required disabled={complete} /></div>
      </> : <>
        <div className="auth-field"><label className="auth-field-label" htmlFor="email">Email Registrado</label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoComplete="email" required disabled={complete} /></div>
        {!complete && <div className="auth-verification"><Turnstile onToken={setTurnstileToken} /></div>}
      </>}
      {status && <p role="status" className={complete ? "auth-message auth-message--success" : "auth-message"}>{status}</p>}
      {!complete && <Button type="submit" className="auth-submit" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : token ? <Check className="size-4" /> : <Send className="size-4" />}
        {token ? "Guardar Cambios" : "Enviar Link"}
      </Button>}
    </form>
  );
}
