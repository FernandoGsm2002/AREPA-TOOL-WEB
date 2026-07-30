import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe2, Loader2, Copy, Check, ShieldCheck } from "lucide-react";
import { webApiFetch } from "@/lib/web-session";
import { DNS_PROFILE_TYPES } from "@/lib/dns-profiles";

interface Result {
  dnsHostname: string;
  taskId: string;
  domainsAdded: number;
  domainsTotal: number;
}

export default function CreateDns() {
  const [profileType, setProfileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit() {
    if (!profileType) {
      setError("Elige qué tipo de bloqueo vas a remover.");
      return;
    }
    setLoading(true);
    setError(null);

    const data = await webApiFetch("/api/web-dns-create", { profileType });

    if (!data) {
      window.location.href = "/login";
      return;
    }
    if (!data.success) {
      setError(data.error || "No se pudo crear el DNS.");
      setLoading(false);
      return;
    }

    setResult({
      dnsHostname: data.dnsHostname,
      taskId: data.taskId,
      domainsAdded: data.domainsAdded,
      domainsTotal: data.domainsTotal,
    });
    setLoading(false);
  }

  function copyHostname() {
    if (!result) return;
    navigator.clipboard.writeText(result.dnsHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function createAnother() {
    setResult(null);
    setProfileType(null);
    setError(null);
  }

  if (result) {
    return (
      <div className="max-w-lg">
        <h2 className="font-display text-2xl font-bold">DNS creado</h2>
        <div className="border-border/60 bg-muted/40 mt-6 rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Configura esto en el dispositivo:</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="bg-background border-border/60 flex-1 rounded-md border px-3 py-2 font-mono text-sm">
              {result.dnsHostname}
            </code>
            <Button type="button" variant="secondary" size="icon" onClick={copyHostname} aria-label="Copiar">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            {result.domainsAdded}/{result.domainsTotal} dominios bloqueados · Task ID: {result.taskId}
          </p>
        </div>

        <div className="border-border/60 mt-4 rounded-lg border p-4 text-sm">
          <p className="font-medium">Pasos en el dispositivo:</p>
          <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-4">
            <li>Ajustes → Red e Internet → DNS Privado</li>
            <li>Selecciona "Nombre de host del proveedor"</li>
            <li>
              Ingresa: <strong className="text-foreground">{result.dnsHostname}</strong>
            </li>
            <li>Guardar</li>
          </ol>
          <p className="text-muted-foreground mt-3 text-xs">No compartas este DNS — es único para cada dispositivo.</p>
        </div>

        <Button variant="secondary" className="mt-4" onClick={createAnother}>
          Crear otro
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-bold">Crear DNS</h2>
      <p className="text-muted-foreground mt-1 text-sm">Elige qué tipo de bloqueo MDM quieres remover.</p>

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {DNS_PROFILE_TYPES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setProfileType(p.key)}
            className={`rounded-lg border p-3.5 text-left transition-colors ${
              profileType === p.key
                ? "border-primary bg-primary/10"
                : "border-border/60 hover:border-primary/50 hover:bg-accent"
            }`}
          >
            <p className="text-sm font-medium">{p.name}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{p.description}</p>
          </button>
        ))}
      </div>

      {error && <p className="text-destructive mt-4 text-sm">{error}</p>}

      <Button className="mt-6" disabled={loading || !profileType} onClick={submit}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Globe2 className="size-4" />}
        Crear DNS
      </Button>

      {!profileType && (
        <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
          <ShieldCheck className="size-3.5" />
          Selecciona un tipo arriba para continuar
        </p>
      )}
    </div>
  );
}
