import { useState } from "react";
import { Check, HardDriveUpload, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { webApiFetch } from "@/lib/web-session";

export type CoreRelease = {
  version: string;
  sha256: string;
  size_bytes: number | string;
  updated_at: string;
};

type Props = {
  releases: CoreRelease[];
  onPublished: (release: CoreRelease) => void;
};

const MAX_PACKAGE_BYTES = 512 * 1024 * 1024;

export default function CorePackageAdmin({ releases, onPublished }: Props) {
  const [version, setVersion] = useState("3.1.0");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const call = async (path: string, body: Record<string, unknown>) => {
    const result = await webApiFetch(`/api/admin/core-package/${path}`, body);
    if (!result?.success) throw new Error(result?.error || "No se pudo preparar el paquete principal.");
    return result;
  };

  const upload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (busy) return;
    const normalized = version.trim();
    if (!/^\d+\.\d+\.\d+$/.test(normalized)) { setMessage("Indica una versión como 3.1.0."); return; }
    if (!file || !/\.zip$/i.test(file.name) || file.size <= 0 || file.size > MAX_PACKAGE_BYTES) {
      setMessage("Selecciona el ZIP principal generado por Build-Installer.ps1 (máximo 512 MB)."); return;
    }
    if (file.name !== `ArepaToolV3_Core_${normalized}_win-x64.zip`) {
      setMessage("El nombre del ZIP no coincide con la versión indicada."); return;
    }
    setBusy(true); setProgress(0); setMessage("Calculando SHA-256…");
    try {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      const sha256 = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
      const signed = await call("upload-url", { version: normalized, sizeBytes: file.size });
      setMessage("Cargando paquete principal a R2…");
      await new Promise<void>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("PUT", signed.uploadUrl);
        request.setRequestHeader("Content-Type", signed.contentType);
        request.upload.onprogress = progressEvent => {
          if (progressEvent.lengthComputable)
            setProgress(Math.round(progressEvent.loaded / progressEvent.total * 100));
        };
        request.onload = () => request.status >= 200 && request.status < 300
          ? resolve() : reject(new Error(`R2 rechazó el paquete (${request.status}).`));
        request.onerror = () => reject(new Error("No se pudo conectar con R2."));
        request.send(file);
      });
      const saved = await call("save", {
        version: normalized, key: signed.key, sha256, sizeBytes: file.size,
      });
      onPublished({ ...saved.release, updated_at: new Date().toISOString() });
      setFile(null); setProgress(100);
      const input = form.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) input.value = "";
      setMessage(`Paquete principal ${normalized} publicado y verificado. Ya puedes probar el launcher.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo publicar el paquete principal.");
    } finally { setBusy(false); }
  };

  return <section className="border-primary/30 bg-card max-w-2xl space-y-5 rounded-xl border p-5">
    <div><p className="text-primary text-xs font-bold uppercase tracking-widest">Paso 1</p>
      <h2 className="font-display mt-1 text-lg font-semibold">Publicar paquete principal</h2>
      <p className="text-muted-foreground mt-1 text-sm">Sube el ZIP generado después de aplicar Xerin. La VPS lo entregará únicamente tras un login válido.</p></div>
    <form onSubmit={upload} className="space-y-4">
      <label className="block text-sm font-medium">Versión del paquete
        <Input className="mt-1" required value={version} onChange={event => setVersion(event.target.value)} placeholder="3.1.0" disabled={busy}/>
      </label>
      <label className="border-primary/30 bg-primary/5 block cursor-pointer rounded-xl border border-dashed p-5">
        <span className="flex items-center gap-2 text-sm font-semibold"><HardDriveUpload className="text-primary size-5"/>ZIP principal de Windows</span>
        <Input className="mt-3 cursor-pointer" type="file" accept=".zip,application/zip" disabled={busy}
          onChange={event => { setFile(event.target.files?.[0] || null); setProgress(0); }}/>
        {file && <span className="mt-2 block text-xs">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</span>}
      </label>
      {busy && <div className="space-y-2"><div className="bg-muted h-2 overflow-hidden rounded-full"><div className="bg-primary h-full" style={{ width: `${progress}%` }}/></div><p className="text-muted-foreground text-xs">{progress}%</p></div>}
      <Button disabled={busy || !file}>{busy ? <LoaderCircle className="animate-spin"/> : <Check/>}{busy ? "Publicando…" : "Publicar paquete principal"}</Button>
      {message && <p role="status" className="text-foreground text-sm">{message}</p>}
    </form>
    {releases.length > 0 && <div className="border-border/60 border-t pt-4"><h3 className="text-sm font-semibold">Paquetes disponibles</h3>
      <ul className="mt-2 space-y-1 text-xs">{releases.map(release => <li key={release.version} className="flex flex-wrap justify-between gap-2"><span className="font-mono">{release.version}</span><span className="text-muted-foreground">{(Number(release.size_bytes) / 1024 / 1024).toFixed(1)} MB · SHA-256 {release.sha256.slice(0, 12)}…</span></li>)}</ul>
    </div>}
  </section>;
}
