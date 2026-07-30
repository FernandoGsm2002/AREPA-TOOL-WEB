import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, KeyRound, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { WindowsIcon } from "@/components/icons/BrandIcons";
import { webApiFetch } from "@/lib/web-session";

interface DownloadTool {
  key: string;
  title: string;
  description: string;
  category: string;
  downloadUrl: string;
}

export default function Downloads() {
  const [tools, setTools] = useState<DownloadTool[] | null>(null);
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
      setTools(data.tools);
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

      <section className="border-border/60 bg-card mt-6 rounded-xl border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold">ArepaToolV2 — v2.1.0</p>
            <p className="text-muted-foreground mt-1 text-sm">Windows · MDM Edition</p>
          </div>
          <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <ShieldCheck className="size-3.5" /> Instalador principal
          </span>
        </div>

        <Button asChild className="mt-4">
          <a href="https://www.mediafire.com/file/fgng1boch3nszxb/ArepaToolV2_Setup_v2.1.0.rar/file" target="_blank" rel="noopener noreferrer">
            <WindowsIcon className="size-4" />
            Descargar instalador
          </a>
        </Button>

        <div className="border-border/60 bg-muted/40 mt-4 inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 font-mono text-sm">
          <KeyRound className="text-primary size-4" />
          <span className="text-muted-foreground">pass rar:</span>
          <strong className="tracking-wide">arepatool20261</strong>
        </div>
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
              <article key={tool.key} className="border-border/60 bg-card rounded-xl border p-5 transition-colors hover:border-primary/45">
                <span className="text-primary bg-primary/10 inline-flex rounded-md px-2 py-1 text-[0.65rem] font-semibold tracking-wider uppercase">{tool.category}</span>
                <h4 className="mt-3 font-semibold">{tool.title}</h4>
                <p className="text-muted-foreground mt-1 min-h-10 text-sm leading-relaxed">{tool.description}</p>
                <Button asChild className="mt-5 w-full">
                  <a href={tool.downloadUrl} download>
                    <Download className="size-4" /> Descargar .exe
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
