import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Flame, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { modalCopy, type Locale } from "@/lib/i18n";

const API_BASE = "https://api2.arepatool.com";
const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADcAui1yybCKOv5s";

export default function InstallerAccessModal({ locale = "es" }: { locale?: Locale }) {
  const copy = modalCopy[locale];
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<{ groupLink: string; downloadUrl: string } | null>(null);
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
      if (res.ok && data.groupLink && data.downloadUrl) {
        setAccess({ groupLink: data.groupLink, downloadUrl: data.downloadUrl });
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
          <div className="bg-primary/12 text-primary flex size-14 items-center justify-center rounded-full"><Flame className="size-7" /></div>
          <DialogTitle className="text-xl">{copy.downloadTitle}</DialogTitle>
        </DialogHeader>
        {access ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground text-sm leading-6">{copy.accessConfirmed}</p>
            <div className="border-primary/35 from-primary/16 via-primary/8 to-background relative overflow-hidden rounded-2xl border bg-linear-to-br px-5 py-4 shadow-lg shadow-primary/10">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/80 to-transparent" />
              <Flame className="text-primary mx-auto size-7 motion-safe:animate-pulse" />
              <p className="mt-2 font-semibold">{copy.newVersion}</p>
              <p className="text-muted-foreground mt-1 text-xs">ArepaToolV2_Setup_v2.2.4.exe</p>
            </div>
            <Button asChild className="w-full shadow-xl shadow-primary/30 motion-safe:animate-pulse"><a href={access.downloadUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4" />{copy.downloadNow}</a></Button>
            <Button asChild variant="secondary" className="w-full"><a href={access.groupLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />{copy.joinOfficial}</a></Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center text-sm leading-6">{copy.verifyDescription}</p>
            <Input placeholder={copy.identifierPlaceholder} autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            <div ref={turnstileRef} className="flex justify-center" />
            {status && <p className="text-destructive text-center text-sm">{status}</p>}
            <Button className="w-full" disabled={loading} onClick={submit}>{loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}{copy.verifyButton}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
