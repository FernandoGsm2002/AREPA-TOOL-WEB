import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { modalCopy, type Locale } from "@/lib/i18n";

const API_BASE = "https://api2.arepatool.com";
const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADcAui1yybCKOv5s";

export function WhatsAppTrigger({ children }: { children: React.ReactNode }) {
  return <span onClick={() => window.dispatchEvent(new CustomEvent("open-wa-modal"))}>{children}</span>;
}

export default function WhatsAppModal({ locale = "es" }: { locale?: Locale }) {
  const copy = modalCopy[locale];
  const whatsappJoin = locale === "es" ? "Unirme al Grupo WhatsApp" : locale === "en" ? "Join WhatsApp group" : "Entrar no grupo do WhatsApp";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ text: string; type: "error" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("open-wa-modal", openHandler);
    return () => window.removeEventListener("open-wa-modal", openHandler);
  }, []);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setStatus(null);
    setLink(null);
    setLoading(false);
    setTurnstileToken(null);

    let interval: number | undefined;
    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current || widgetId.current) return;

      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action: "whatsapp_group",
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
    if (!email.trim()) {
      setStatus({ text: "Por favor ingresa tu correo electrónico.", type: "error" });
      return;
    }

    if (!turnstileToken) {
      setStatus({ text: "Completa la verificación de seguridad primero.", type: "error" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE}/api/whatsapp-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), turnstileToken }),
      });
      const data = await res.json();

      if (res.ok && data.link) {
        setLink(data.link);
      } else {
        setStatus({ text: data.error || "No se pudo verificar. Intenta de nuevo.", type: "error" });
        setTurnstileToken(null);
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
      }
    } catch {
      setStatus({ text: "Error de conexión. Intenta más tarde.", type: "error" });
      setTurnstileToken(null);
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
            <WhatsAppIcon className="size-7" />
          </div>
          <DialogTitle className="text-xl">{copy.whatsappTitle}</DialogTitle>
        </DialogHeader>

        {link ? (
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground text-sm">{copy.whatsappSuccess}</p>
            <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#1ea952]">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" />
                {whatsappJoin}
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center text-sm">
              {copy.whatsappDescription}
            </p>
            <Input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <div ref={turnstileRef} className="flex justify-center" />
            {status && (
              <p className={status.type === "error" ? "text-destructive text-center text-sm" : "text-muted-foreground text-center text-sm"}>
                {status.text}
              </p>
            )}
            <Button className="w-full" disabled={loading} onClick={submit}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              {copy.whatsappButton}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
