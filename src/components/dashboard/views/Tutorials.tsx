import { useEffect, useMemo, useState } from "react";
import { BookOpen, Captions, CheckCircle2, ChevronRight, CirclePlay, Clock3, Play, Video } from "lucide-react";
import { webApiFetch } from "@/lib/web-session";

type Tutorial = {
  id: string;
  module: string;
  title: string;
  instruction: string;
  duration: string;
  videoSrc?: string;
  captionsSrc?: string;
  posterSrc?: string;
  embedUrl?: string;
};

// Cuando estén listos los materiales, agrega las rutas públicas del .mp4 y el
// subtítulo .vtt correspondiente. El reproductor mostrará CC automáticamente.
const tutorials: Tutorial[] = [
  { id: "it-admin-locks", module: "MDM", title: "IT Admin Locks", instruction: "Identifica el tipo de bloqueo y sigue el método indicado antes de modificar el equipo.", duration: "6 min" },
  { id: "oppo-locks", module: "Android", title: "Oppo Locks", instruction: "Prepara el dispositivo y verifica la conexión antes de comenzar el procedimiento.", duration: "2 min" },
  { id: "motorola", module: "MDM", title: "Motorola", instruction: "Revisa el modelo y aplica el método compatible para su configuración.", duration: "3 min" },
  { id: "nvdata", module: "MediaTek", title: "NVData Repair", instruction: "Carga una copia de respaldo, valida los IMEI y guarda el parche en otra ubicación.", duration: "2 min" },
  { id: "fix-yape", module: "Samsung", title: "Fix Yape", instruction: "Sigue las validaciones previas y reinicia el dispositivo al finalizar el proceso.", duration: "3 min" },
  { id: "transsion-payjoy", module: "MediaTek", title: "Transsion PayJoy", instruction: "Conecta el equipo en el modo indicado y espera la confirmación antes de desconectarlo.", duration: "2 min" },
  { id: "arepa-redirector", module: "ArepaRedirector", title: "USB Redirector", instruction: "Inicia una sesión, comparte el enlace generado y conserva la herramienta abierta durante el trabajo.", duration: "2 min" },
  { id: "apple-bypass", module: "Apple", title: "Apple Bypass", instruction: "Confirma la versión compatible y prepara el hardware necesario antes de comenzar.", duration: "2 min" },
];

export default function Tutorials() {
  const [selectedId, setSelectedId] = useState(tutorials[0].id);
  const [embeds, setEmbeds] = useState<Record<string, string>>({});
  const selected = useMemo(() => tutorials.find((item) => item.id === selectedId) ?? tutorials[0], [selectedId]);
  const selectedEmbed = embeds[selected.id];
  const readyCount = Object.keys(embeds).length;

  useEffect(() => {
    void (async () => {
      const data = await webApiFetch("/api/web-tutorials");
      if (!data) { window.location.href = "/login"; return; }
      if (!data.success || !Array.isArray(data.videos)) return;
      setEmbeds(Object.fromEntries(data.videos
        .filter((video: unknown): video is { id: string; embedUrl: string } => Boolean(video) && typeof (video as { id?: unknown }).id === "string" && typeof (video as { embedUrl?: unknown }).embedUrl === "string")
        .map((video) => [video.id, video.embedUrl])));
    })();
  }, []);

  return (
    <div className="max-w-6xl">
      <header className="border-border/60 bg-card/70 overflow-hidden rounded-2xl border p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <div className="text-primary flex items-center gap-2 text-sm font-medium"><BookOpen className="size-4" /> Centro de aprendizaje</div>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Tutoriales de ArepaTool</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">Guías breves, por módulo y pensadas para que cada proceso se haga en el orden correcto.</p>
          </div>
          <div className="border-border/70 bg-background/50 rounded-xl border px-4 py-3 text-right">
            <p className="text-lg font-semibold">{readyCount}/8</p>
            <p className="text-muted-foreground text-xs">videos publicados</p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,.8fr)]">
        <section className="border-border/60 bg-card overflow-hidden rounded-2xl border">
          <div className="bg-muted/45 relative aspect-video overflow-hidden">
            {selectedEmbed ? (
              <iframe className="h-full w-full bg-black" src={selectedEmbed} title={selected.title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : selected.videoSrc ? (
              <video className="h-full w-full bg-black object-contain" controls preload="metadata" poster={selected.posterSrc}>
                <source src={selected.videoSrc} type="video/mp4" />
                {selected.captionsSrc && <track kind="subtitles" srcLang="es" label="Español" src={selected.captionsSrc} default />}
                Tu navegador no puede reproducir este video.
              </video>
            ) : (
              <div className="relative flex h-full flex-col items-center justify-center px-7 text-center">
                <span className="bg-primary/12 text-primary flex size-14 items-center justify-center rounded-2xl"><Video className="size-7" /></span>
                <p className="mt-4 font-semibold">Video en preparación</p>
                <p className="text-muted-foreground mt-1 max-w-sm text-sm">Este tutorial aparecerá aquí apenas se publique su guía en video.</p>
              </div>
            )}
          </div>
          <div className="p-6 sm:p-7">
            <p className="text-primary text-sm font-medium">{selected.module}</p>
            <h3 className="font-display mt-1 text-xl font-bold">{selected.title}</h3>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">{selected.instruction}</p>
            <div className="text-muted-foreground mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" /> {selected.duration}</span>
              <span className="inline-flex items-center gap-1.5"><Captions className="size-3.5" /> Subtítulos en español {selected.captionsSrc ? "disponibles" : "al publicar"}</span>
            </div>
          </div>
        </section>

        <aside className="border-border/60 bg-card rounded-2xl border p-2 sm:p-3">
          <div className="flex items-center justify-between px-3 py-3">
            <h3 className="font-display font-bold">Guías</h3>
            <span className="text-muted-foreground text-xs">8 tutoriales</span>
          </div>
          <div className="max-h-[34rem] space-y-1 overflow-y-auto pr-1">
            {tutorials.map((tutorial, index) => {
              const isSelected = tutorial.id === selected.id;
              return (
                <button key={tutorial.id} type="button" onClick={() => setSelectedId(tutorial.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}>
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${isSelected ? "bg-white/15" : "bg-muted text-muted-foreground group-hover:bg-background"}`}>{index + 1}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{tutorial.title}</span><span className={`mt-0.5 block text-xs ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{tutorial.module}</span></span>
                  {embeds[tutorial.id] || tutorial.videoSrc ? <CheckCircle2 className="size-4 shrink-0" /> : isSelected ? <Play className="size-4 shrink-0" /> : <ChevronRight className="text-muted-foreground size-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      <p className="text-muted-foreground mt-5 flex items-start gap-2 text-xs leading-relaxed"><CirclePlay className="mt-0.5 size-3.5 shrink-0" /> Cada video puede incluir subtítulos en español. Actívalos con el botón CC del reproductor cuando estén disponibles.</p>
    </div>
  );
}
