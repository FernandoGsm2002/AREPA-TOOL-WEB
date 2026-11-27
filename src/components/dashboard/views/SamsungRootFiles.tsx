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
  return (
    <section className="dashboard-view dashboard-root-files">
      <div className="dashboard-section-header">
        <div>
          <h1 className="dashboard-heading"><span>Samsung</span> Root Files</h1>
          <p className="dashboard-description">Encuentra el archivo root por modelo, binario, Android, compilación y versión de Magisk. Los enlaces son temporales y se generan de forma segura.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="size-4" />Actualizar
        </Button>
      </div>

      <div className="dashboard-catalog-search">
        <Search className="text-muted-foreground size-[18px]" aria-hidden="true" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar A042M, Bin.8, Android 14, compilación…" aria-label="Buscar A042M, Bin.8, Android 14, compilación…" />
      </div>

      {loading ? (
        <div className="dashboard-state text-muted-foreground flex items-center gap-2 text-sm" role="status">
          <Loader2 className="size-4 animate-spin" />Cargando catálogo…
        </div>
      ) : error ? (
        <div className="dashboard-error text-destructive text-sm" role="alert">{error}</div>
      ) : (
        <div className="dashboard-root-grid">
          {filtered.map((file) => (
            <article key={file.id} className="dashboard-root-file">
              <div className="dashboard-root-file-heading">
                <div className="min-w-0">
                  <h2 className="dashboard-section-title">{file.model}</h2>
                  <p className="text-muted-foreground mt-1 text-xs">Bin {file.binaryVersion} · Android {file.androidVersion}</p>
                </div>
                <span className="dashboard-file-tag">Magisk {file.magiskVersion}</span>
              </div>
              <dl className="dashboard-root-metadata text-sm">
                <dt>Build</dt><dd className="font-mono text-xs" title={file.build}>{file.build}</dd>
                <dt>Región</dt><dd>{file.region || "—"}</dd>
                <dt>Tamaño</dt><dd>{size(file.sizeBytes) || "—"}</dd>
              </dl>
              <p className="dashboard-root-filename text-muted-foreground font-mono text-xs" title={file.originalFilename}>{file.originalFilename}</p>
              <Button asChild variant="secondary" className="dashboard-root-action">
                <a href={file.downloadUrl}><Download className="size-4" />Descargar root</a>
              </Button>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="dashboard-empty text-muted-foreground col-span-full text-center text-sm">
              <HardDriveDownload className="mx-auto mb-2 size-6" />No hay archivos que coincidan con la búsqueda.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
