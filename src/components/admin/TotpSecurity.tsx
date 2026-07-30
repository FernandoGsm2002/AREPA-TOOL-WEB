import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ShieldOff, ShieldAlert } from "lucide-react";
import { webApiFetch } from "@/lib/web-session";

type Phase = "loading" | "off" | "enrolling" | "on" | "disabling";

export default function TotpSecurity() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refreshStatus() {
    const data = await webApiFetch("/api/admin/totp/status", {});
    if (data?.success) setPhase(data.enabled ? "on" : "off");
  }

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function startEnroll() {
    setError(null);
    setBusy(true);
    const data = await webApiFetch("/api/admin/totp/setup", {});
    setBusy(false);
    if (!data?.success) {
      setError(data?.error || "No se pudo iniciar la configuración.");
      return;
    }
    setSecret(data.secret);
    const url = await QRCode.toDataURL(data.otpauthUri, { margin: 1, width: 220 });
    setQrDataUrl(url);
    setPhase("enrolling");
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setError(null);
    setBusy(true);
    const data = await webApiFetch("/api/admin/totp/confirm", { code: code.trim() });
    setBusy(false);
    if (!data?.success) {
      setError(data?.error || "Código incorrecto.");
      return;
    }
    setCode("");
    setQrDataUrl(null);
    setSecret(null);
    setPhase("on");
  }

  async function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setError(null);
    setBusy(true);
    const data = await webApiFetch("/api/admin/totp/disable", { code: code.trim() });
    setBusy(false);
    if (!data?.success) {
      setError(data?.error || "Código incorrecto.");
      return;
    }
    setCode("");
    setPhase("off");
  }

  if (phase === "loading") {
    return <div className="text-muted-foreground flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />Cargando…</div>;
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-2xl font-bold">Seguridad — Verificación en dos pasos</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Protege el acceso a esta cuenta administrativa con un código de tu app de autenticación (Google Authenticator, Authy, 1Password, etc.).
      </p>

      {phase === "on" && (
        <div className="border-border/60 bg-card mt-6 rounded-xl border p-5">
          <p className="inline-flex items-center gap-2 font-medium text-emerald-500">
            <ShieldCheck className="size-5" /> 2FA activo
          </p>
          <p className="text-muted-foreground mt-1 text-sm">Cada inicio de sesión pedirá un código además de tu contraseña.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setPhase("disabling"); setError(null); }}>
            <ShieldOff className="size-4" /> Desactivar 2FA
          </Button>
        </div>
      )}

      {phase === "off" && (
        <div className="border-border/60 bg-card mt-6 rounded-xl border p-5">
          <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <ShieldAlert className="size-4" /> 2FA desactivado — solo usuario y contraseña.
          </p>
          <Button className="mt-4" onClick={startEnroll} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Activar 2FA
          </Button>
        </div>
      )}

      {phase === "enrolling" && qrDataUrl && (
        <div className="border-border/60 bg-card mt-6 rounded-xl border p-5">
          <p className="text-sm font-medium">1. Escanea este código con tu app de autenticación</p>
          <img src={qrDataUrl} alt="Código QR para 2FA" className="border-border/60 mx-auto mt-3 rounded-lg border bg-white p-2" />
          <p className="text-muted-foreground mt-3 text-center text-xs">¿No puedes escanear? Ingresa esta clave manualmente:</p>
          <code className="bg-muted mt-1 block rounded-md px-3 py-2 text-center font-mono text-xs break-all">{secret}</code>

          <form onSubmit={confirmEnroll} className="mt-5 space-y-3">
            <p className="text-sm font-medium">2. Ingresa el código que muestra la app</p>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              className="text-center font-mono text-lg tracking-[0.5em]"
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                Confirmar y activar
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setPhase("off"); setQrDataUrl(null); setCode(""); }}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {phase === "disabling" && (
        <form onSubmit={confirmDisable} className="border-destructive/30 bg-destructive/5 mt-6 space-y-3 rounded-xl border p-5">
          <p className="text-sm font-medium">Confirma con tu código actual para desactivar el 2FA</p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            className="text-center font-mono text-lg tracking-[0.5em]"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldOff className="size-4" />}
              Desactivar
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setPhase("on"); setCode(""); setError(null); }}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
