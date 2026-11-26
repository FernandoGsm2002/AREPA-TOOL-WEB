import { useState } from "react";
import { Check, Copy, ExternalLink, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { webApiFetch } from "@/lib/web-session";

type Ticket = {
  ticketId: string;
  code: string;
  expiresAt: number;
  downloadUrl: string;
};

export default function ArpKnxGuardAdmin() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");

  const generate = async () => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    setCopied("");
    try {
      const result = await webApiFetch("/api/arpknxguard/admin/tickets");
      if (!result?.success) throw new Error(result?.error || "No se pudo generar el código.");
      setTicket(result as Ticket);
    } catch (error) {
      setTicket(null);
      setNotice(error instanceof Error ? error.message : "No se pudo generar el código.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setNotice("No se pudo copiar. Revisa los permisos del navegador.");
    }
  };

  return <section className="max-w-2xl space-y-5">
    <div className="border-border/70 bg-card rounded-xl border p-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"><ShieldCheck className="size-5" /></div>
        <div><h2 className="font-display text-lg font-semibold">Código manual</h2>
          <p className="text-muted-foreground mt-1 text-sm">Genera un acceso para descargar y ejecutar ARPKNXGUARD.</p></div>
      </div>
      <Button className="mt-6" onClick={() => void generate()} disabled={busy}>
        {busy ? <LoaderCircle className="animate-spin" /> : <KeyRound />}
        {busy ? "Generando…" : ticket ? "Generar otro código" : "Generar código"}
      </Button>
      {notice && <p className="text-destructive mt-4 text-sm" role="alert">{notice}</p>}
    </div>

    {ticket && <div className="border-primary/30 bg-primary/5 rounded-xl border p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-primary text-xs font-bold tracking-[.14em] uppercase">Código de acceso</p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[.22em]">{ticket.code}</p></div>
        <Button size="sm" variant="outline" onClick={() => void copy(ticket.code, "code")}>
          {copied === "code" ? <Check /> : <Copy />}{copied === "code" ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <p className="text-muted-foreground mt-3 text-sm">Válido hasta {new Date(ticket.expiresAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}.</p>
      <div className="border-border/60 bg-background mt-5 flex items-center gap-2 rounded-lg border p-2 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-xs">{ticket.downloadUrl}</span>
        <Button size="icon-sm" variant="ghost" aria-label="Copiar enlace" onClick={() => void copy(ticket.downloadUrl, "url")}>
          {copied === "url" ? <Check /> : <Copy />}
        </Button>
        <Button size="icon-sm" variant="ghost" asChild><a href={ticket.downloadUrl} target="_blank" rel="noreferrer" aria-label="Abrir descarga"><ExternalLink /></a></Button>
      </div>
    </div>}
  </section>;
}
