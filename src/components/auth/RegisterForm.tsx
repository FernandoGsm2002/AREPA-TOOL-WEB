import { useState } from "react";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Turnstile from "./Turnstile";
import TermsConsent from "./TermsConsent";

const API_BASE = "https://api2.arepatool.com";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [terms, setTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return setStatus("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
    if (password !== confirmPassword) return setStatus("Las contraseñas no coinciden.");
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
      setStatus("¡Registro completado!\n\nTu cuenta ya está creada y tu licencia está pendiente de activación. Contacta a un reseller oficial para activar tu licencia.");
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
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} className="pr-12" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crea tu contraseña" minLength={8} maxLength={256} autoComplete="new-password" aria-describedby="password-requirements" required disabled={complete || loading} />
          <button type="button" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md focus-visible:ring-2" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword} disabled={complete}>
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p id="password-requirements" className="text-muted-foreground text-xs">Mínimo 8 caracteres, una mayúscula y un número.</p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="confirm-password">Repetir contraseña</label>
        <div className="relative">
          <Input id="confirm-password" type={showConfirmation ? "text" : "password"} className="pr-12" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña" minLength={8} maxLength={256} autoComplete="new-password" required disabled={complete || loading} />
          <button type="button" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md focus-visible:ring-2" onClick={() => setShowConfirmation(!showConfirmation)} aria-label={showConfirmation ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"} aria-pressed={showConfirmation} disabled={complete}>
            {showConfirmation ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <TermsConsent accepted={terms} onAcceptedChange={setTerms} disabled={complete || loading} />
      {!complete && <Turnstile onToken={setTurnstileToken} />}
      {status && <p role="status" className={complete ? "text-emerald-400 whitespace-pre-line text-sm" : "text-destructive whitespace-pre-line text-sm"}>{status}</p>}
      {!complete && <Button type="submit" className="w-full" disabled={loading || !terms}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        Crear Cuenta
      </Button>}
    </form>
  );
}
