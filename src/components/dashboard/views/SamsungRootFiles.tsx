import { useEffect, useMemo, useState } from "react";
import { Download, HardDriveDownload, Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { webApiFetch } from "@/lib/web-session";

type RootFile = { id: string; model: string; binaryVersion: string; androidVersion: string; build: string; region?: string | null; magiskVersion: string; sizeBytes?: number | null; originalFilename: string; downloadUrl: string };
const size = (value?: number | null) => { const bytes = Number(value); return !Number.isFinite(bytes) || bytes <= 0 ? "" : bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`; };

export default function SamsungRootFiles() {
  const [files, setFiles] = useState<RootFile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { const data = await webApiFetch("/api/web-samsung-root-files", {}); if (!data?.success) throw new Error(data?.error || "No se pudo cargar el catálogo."); setFiles(data.files || []); } catch (err) { setError(err instanceof Error ? err.message : "No se pudo cargar Samsung Root Files."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => { const needle = search.trim().toLowerCase(); return !needle ? files : files.filter((file) => [file.model, file.binaryVersion, file.androidVersion, file.build, file.region, file.magiskVersion, file.originalFilename].some((value) => String(value || "").toLowerCase().includes(needle))); }, [files, search]);
  return <section className="max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-primary text-xs font-bold tracking-[0.18em] uppercase">Samsung</p><h1 className="font-display mt-1 text-2xl font-semibold">Root Files</h1><p className="text-muted-foreground mt-2 max-w-2xl text-sm">Encuentra el archivo root por modelo, binario, Android, compilación y versión de Magisk. Los enlaces son temporales y se generan de forma segura.</p></div><Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}><RefreshCw className="size-4" />Actualizar</Button></div>
    <div className="mt-6 flex items-center gap-2"><Search className="text-muted-foreground size-4" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar A042M, Bin.8, Android 14, compilación…" /></div>
    {loading ? <div className="text-muted-foreground flex items-center gap-2 py-12 text-sm"><Loader2 className="size-4 animate-spin" />Cargando catálogo…</div> : error ? <div className="border-destructive/40 bg-destructive/5 text-destructive mt-5 rounded-xl border p-5 text-sm">{error}</div> : <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((file) => <article key={file.id} className="border-border/60 bg-card rounded-xl border p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">{file.model}</h2><p className="text-muted-foreground mt-1 text-xs">Bin {file.binaryVersion} · Android {file.androidVersion}</p></div><span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs">Magisk {file.magiskVersion}</span></div><dl className="text-muted-foreground mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs"><dt>Build</dt><dd className="truncate font-mono text-foreground" title={file.build}>{file.build}</dd><dt>Región</dt><dd>{file.region || "—"}</dd><dt>Tamaño</dt><dd>{size(file.sizeBytes) || "—"}</dd></dl><p className="text-muted-foreground mt-3 truncate font-mono text-[0.68rem]" title={file.originalFilename}>{file.originalFilename}</p><Button asChild className="mt-4 w-full"><a href={file.downloadUrl}><Download className="size-4" />Descargar root</a></Button></article>)}{filtered.length === 0 && <div className="text-muted-foreground col-span-full rounded-xl border border-dashed p-10 text-center text-sm"><HardDriveDownload className="mx-auto mb-2 size-6" />No hay archivos que coincidan con la búsqueda.</div>}</div>}
  </section>;
}
