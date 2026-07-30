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

// El tipo global de window.turnstile vive en components/auth/Turnstile.tsx
// (una sola declaración — TS no permite dos formas distintas del mismo global).

const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADcAui1yybCKOv5s";
const API_BASE = "https://api2.arepatool.com";

export function WhatsAppTrigger({ children }: { children: React.ReactNode }) {
  return <span onClick={() => window.dispatchEvent(new CustomEvent("open-wa-modal"))}>{children}</span>;
}

export default function WhatsAppModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ text: string; type: "error" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);

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

    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current) {
        turnstileRef.current.innerHTML = "";
        widgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [open]);

  async function submit() {
    if (!email.trim()) {
      setStatus({ text: "Por favor ingresa tu correo electrónico.", type: "error" });
      return;
    }

    const token = window.turnstile?.getResponse(widgetId.current);
    if (!token) {
      setStatus({ text: "Completa la verificación de seguridad primero.", type: "error" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE}/api/whatsapp-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), turnstileToken: token }),
      });
      const data = await res.json();

      if (res.ok && data.link) {
        setLink(data.link);
      } else {
        setStatus({ text: data.error || "No se pudo verificar. Intenta de nuevo.", type: "error" });
        window.turnstile?.reset(widgetId.current);
      }
    } catch {
      setStatus({ text: "Error de conexión. Intenta más tarde.", type: "error" });
      window.turnstile?.reset(widgetId.current);
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
          <DialogTitle className="text-xl">Acceso al Grupo Oficial</DialogTitle>
        </DialogHeader>

        {link ? (
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground text-sm">¡Tu correo tiene acceso! Únete al grupo oficial.</p>
            <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#1ea952]">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" />
                Unirme al Grupo WhatsApp
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center text-sm">
              Ingresa tu correo registrado para obtener el link del grupo de WhatsApp.
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
              Verificar Acceso
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
