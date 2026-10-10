import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Turnstile from "./Turnstile";
import TermsConsent from "./TermsConsent";

const API_BASE = "https://api2.arepatool.com";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!terms) return setStatus("Debes aceptar los términos");
    if (!turnstileToken) return setStatus("Completa la verificación de seguridad.");

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, turnstileToken }),
      });
      const data = await res.json();
      if (!data.success) {
        setStatus(data.error || "Error en registro");
        return;
      }
      setComplete(true);
      setStatus(data.message || "¡Registro exitoso!\n\nTu cuenta está lista para ser activada.\n¡Contáctate con un reseller!");
    } catch {
      setStatus("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="username">Usuario</label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Mínimo 3 caracteres" minLength={3} required disabled={complete} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" autoComplete="email" required disabled={complete} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} autoComplete="new-password" required disabled={complete} />
      </div>
      <TermsConsent accepted={terms} onAcceptedChange={setTerms} disabled={complete || loading} />
      {!complete && <Turnstile onToken={setTurnstileToken} />}
      {status && <p className={complete ? "text-emerald-400 whitespace-pre-line text-sm" : "text-destructive whitespace-pre-line text-sm"}>{status}</p>}
      {!complete && <Button type="submit" className="w-full" disabled={loading || !terms}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        Crear Cuenta
      </Button>}
    </form>
  );
}
