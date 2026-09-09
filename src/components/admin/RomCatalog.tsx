import { useEffect, useRef, useState } from "react";
import { HardDriveUpload, Loader2, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { webApiFetch } from "@/lib/web-session";

type Rom = {
  id: string; name: string; version?: string | null; device_model: string; android_version?: string | null;
  rom_file: string; size_bytes: number | string; description?: string | null; is_active: boolean;
};

const supported = ".zip,.rar,.7z,.img,.tar,.tgz,.gz";
const formatSize = (value: number | string) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "Tamaño no disponible";
  return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

export default function RomCatalog() {
  const [roms, setRoms] = useState<Rom[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<Rom | null>(null);
  const [name, setName] = useState(""); const [deviceModel, setDeviceModel] = useState("");
  const [version, setVersion] = useState(""); const [androidVersion, setAndroidVersion] = useState("");
  const [description, setDescription] = useState(""); const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const uploadSessionId = useRef<string | null>(null);
  const call = async (path: string, body: Record<string, unknown> = {}) => {
    const data = await webApiFetch(`/api/admin/${path}`, body);
    if (!data?.success) throw new Error(data?.error || "No se pudo completar la operación.");
    return data;
  };
  const resetForm = () => {
    setEditing(null); setFile(null); setName(""); setDeviceModel(""); setVersion(""); setAndroidVersion(""); setDescription(""); setIsActive(true); setProgress(null);
  };
  const load = async () => {
    try { const data = await call("roms/list"); setRoms(data.roms || []); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo cargar el catálogo."); }
  };
  useEffect(() => { void load(); }, []);
  const startEdit = (rom: Rom) => {
    setMessage(""); setEditing(rom); setFile(null); setName(rom.name); setDeviceModel(rom.device_model);
    setVersion(rom.version || ""); setAndroidVersion(rom.android_version || ""); setDescription(rom.description || ""); setIsActive(rom.is_active);
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if ((!editing && !file) || !name.trim() || !deviceModel.trim() || busy) return;
    setBusy(true); setMessage(""); setProgress(null);
    try {
      if (editing) {
        await call("roms/save", { id: editing.id, name: name.trim(), deviceModel: deviceModel.trim(), version: version.trim(), androidVersion: androidVersion.trim(), description: description.trim(), isActive });
        setMessage("Detalles de la ROM actualizados."); resetForm(); await load(); return;
      }
      const selectedFile = file!;
      const start = await call("roms/upload/start", { filename: selectedFile.name, contentType: selectedFile.type || "application/octet-stream", sizeBytes: selectedFile.size });
      uploadSessionId.current = start.uploadSessionId;
      const total = start.partCount as number; const parts: { ETag: string; PartNumber: number }[] = new Array(total); let next = 0;
      setProgress({ completed: 0, total });
      const uploadWorker = async () => {
        while (next < total) {
          const index = next++; const partNumber = index + 1;
          const signed = await call("roms/upload/part-url", { uploadSessionId: start.uploadSessionId, partNumber });
          const startByte = index * start.partSize;
          const response = await fetch(signed.uploadUrl, { method: "PUT", body: selectedFile.slice(startByte, Math.min(startByte + start.partSize, selectedFile.size)) });
          if (!response.ok) throw new Error(`R2 rechazó la parte ${partNumber} (${response.status}).`);
          const etag = response.headers.get("etag");
          if (!etag) throw new Error("R2 no expuso el ETag. Configura CORS para exponer el encabezado ETag.");
          parts[index] = { ETag: etag, PartNumber: partNumber };
          setProgress((current) => current ? { ...current, completed: current.completed + 1 } : current);
        }
      };
      await Promise.all([uploadWorker(), uploadWorker(), uploadWorker()]);
      await call("roms/upload/complete", { uploadSessionId: start.uploadSessionId, parts, name: name.trim(), deviceModel: deviceModel.trim(), version: version.trim(), androidVersion: androidVersion.trim(), description: description.trim(), isActive });
      uploadSessionId.current = null; setMessage("ROM cargada y publicada para usuarios con licencia."); resetForm(); await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la ROM.");
    } finally { setBusy(false); setProgress(null); }
  }
  async function remove(rom: Rom) {
    if (busy || !window.confirm(`¿Eliminar “${rom.name}”? También se borrará el archivo de R2.`)) return;
    setBusy(true); setMessage("");
    try { await call("roms/delete", { id: rom.id }); if (editing?.id === rom.id) resetForm(); setMessage("ROM eliminada."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo eliminar la ROM."); }
    finally { setBusy(false); }
  }
  return <section className="max-w-5xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-display text-lg font-semibold">ROMs de soporte</h2><p className="text-muted-foreground mt-1 text-sm">Carga archivos grandes a R2 y corrige los detalles sin volver a subirlos.</p></div><Button variant="outline" size="sm" onClick={() => void load()} disabled={busy}><RefreshCw className="size-4" />Actualizar</Button></div>
    <form onSubmit={submit} className="border-primary/30 bg-card mt-5 grid gap-4 rounded-xl border p-5 shadow-lg shadow-primary/5 md:grid-cols-2">
      <div className="flex items-start justify-between gap-4 md:col-span-2"><div><h3 className="font-display font-semibold">{editing ? "Editar detalles de ROM" : "Nueva ROM"}</h3><p className="text-muted-foreground mt-1 text-xs">{editing ? "El archivo permanece intacto; solo actualizarás la información y visibilidad." : "El archivo se divide en partes y se sube directamente a R2."}</p></div>{editing && <Button type="button" variant="ghost" size="icon" onClick={resetForm} aria-label="Cerrar edición"><X className="size-4" /></Button>}</div>
      {!editing && <label className="grid gap-1.5 text-sm md:col-span-2">Archivo ROM<Input required type="file" accept={supported} disabled={busy} onChange={(event) => setFile(event.target.files?.[0] || null)} />{file && <span className="text-muted-foreground truncate font-mono text-xs">{file.name} · {formatSize(file.size)}</span>}</label>}
      <label className="grid gap-1.5 text-sm">Nombre visible<Input required value={name} disabled={busy} onChange={(event) => setName(event.target.value)} placeholder="ROM oficial" /></label><label className="grid gap-1.5 text-sm">Modelo<Input required value={deviceModel} disabled={busy} onChange={(event) => setDeviceModel(event.target.value)} placeholder="Xiaomi 14C" /></label>
      <label className="grid gap-1.5 text-sm">Versión<Input value={version} disabled={busy} onChange={(event) => setVersion(event.target.value)} placeholder="OS1.0.8" /></label><label className="grid gap-1.5 text-sm">Android<Input value={androidVersion} disabled={busy} onChange={(event) => setAndroidVersion(event.target.value)} placeholder="Android 14" /></label>
      <label className="grid gap-1.5 text-sm md:col-span-2">Descripción<Input value={description} disabled={busy} onChange={(event) => setDescription(event.target.value)} placeholder="Notas de compatibilidad o región" /></label>
      <label className="text-muted-foreground flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={isActive} disabled={busy} onChange={(event) => setIsActive(event.target.checked)} />Visible para usuarios con licencia activa</label>
      {progress && <div className="border-primary/25 bg-primary/6 rounded-lg border px-3 py-3 text-sm md:col-span-2"><div className="flex justify-between gap-3"><span>Subiendo partes a R2…</span><b>{progress.completed}/{progress.total}</b></div><div className="bg-muted mt-2 h-2 overflow-hidden rounded-full"><div className="bg-primary h-full transition-[width]" style={{ width: `${Math.round((progress.completed / progress.total) * 100)}%` }} /></div></div>}
      {message && <p className="text-muted-foreground text-sm md:col-span-2">{message}</p>}
      <div className="flex gap-2 md:col-span-2"><Button disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <HardDriveUpload />}{busy ? "Guardando…" : editing ? "Guardar detalles" : "Subir ROM a R2"}</Button>{editing && <Button type="button" variant="outline" disabled={busy} onClick={resetForm}>Cancelar</Button>}</div>
    </form>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{roms.map((rom) => <article key={rom.id} className="border-border/60 bg-card rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold">{rom.name}</h3><p className="text-muted-foreground mt-1 text-xs">{rom.device_model}{rom.version ? ` · ${rom.version}` : ""}</p></div><span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-1 text-xs">{formatSize(rom.size_bytes)}</span></div><p className="text-muted-foreground mt-3 truncate font-mono text-xs" title={rom.rom_file}>{rom.rom_file}</p><div className="mt-4 flex items-center justify-between gap-2"><span className="text-muted-foreground text-xs">{rom.is_active ? "Visible" : "Oculta"}</span><div className="flex gap-1"><Button size="sm" variant="outline" disabled={busy} onClick={() => startEdit(rom)}><Pencil className="size-3.5" />Editar</Button><Button size="sm" variant="ghost" className="text-destructive" disabled={busy} onClick={() => void remove(rom)} aria-label={`Eliminar ${rom.name}`}><Trash2 className="size-3.5" /></Button></div></div></article>)}{roms.length === 0 && <p className="text-muted-foreground col-span-full rounded-xl border border-dashed p-8 text-center text-sm">Aún no hay ROMs publicadas.</p>}</div>
  </section>;
}
