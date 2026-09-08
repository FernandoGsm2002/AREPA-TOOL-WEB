import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Loader2, MessageCircle, ShieldCheck, UsersRound } from "lucide-react";

const API_BASE = "https://api2.arepatool.com";
const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADcAui1yybCKOv5s";

export default function InstallerAccessModal() {
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<{ groupLink: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-installer-access", openHandler);
    return () => window.removeEventListener("open-installer-access", openHandler);
  }, []);

  useEffect(() => {
    if (!open) return;
    setIdentifier("");
    setStatus(null);
    setAccess(null);
    setLoading(false);
    setTurnstileToken(null);

    let interval: number | undefined;
    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action: "installer_access",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
        "error-callback": () => setTurnstileToken(null),
      });
      if (interval) window.clearInterval(interval);
    };

    renderWidget();
    if (!widgetId.current) interval = window.setInterval(renderWidget, 200);
    return () => {
      if (interval) window.clearInterval(interval);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [open]);

  async function submit() {
    if (!identifier.trim()) {
      setStatus("Ingresa tu usuario o correo registrado.");
      return;
    }
    if (!turnstileToken) {
      setStatus("Completa la verificación de seguridad primero.");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/installer-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), turnstileToken }),
      });
      const data = await res.json();
      if (res.ok && data.groupLink) {
        setAccess({ groupLink: data.groupLink });
      } else {
        setStatus(data.error || "No se pudo verificar el acceso. Intenta de nuevo.");
        setTurnstileToken(null);
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
      }
    } catch {
      setStatus("Error de conexión. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="bg-primary/12 text-primary flex size-14 items-center justify-center rounded-full"><KeyRound className="size-7" /></div>
          <DialogTitle className="text-xl">Descargar ArepaTool</DialogTitle>
        </DialogHeader>
        {access ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm leading-6">Tu licencia está activa. La descarga se comparte exclusivamente en el grupo oficial.</p>
            <div className="border-primary/30 from-primary/12 to-background relative overflow-hidden rounded-2xl border bg-linear-to-br px-5 py-4 shadow-inner shadow-black/20">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent"></div>
              <span className="text-primary inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase"><KeyRound className="size-3.5" />Clave de descompresión</span>
              <p className="font-mono mt-2 text-3xl font-extrabold tracking-[0.22em]">6767</p>
            </div>
            <div className="border-border/60 bg-muted/35 flex items-start gap-3 rounded-xl border p-3.5 text-left">
              <UsersRound className="text-primary mt-0.5 size-4 shrink-0" />
              <p className="text-muted-foreground text-xs leading-5">Únete al grupo oficial para recibir la descarga, soporte y noticias exclusivas de nuevas funciones.</p>
            </div>
            <Button asChild className="w-full shadow-lg shadow-primary/20"><a href={access.groupLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />Unirme al grupo oficial</a></Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center text-sm leading-6">Verifica tu licencia para recibir la clave de descompresión y acceder al grupo oficial de descargas y noticias exclusivas.</p>
            <Input placeholder="Usuario o correo registrado" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            <div ref={turnstileRef} className="flex justify-center" />
            {status && <p className="text-destructive text-center text-sm">{status}</p>}
            <Button className="w-full" disabled={loading} onClick={submit}>{loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}Verificar y continuar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
