import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { webApiFetch } from "@/lib/web-session";

type Announcement = { enabled: boolean; message: string; updatedAt: string | null };

export default function DesktopAnnouncementAdmin() {
  const [announcement, setAnnouncement] = useState<Announcement>({ enabled: false, message: "", updatedAt: null });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void webApiFetch("/api/admin/desktop-announcement/get", {}).then(result => {
      if (!result?.success) throw new Error(result?.error || "No se pudo cargar el anuncio.");
      setAnnouncement(result.announcement as Announcement);
    }).catch(error => setNotice(error instanceof Error ? error.message : "No se pudo cargar el anuncio."));
  }, []);

  const save = async () => {
    const message = announcement.message.replace(/\s+/g, " ").trim();
    if (announcement.enabled && !message) { setNotice("Escribe un anuncio antes de activarlo."); return; }
    setBusy(true); setNotice("");
    try {
      const result = await webApiFetch("/api/admin/desktop-announcement/save", {
        enabled: announcement.enabled, message,
      });
      if (!result?.success) throw new Error(result?.error || "No se pudo guardar el anuncio.");
      setAnnouncement(result.announcement as Announcement);
      setNotice("Anuncio guardado. Aparecerá en la herramienta en unos minutos.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar el anuncio.");
    } finally { setBusy(false); }
  };

  return <section className="border-border/70 bg-card max-w-2xl rounded-xl border p-6">
    <div className="flex items-center gap-3">
      <Megaphone className="text-primary size-5" />
      <div><h2 className="font-semibold">Anuncio en ArepaTool V3</h2>
        <p className="text-muted-foreground text-sm">Se muestra junto al estado del dispositivo.</p></div>
    </div>
    <label className="mt-6 flex items-center gap-3 text-sm">
      <input type="checkbox" checked={announcement.enabled}
        onChange={event => setAnnouncement(current => ({ ...current, enabled: event.target.checked }))}
        className="accent-primary size-4" />
      Mostrar anuncio
    </label>
    <label className="mt-5 block text-sm font-medium" htmlFor="desktop-announcement">Texto</label>
    <textarea id="desktop-announcement" maxLength={160} rows={3}
      value={announcement.message}
      onChange={event => setAnnouncement(current => ({ ...current, message: event.target.value }))}
      placeholder="Ejemplo: El servicio Xiaomi estará en mantenimiento esta noche."
      className="border-input bg-background focus-visible:ring-ring mt-2 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2" />
    <p className="text-muted-foreground mt-1 text-right text-xs">{announcement.message.length}/160</p>
    <div className="border-border/60 bg-background mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
      <Megaphone className="text-primary size-3.5 shrink-0" />
      <span className="min-w-0 truncate">{announcement.message.trim() || "Vista previa del anuncio"}</span>
    </div>
    <div className="mt-5 flex items-center gap-3">
      <Button disabled={busy} onClick={() => void save()}>{busy ? "Guardando…" : "Guardar anuncio"}</Button>
      {notice && <span className="text-muted-foreground text-sm">{notice}</span>}
    </div>
  </section>;
}
