import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Loader2, MessageCircle, ShieldCheck } from "lucide-react";

const API_BASE = "https://api2.arepatool.com";
const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADcAui1yybCKOv5s";

export default function InstallerAccessModal() {
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<{ downloadUrl: string; groupLink: string } | null>(null);
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
      if (res.ok && data.downloadUrl && data.groupLink) {
        setAccess({ downloadUrl: data.downloadUrl, groupLink: data.groupLink });
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
          <div className="bg-primary/12 text-primary flex size-14 items-center justify-center rounded-full"><Download className="size-7" /></div>
          <DialogTitle className="text-xl">Descargar ArepaTool</DialogTitle>
        </DialogHeader>
        {access ? (
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground text-sm">Tu licencia está activa. Únete al grupo privado para soporte y novedades.</p>
            <Button asChild variant="secondary" className="w-full"><a href={access.groupLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />Unirme al grupo privado</a></Button>
            <Button asChild className="w-full"><a href={access.downloadUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4" />Descargar instalador</a></Button>
            <p className="text-muted-foreground text-center text-xs">El enlace de descarga vence en 10 minutos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center text-sm">Verifica tu licencia para recibir la descarga y la invitación al grupo privado.</p>
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
