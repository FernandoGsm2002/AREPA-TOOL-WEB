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
    <form onSubmit={submit} className="space-y-4">
      {token ? <>
        <div className="space-y-1.5"><label className="text-sm font-medium" htmlFor="new-password">Nueva Contraseña</label><Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} autoComplete="new-password" required disabled={complete} /></div>
        <div className="space-y-1.5"><label className="text-sm font-medium" htmlFor="confirm-password">Confirmar Contraseña</label><Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" minLength={6} autoComplete="new-password" required disabled={complete} /></div>
      </> : <>
        <div className="space-y-1.5"><label className="text-sm font-medium" htmlFor="email">Email Registrado</label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoComplete="email" required disabled={complete} /></div>
        {!complete && <Turnstile onToken={setTurnstileToken} />}
      </>}
      {status && <p className={complete ? "text-emerald-400 whitespace-pre-line text-sm" : "text-destructive whitespace-pre-line text-sm"}>{status}</p>}
      {!complete && <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : token ? <Check className="size-4" /> : <Send className="size-4" />}
        {token ? "Guardar Cambios" : "Enviar Link"}
      </Button>}
    </form>
  );
}
