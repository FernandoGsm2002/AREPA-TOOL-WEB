import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, HardDriveDownload, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { WindowsIcon } from "@/components/icons/BrandIcons";
import { webApiFetch } from "@/lib/web-session";

interface DownloadTool {
  key: string;
  title: string;
  description: string;
  category: string;
  downloadUrl: string;
}

interface DownloadRom {
  id: string;
  name: string;
  version?: string | null;
  device_model: string;
  android_version?: string | null;
  size_bytes: number;
  description?: string | null;
  downloadUrl: string;
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Archivo ROM";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index >= 3 ? 2 : 0)} ${units[index]}`;
}

export default function Downloads() {
  const [tools, setTools] = useState<DownloadTool[] | null>(null);
  const [roms, setRoms] = useState<DownloadRom[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDownloads() {
    setLoading(true);
    setError(null);
    try {
      const data = await webApiFetch("/api/web-downloads", {});
      if (!data) {
        window.location.href = "/login";
        return;
      }
      if (!data.success) {
        setError(data.error || "No se pudieron cargar las descargas.");
        return;
      }
      setTools(data.tools || []);
      setRoms(data.roms || []);
    } catch {
      setError("No se pudieron cargar las descargas. Revisa tu conexión e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDownloads();
  }, []);

  return (
    <div className="max-w-4xl">
      <h2 className="font-display text-2xl font-bold">Descargas</h2>
      <p className="text-muted-foreground mt-1 text-sm">Software y utilidades disponibles para tu licencia activa.</p>

      <section className="border-primary/25 bg-card mt-6 rounded-2xl border p-6 shadow-xl shadow-primary/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold">ArepaToolV2 — v2.2.2</p>
            <p className="text-muted-foreground mt-1 text-sm">Windows · MDM Edition</p>
          </div>
          <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <ShieldCheck className="size-3.5" /> Instalador principal
          </span>
        </div>

        <Button className="mt-5 shadow-lg shadow-primary/20" onClick={() => window.dispatchEvent(new CustomEvent("open-installer-access"))}>
          <WindowsIcon className="size-4" />
          Solicitar instalador
        </Button>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold">Herramientas A12+</h3>
            <p className="text-muted-foreground mt-1 text-sm">Enlaces privados generados para tu sesión.</p>
          </div>
          {!loading && !error && (
            <Button variant="ghost" size="sm" onClick={() => void loadDownloads()}>
              <RefreshCw className="size-4" /> Actualizar
            </Button>
          )}
        </div>

        {loading && (
          <div className="border-border/60 text-muted-foreground mt-4 flex items-center gap-2 rounded-xl border p-5 text-sm">
            <Loader2 className="size-4 animate-spin" /> Preparando enlaces seguros…
          </div>
        )}

        {error && (
          <div className="border-destructive/30 bg-destructive/5 mt-4 rounded-xl border p-5">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void loadDownloads()}>
              <RefreshCw className="size-4" /> Reintentar
            </Button>
          </div>
        )}

        {tools && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tools.map((tool) => (
              <article key={tool.key} className="border-border/60 bg-card rounded-xl border p-5 shadow-lg shadow-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-primary/10">
                <span className="text-primary bg-primary/10 inline-flex rounded-md px-2 py-1 text-[0.65rem] font-semibold tracking-wider uppercase">{tool.category}</span>
                <h4 className="mt-3 font-semibold">{tool.title}</h4>
                <p className="text-muted-foreground mt-1 min-h-10 text-sm leading-relaxed">{tool.description}</p>
                <Button asChild className="mt-5 w-full shadow-lg shadow-primary/15">
                  <a href={tool.downloadUrl} download>
                    <Download className="size-4" /> Descargar .exe
                  </a>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div>
          <h3 className="font-display text-lg font-bold">ROMs de soporte</h3>
          <p className="text-muted-foreground mt-1 text-sm">Firmware privado disponible únicamente mientras tu licencia esté activa.</p>
        </div>

        {!loading && !error && roms?.length === 0 && (
          <div className="border-border/60 bg-card text-muted-foreground mt-4 rounded-xl border border-dashed p-5 text-sm">
            Aún no hay ROMs publicadas para tu cuenta.
          </div>
        )}

        {roms && roms.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {roms.map((rom) => (
              <article key={rom.id} className="group border-primary/25 bg-card relative overflow-hidden rounded-2xl border p-5 shadow-xl shadow-black/8 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-primary/10">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/55" />
                <div className="flex items-start justify-between gap-3">
                  <span className="text-primary inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wider uppercase">ROM Patch</span>
                  <span className="text-muted-foreground rounded-full bg-muted/70 px-2.5 py-1 text-xs tabular-nums">{formatFileSize(Number(rom.size_bytes))}</span>
                </div>
                <h4 className="mt-3 font-semibold">{rom.name}</h4>
                <p className="text-muted-foreground mt-1 text-sm">{rom.device_model}{rom.version ? ` · ${rom.version}` : ""}{rom.android_version ? ` · Android ${rom.android_version}` : ""}</p>
                {rom.description && <p className="text-muted-foreground mt-3 min-h-10 text-sm leading-relaxed">{rom.description}</p>}
                <Button asChild className="rom-download-button mt-5 w-full border border-primary/55 bg-primary text-primary-foreground focus-visible:ring-primary">
                  <a href={rom.downloadUrl} download>
                    <HardDriveDownload className="size-4" /> Descargar ROM
                  </a>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
