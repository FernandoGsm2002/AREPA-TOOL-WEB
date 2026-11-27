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
      <div className="dashboard-view dashboard-dns">
        <h2 className="dashboard-heading">DNS creado</h2>
        <div className="dashboard-dns-result">
          <p className="text-muted-foreground text-xs">Configura esto en el dispositivo:</p>
          <div className="dashboard-hostname-row">
            <code className="dashboard-hostname font-mono">
              {result.dnsHostname}
            </code>
            <Button type="button" variant="secondary" size="icon" onClick={copyHostname} aria-label="Copiar">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <p className="dashboard-result-meta text-muted-foreground text-xs">
            {result.domainsAdded}/{result.domainsTotal} dominios bloqueados · Task ID: {result.taskId}
          </p>
        </div>

        <div className="dashboard-device-steps text-sm">
          <p className="font-medium">Pasos en el dispositivo:</p>
          <ol className="text-muted-foreground list-decimal">
            <li>Ajustes → Red e Internet → DNS Privado</li>
            <li>Selecciona "Nombre de host del proveedor"</li>
            <li>
              Ingresa: <strong className="dashboard-hostname-inline text-foreground">{result.dnsHostname}</strong>
            </li>
            <li>Guardar</li>
          </ol>
          <p className="text-muted-foreground mt-3 text-xs">No compartas este DNS — es único para cada dispositivo.</p>
        </div>

        <Button variant="secondary" className="dashboard-dns-action" onClick={createAnother}>
          Crear otro
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-view dashboard-dns">
      <h2 className="dashboard-heading">Crear DNS</h2>
      <p className="dashboard-description">Elige qué tipo de bloqueo MDM quieres remover.</p>

      <div className="dashboard-dns-profiles">
        {DNS_PROFILE_TYPES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setProfileType(p.key)}
            aria-pressed={profileType === p.key}
            className="dashboard-dns-profile"
          >
            <span className="dashboard-profile-marker" aria-hidden="true">
              {profileType === p.key && <Check className="size-3" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{p.name}</span>
              <span className="text-muted-foreground mt-0.5 block text-xs">{p.description}</span>
            </span>
          </button>
        ))}
      </div>

      {error && <p className="dashboard-error text-destructive text-sm" role="alert">{error}</p>}

      <div className="dashboard-dns-footer">
        <Button className="dashboard-dns-action" disabled={loading || !profileType} onClick={submit}>
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
    </div>
  );
}
