import { useEffect, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { webApiFetch } from "@/lib/web-session";

type Settings = {
  enabled: boolean;
  description: string;
  installer_key: string;
  installer_size: number | null;
  extra_credit_cost: number | string;
};

export default function AppleServiceAdmin() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const call = async (path: string, body: Record<string, unknown> = {}) => {
    const result = await webApiFetch(`/api/admin/apple-service/${path}`, body);
    if (!result?.success) throw new Error(result?.error || "No se pudo completar la acción.");
    return result;
  };
  const load = async () => {
    try { setSettings((await call("get")).settings); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo cargar Apple."); }
  };
  useEffect(() => { void load(); }, []);
  const save = async () => {
    if (!settings || busy) return;
    setBusy(true); setMessage("");
    try { setSettings((await call("save", { enabled: settings.enabled, description: settings.description })).settings);
      setMessage("Servicio Apple actualizado."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo guardar."); }
    finally { setBusy(false); }
  };
  const upload = async () => {
    if (!file || busy) return;
    setBusy(true); setProgress(0); setMessage("");
    try {
      const prepared = await call("upload-url", { sizeBytes: file.size });
      await new Promise<void>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("PUT", prepared.uploadUrl);
        request.setRequestHeader("Content-Type", prepared.contentType);
        request.upload.onprogress = event => {
          if (event.lengthComputable) setProgress(Math.round(event.loaded * 100 / event.total));
        };
        request.onload = () => request.status >= 200 && request.status < 300
          ? resolve() : reject(new Error(`R2 respondió ${request.status}.`));
        request.onerror = () => reject(new Error("No se pudo subir el instalador."));
        request.send(file);
      });
      setSettings((await call("publish", { key: prepared.key })).settings);
      setFile(null); setProgress(100);
      setMessage("RUST A12 AIO publicado. Los clientes descargarán esta versión.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo publicar."); }
    finally { setBusy(false); }
  };
  if (!settings) return <p className="text-muted-foreground text-sm">{message || "Cargando servicio Apple…"}</p>;
  return <div className="max-w-3xl space-y-6">
    {message && <p className="border-border bg-muted/40 rounded-lg border p-3 text-sm">{message}</p>}
    <section className="border-border/70 bg-card space-y-5 rounded-xl border p-5">
      <div><h2 className="font-display text-lg font-semibold">Servicio Apple</h2>
        <p className="text-muted-foreground text-sm">Controla lo que aparece en ArepaTool V3 y el registro de SN.</p></div>
      <label className="flex items-center gap-3 text-sm font-medium">
        <input type="checkbox" checked={settings.enabled}
          onChange={event => setSettings({ ...settings, enabled: event.target.checked })} /> Servicio activo
      </label>
      <label className="grid gap-2 text-sm font-medium">Descripción y dispositivos soportados
        <textarea className="border-input bg-background min-h-32 rounded-md border p-3 text-sm"
          maxLength={3000} value={settings.description}
          onChange={event => setSettings({ ...settings, description: event.target.value })} />
      </label>
      <p className="text-muted-foreground text-sm">Un SN gratis por usuario cada 24 horas. Cada SN adicional cuesta {Number(settings.extra_credit_cost).toFixed(2)} crédito(s).</p>
      <Button disabled={busy || !settings.description.trim()} onClick={save}>{busy ? <LoaderCircle className="animate-spin" /> : null}Guardar cambios</Button>
    </section>
    <section className="border-border/70 bg-card space-y-4 rounded-xl border p-5">
      <div><h2 className="font-display text-lg font-semibold">RUST A12 AIO</h2>
        <p className="text-muted-foreground text-sm">Archivo publicado: {settings.installer_key} {settings.installer_size ? `· ${(settings.installer_size / 1048576).toFixed(1)} MB` : ""}</p></div>
      <input type="file" accept=".exe" disabled={busy} onChange={event => setFile(event.target.files?.[0] || null)} />
      {busy && progress > 0 && <progress className="w-full" value={progress} max={100} />}
      <Button disabled={!file || busy} onClick={upload}><Upload className="size-4" />{busy ? "Publicando…" : "Publicar instalador"}</Button>
    </section>
  </div>;
}
