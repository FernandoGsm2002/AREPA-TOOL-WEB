import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Captions,
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  Clock3,
  Layers3,
  MonitorPlay,
  Play,
  Sparkles,
  Video,
} from "lucide-react";
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
};

type MuxVideo = {
  id: string;
  playbackId: string;
  playbackToken: string;
  thumbnailToken: string;
  storyboardToken: string;
};

const MUX_PLAYER_SCRIPT_ID = "arepa-mux-player";

function MuxTutorialPlayer({ video, title }: { video: MuxVideo; title: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    const render = () => {
      if (disposed || !host.current) return;
      const player = document.createElement("mux-player");
      player.setAttribute("playback-id", video.playbackId);
      player.setAttribute("playback-token", video.playbackToken);
      player.setAttribute("thumbnail-token", video.thumbnailToken);
      player.setAttribute("storyboard-token", video.storyboardToken);
      player.setAttribute("title", title);
      player.setAttribute("preload", "none");
      player.style.width = "100%";
      player.style.height = "100%";
      host.current.replaceChildren(player);
    };

    if (customElements.get("mux-player")) {
      render();
      return () => { disposed = true; };
    }
    let script = document.getElementById(MUX_PLAYER_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = MUX_PLAYER_SCRIPT_ID;
      script.src = "https://cdn.jsdelivr.net/npm/@mux/mux-player";
      document.head.appendChild(script);
    }
    script.addEventListener("load", render, { once: true });
    return () => { disposed = true; script?.removeEventListener("load", render); };
  }, [title, video]);

  return <div ref={host} className="h-full w-full bg-black [&_mux-player]:block" />;
}

// Cuando estén listos los materiales, agrega las rutas públicas del .mp4 y el
// subtítulo .vtt correspondiente. El reproductor mostrará CC automáticamente.
const tutorials: Tutorial[] = [
  {
    id: "it-admin-locks",
    module: "MDM",
    title: "IT Admin Locks",
    instruction:
      "En este tutorial explicamos brevemente, los 3 metodos para saltar el bloque IT Admin, Multimarcas, y para los dispositivos que piden WI-FI para configurar.",
    duration: "6 min",
  },
  {
    id: "oppo-locks",
    module: "Android",
    title: "Oppo Locks",
    instruction:
      "En este tutorial , explicamos acerca del bloqueo Oguard de Oppo , Pantalla blanca o negra, como es conocida, metodo via DNS , prestar atencion.",
    duration: "2 min",
  },
  {
    id: "motorola",
    module: "MDM",
    title: "Motorola",
    instruction:
      "En este video, explicamos como hacer FRP o Unlock Bootloader, en dispositivos Motorola Mediatek, y explicamos brevemente a como saltar el bloque de Claro multimarcas.",
    duration: "3 min",
  },
  {
    id: "nvdata",
    module: "MediaTek",
    title: "NVData Repair",
    instruction:
      "En este video explicamos brevemente, como reparar el imei en dispositivos Honor 4G&5G Mediatek Devices.",
    duration: "2 min",
  },
  {
    id: "fix-yape",
    module: "Samsung",
    title: "Fix Yape",
    instruction:
      "En este video explicamos brevemente, como Fixear las apps bancarias , en especial la mas usada Yape y la que sufrio una actualizacion, simple y sencillo.",
    duration: "3 min",
  },
  {
    id: "transsion-payjoy",
    module: "MediaTek",
    title: "Transsion PayJoy",
    instruction:
      "En este video, explicamos , los diferentes metodos en dispositivos Transsion - Infinix - Tecno - Itel , metodos como Payjoy Lock - FRP - Factory Reset.",
    duration: "2 min",
  },
  {
    id: "arepa-redirector",
    module: "ArepaRedirector",
    title: "USB Redirector",
    instruction:
      "En este video tutorial , se explica la instalacion de USB-redirector en la herramienta ArepaTool, para que puedas hacer tus remotos.",
    duration: "2 min",
  },
  {
    id: "apple-bypass",
    module: "Apple",
    title: "Apple Bypass",
    instruction:
      "En este video tutorial , explicamos como son los pasos correctos para hacer un registro , para la herramienta RUST. Partner de ArepaTool.",
    duration: "2 min",
  },
];

export default function Tutorials() {
  const [selectedId, setSelectedId] = useState(tutorials[0].id);
  const [videos, setVideos] = useState<Record<string, MuxVideo>>({});
  const selected = useMemo(
    () => tutorials.find((item) => item.id === selectedId) ?? tutorials[0],
    [selectedId],
  );
  const selectedVideo = videos[selected.id];
  const readyCount = Object.keys(videos).length;

  useEffect(() => {
    void (async () => {
      const data = await webApiFetch("/api/web-tutorials");
      if (!data) {
        window.location.href = "/login";
        return;
      }
      if (!data.success || !Array.isArray(data.videos)) return;
      setVideos(
        Object.fromEntries(
          data.videos
            .filter(
              (video: unknown): video is MuxVideo =>
                Boolean(video) &&
                ["id", "playbackId", "playbackToken", "thumbnailToken", "storyboardToken"].every(
                  (key) => typeof (video as Record<string, unknown>)[key] === "string",
                ),
            )
            .map((video) => [video.id, video]),
        ),
      );
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="border-border/70 bg-card/80 relative overflow-hidden rounded-2xl border p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_80%_30%,oklch(0.66_0.145_253_/_18%),transparent_58%)] lg:block" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-primary flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4" /> Aprende con ArepaTool
            </div>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]">
              Tutoriales de ArepaTool
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
              Guías breves, por módulo y pensadas para que cada proceso se haga
              en el orden correcto.
            </p>
          </div>
          <div className="border-border/70 bg-background/60 flex min-w-34 items-center gap-3 rounded-xl border px-4 py-3 sm:mt-1">
            <span className="bg-primary/12 text-primary flex size-9 items-center justify-center rounded-lg"><MonitorPlay className="size-[18px]" /></span>
            <div>
              <p className="text-base font-semibold">{readyCount} de 8</p>
              <p className="text-muted-foreground text-xs">guías disponibles</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-5 lg:mt-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.72fr)] lg:items-start">
        <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-xl shadow-black/5">
          <div className="border-border/50 bg-muted/30 flex items-center justify-between border-b px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="text-primary text-xs font-medium">Ahora viendo</p>
              <p className="truncate text-sm font-semibold">{selected.title}</p>
            </div>
            <span className="text-muted-foreground bg-background/70 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs"><Clock3 className="size-3" /> {selected.duration}</span>
          </div>
          <div className="bg-muted/45 relative aspect-video overflow-hidden">
            {selectedVideo ? (
              <MuxTutorialPlayer video={selectedVideo} title={selected.title} />
            ) : selected.videoSrc ? (
              <video
                className="h-full w-full bg-black object-contain"
                controls
                preload="metadata"
                poster={selected.posterSrc}
              >
                <source src={selected.videoSrc} type="video/mp4" />
                {selected.captionsSrc && (
                  <track
                    kind="subtitles"
                    srcLang="es"
                    label="Español"
                    src={selected.captionsSrc}
                    default
                  />
                )}
                Tu navegador no puede reproducir este video.
              </video>
            ) : (
              <div className="relative flex h-full flex-col items-center justify-center px-7 text-center">
                <span className="bg-primary/12 text-primary flex size-14 items-center justify-center rounded-2xl">
                  <Video className="size-7" />
                </span>
                <p className="mt-4 font-semibold">Video en preparación</p>
                <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                  Este tutorial aparecerá aquí apenas se publique su guía en
                  video.
                </p>
              </div>
            )}
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-primary text-sm font-medium">{selected.module}</p>
                <h3 className="font-display mt-1 text-xl font-bold">
              {selected.title}
                </h3>
              </div>
              {selectedVideo && <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"><CirclePlay className="size-3.5" /> Listo para ver</span>}
            </div>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed sm:text-[0.9375rem]">
              {selected.instruction}
            </p>
            <div className="text-muted-foreground border-border/60 mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" /> {selected.duration}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Captions className="size-3.5" /> Subtítulos en español{" "}
                {selected.captionsSrc ? "disponibles" : "al publicar"}
              </span>
            </div>
          </div>
        </section>

        <aside className="border-border/70 bg-card rounded-2xl border p-2.5 sm:p-3 lg:sticky lg:top-6">
          <div className="flex items-center justify-between px-2.5 py-2.5 sm:px-3 sm:py-3">
            <h3 className="font-display flex items-center gap-2 font-bold"><Layers3 className="text-primary size-4" /> Guías</h3>
            <span className="text-muted-foreground text-xs">Selecciona una</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:max-h-[34rem] lg:grid-cols-1 lg:space-y-1 lg:overflow-y-auto lg:pr-1">
            {tutorials.map((tutorial, index) => {
              const isSelected = tutorial.id === selected.id;
              return (
                <button
                  key={tutorial.id}
                  type="button"
                  onClick={() => setSelectedId(tutorial.id)}
                  className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors sm:px-3 sm:py-3 ${isSelected ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15" : "hover:bg-muted text-foreground"}`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold sm:size-8 ${isSelected ? "bg-white/15" : "bg-muted text-muted-foreground group-hover:bg-background"}`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block line-clamp-2 text-xs font-medium leading-snug sm:text-sm lg:truncate">
                      {tutorial.title}
                    </span>
                    <span
                      className={`mt-1 block truncate text-[0.68rem] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {tutorial.module}
                    </span>
                  </span>
                  {videos[tutorial.id] || tutorial.videoSrc ? (
                    <CheckCircle2 className="hidden size-4 shrink-0 lg:block" />
                  ) : isSelected ? (
                    <Play className="hidden size-4 shrink-0 lg:block" />
                  ) : (
                    <ChevronRight className="text-muted-foreground hidden size-4 shrink-0 lg:block" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      <p className="text-muted-foreground mt-5 flex items-start gap-2 text-xs leading-relaxed">
        <CirclePlay className="mt-0.5 size-3.5 shrink-0" /> Cada video puede
        incluir subtítulos en español. Actívalos con el botón CC del reproductor
        cuando estén disponibles.
      </p>
    </div>
  );
}
