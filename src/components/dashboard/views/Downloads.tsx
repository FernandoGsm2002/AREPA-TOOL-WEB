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
    <div className="dashboard-view dashboard-downloads">
      <h2 className="dashboard-heading">Descargas</h2>
      <p className="dashboard-description">Software y utilidades disponibles para tu licencia activa.</p>

      <section className="dashboard-installer">
        <WindowsIcon className="dashboard-installer-icon" aria-hidden="true" />
        <div className="dashboard-installer-details">
          <div>
            <p className="dashboard-section-title">ArepaToolV3 — v3.1.0</p>
            <p className="text-muted-foreground mt-1 text-sm">Windows · MDM Edition</p>
          </div>
          <span className="dashboard-installer-label inline-flex items-center gap-1.5 text-xs font-medium">
            <ShieldCheck className="size-3.5" /> Instalador principal
          </span>
        </div>

        <Button className="dashboard-installer-action" onClick={() => window.dispatchEvent(new CustomEvent("open-installer-access"))}>
          <WindowsIcon className="size-4" />
          Solicitar instalador
        </Button>
      </section>

      <section className="dashboard-download-section">
        <div className="dashboard-section-header">
          <div>
            <h3 className="dashboard-section-title">Herramientas A12+</h3>
            <p className="text-muted-foreground mt-1 text-sm">Enlaces privados generados para tu sesión.</p>
          </div>
          {!loading && !error && (
            <Button variant="ghost" size="sm" onClick={() => void loadDownloads()}>
              <RefreshCw className="size-4" /> Actualizar
            </Button>
          )}
        </div>

        {loading && (
          <div className="dashboard-state text-muted-foreground flex items-center gap-2 text-sm" role="status">
            <Loader2 className="size-4 animate-spin" /> Preparando enlaces seguros…
          </div>
        )}

        {error && (
          <div className="dashboard-error" role="alert">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => void loadDownloads()}>
              <RefreshCw className="size-4" /> Reintentar
            </Button>
          </div>
        )}

        {tools && (
          <div className="dashboard-download-list">
            {tools.map((tool) => (
              <article key={tool.key} className="dashboard-download-item">
                <span className="dashboard-file-icon" aria-hidden="true"><Download className="size-5" /></span>
                <div className="dashboard-download-copy">
                  <div className="dashboard-file-title">
                    <h4 className="font-medium">{tool.title}</h4>
                    <span className="dashboard-file-tag">{tool.category}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{tool.description}</p>
                </div>
                <Button asChild variant="secondary" className="dashboard-file-action">
                  <a href={tool.downloadUrl} download>
                    <Download className="size-4" /> Descargar .exe
                  </a>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-download-section">
        <div>
          <h3 className="dashboard-section-title">ROMs de soporte</h3>
          <p className="text-muted-foreground mt-1 text-sm">Firmware privado disponible únicamente mientras tu licencia esté activa.</p>
        </div>

        {!loading && !error && roms?.length === 0 && (
          <div className="dashboard-empty text-muted-foreground text-sm">
            Aún no hay ROMs publicadas para tu cuenta.
          </div>
        )}

        {roms && roms.length > 0 && (
          <div className="dashboard-rom-grid">
            {roms.map((rom) => (
              <article key={rom.id} className="dashboard-rom">
                <div className="dashboard-file-title">
                  <h4 className="font-medium">{rom.name}</h4>
                  <span className="dashboard-file-tag">ROM Patch</span>
                </div>
                <span className="text-muted-foreground mt-2 text-xs tabular-nums">{formatFileSize(Number(rom.size_bytes))}</span>
                <p className="text-muted-foreground mt-1 text-sm">{rom.device_model}{rom.version ? ` · ${rom.version}` : ""}{rom.android_version ? ` · Android ${rom.android_version}` : ""}</p>
                {rom.description && <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{rom.description}</p>}
                <Button asChild variant="secondary" className="dashboard-rom-action">
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
