import { useEffect, useMemo, useRef, useState } from "react";
import { HardDriveUpload, Loader2, RefreshCw, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { webApiFetch } from "@/lib/web-session";

type RootFile = {
  id: string; model: string; binary_version: string; android_version: string; build: string;
  region?: string | null; magisk_version: string; root_file: string; size_bytes?: number | string | null;
  original_filename: string; is_active: boolean;
};

const formatSize = (value?: number | string | null) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

const parseName = (filename: string) => {
  const match = filename.match(/^Root_(?<model>[^_]+)_Bin[._-]?(?<binary>[^_]+)_OS(?<android>[^_]+)_(?<details>.+?)_Magisk_(?<magisk>[0-9]+(?:\.[0-9]+)+)\.tar(?:\.md5)?$/i);
  if (!match?.groups) return null;
  const details = match.groups.details.split("_").filter(Boolean);
  return {
    model: match.groups.model, binary: match.groups.binary, android: match.groups.android,
    build: details.shift() || "", region: details.join("_") || "—", magisk: match.groups.magisk,
  };
};

export default function SamsungRootCatalog() {
  const [roots, setRoots] = useState<RootFile[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const cancelRequested = useRef(false);

  const call = async (path: string, body: Record<string, unknown> = {}) => {
    const data = await webApiFetch(`/api/admin/samsung-root/${path}`, body);
    if (!data?.success) throw new Error(data?.error || "No se pudo completar la operación.");
    return data;
  };

  const load = async () => {
    try { const data = await call("list"); setRoots(data.files || []); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo cargar el catálogo."); }
  };

  useEffect(() => { void load(); }, []);

  const visibleRoots = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return roots;
    return roots.filter((root) => [root.model, root.binary_version, root.android_version, root.build, root.region, root.magisk_version, root.original_filename].some((value) => String(value || "").toLowerCase().includes(needle)));
  }, [roots, search]);

  const selectFiles = (selected: File[]) => {
    const valid = selected.filter((file) => /\.tar(?:\.md5)?$/i.test(file.name));
    setFiles(valid);
    setMessage(valid.length === selected.length ? `${valid.length} archivo(s) preparado(s).` : "Solo se aceptan archivos .tar o .tar.md5.");
  };

  async function uploadOne(file: File) {
    const start = await call("upload/start", { filename: file.name, contentType: file.type || "application/octet-stream", sizeBytes: file.size });
    const parts: { ETag: string; PartNumber: number }[] = [];
    try {
      for (let index = 0; index < Number(start.partCount); index += 1) {
        if (cancelRequested.current) throw new Error("Carga cancelada.");
        const partNumber = index + 1;
        const signed = await call("upload/part-url", { uploadSessionId: start.uploadSessionId, partNumber });
        const startByte = index * Number(start.partSize);
        const response = await fetch(signed.uploadUrl, { method: "PUT", body: file.slice(startByte, Math.min(startByte + Number(start.partSize), file.size)) });
        if (!response.ok) throw new Error(`R2 rechazó la parte ${partNumber} de ${file.name} (${response.status}).`);
        const etag = response.headers.get("etag");
        if (!etag) throw new Error(`R2 no expuso el ETag de ${file.name}.`);
        parts.push({ ETag: etag, PartNumber: partNumber });
      }
      await call("upload/complete", { uploadSessionId: start.uploadSessionId, parts });
    } catch (error) {
      try { await call("upload/cancel", { uploadSessionId: start.uploadSessionId }); } catch { /* conserva el error original */ }
      throw error;
    }
  }

  async function uploadAll(event: React.FormEvent) {
    event.preventDefault();
    if (!files.length || busy) return;
    setBusy(true); setMessage(""); cancelRequested.current = false; setProgress({ completed: 0, total: files.length });
    const failures: string[] = [];
    let completed = 0;
    try {
      // Tres archivos simultáneos: permite una carga masiva sin saturar el navegador ni R2.
      let next = 0;
      const worker = async () => {
        while (next < files.length && !cancelRequested.current) {
          const file = files[next++];
          try { await uploadOne(file); } catch (error) { failures.push(`${file.name}: ${error instanceof Error ? error.message : "error de carga"}`); }
          completed += 1; setProgress({ completed, total: files.length });
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      await load();
      setFiles([]);
      setMessage(cancelRequested.current ? "Carga cancelada." : failures.length ? `${completed - failures.length}/${files.length} publicados. ${failures.join(" | ")}` : `${completed} root(s) publicados correctamente.`);
    } finally { setBusy(false); setProgress(null); }
  }

  async function remove(root: RootFile) {
    if (busy || !window.confirm(`¿Eliminar “${root.original_filename}”? También se borrará de R2.`)) return;
    setBusy(true); setMessage("");
    try { await call("delete", { id: root.id }); setMessage("Root eliminado."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo eliminar el root."); }
    finally { setBusy(false); }
  }

  return <section className="max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="font-display text-lg font-semibold">Samsung Root Files</h2><p className="text-muted-foreground mt-1 text-sm">Carga varios archivos .tar de una vez. El catálogo se ordena automáticamente por modelo, binario, Android, compilación y Magisk.</p></div>
      <Button variant="outline" size="sm" onClick={() => void load()} disabled={busy}><RefreshCw className="size-4" />Actualizar</Button>
    </div>
    <form onSubmit={uploadAll} className="border-primary/30 bg-card mt-5 grid gap-4 rounded-xl border p-5 shadow-lg shadow-primary/5">
      <label className="grid gap-1.5 text-sm"><span className="font-medium">Archivos Samsung Root</span><Input type="file" multiple accept=".tar,.md5,.tar.md5" disabled={busy} onChange={(event) => selectFiles(Array.from(event.target.files || []))} /><span className="text-muted-foreground text-xs">Formato esperado: Root_A042M_Bin.8_OS14_A042MUBS8FXG1_CHX_Magisk_26.1.tar</span></label>
      {files.length > 0 && <div className="max-h-52 overflow-y-auto rounded-lg border p-3 text-xs">{files.map((file) => { const parsed = parseName(file.name); return <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 border-b py-2 last:border-0"><span className="min-w-0 truncate font-mono">{file.name}</span><span className="text-muted-foreground shrink-0">{parsed ? `${parsed.model} · Bin ${parsed.binary} · Android ${parsed.android} · Magisk ${parsed.magisk}` : "nombre inválido"}</span></div>; })}</div>}
      {progress && <div className="border-primary/25 bg-primary/6 rounded-lg border px-3 py-3 text-sm"><div className="flex justify-between gap-3"><span>Publicando archivos en R2…</span><b>{progress.completed}/{progress.total}</b></div><div className="bg-muted mt-2 h-2 overflow-hidden rounded-full"><div className="bg-primary h-full transition-[width]" style={{ width: `${Math.round((progress.completed / progress.total) * 100)}%` }} /></div></div>}
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
      <div className="flex flex-wrap gap-2"><Button disabled={busy || !files.length}>{busy ? <Loader2 className="animate-spin" /> : <HardDriveUpload />}{busy ? "Publicando…" : "Publicar selección"}</Button>{busy && <Button type="button" variant="outline" onClick={() => { cancelRequested.current = true; }}><X className="size-4" />Cancelar</Button>}</div>
    </form>
    <div className="mt-6 flex items-center gap-2"><Search className="text-muted-foreground size-4" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar modelo, compilación, región o Magisk…" /></div>
    <div className="mt-4 overflow-x-auto rounded-xl border"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-muted/50 text-muted-foreground text-xs uppercase"><tr><th className="px-4 py-3">Modelo</th><th className="px-4 py-3">Binary</th><th className="px-4 py-3">Android</th><th className="px-4 py-3">Compilación</th><th className="px-4 py-3">Región</th><th className="px-4 py-3">Magisk</th><th className="px-4 py-3">Tamaño</th><th className="px-4 py-3" /></tr></thead><tbody>{visibleRoots.map((root) => <tr key={root.id} className="border-t"><td className="px-4 py-3 font-semibold">{root.model}</td><td className="px-4 py-3">{root.binary_version}</td><td className="px-4 py-3">{root.android_version}</td><td className="px-4 py-3 font-mono text-xs">{root.build}</td><td className="px-4 py-3">{root.region || "—"}</td><td className="px-4 py-3">{root.magisk_version}</td><td className="px-4 py-3">{formatSize(root.size_bytes)}</td><td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" className="text-destructive" disabled={busy} onClick={() => void remove(root)} aria-label={`Eliminar ${root.original_filename}`}><Trash2 className="size-4" /></Button></td></tr>)}{visibleRoots.length === 0 && <tr><td colSpan={8} className="text-muted-foreground px-4 py-10 text-center">No hay root files que coincidan con la búsqueda.</td></tr>}</tbody></table></div>
  </section>;
}
