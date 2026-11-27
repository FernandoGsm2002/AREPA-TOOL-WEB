import { useEffect, useMemo, useRef, useState } from "react";
import {
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
            .map((video: MuxVideo) => [video.id, video]),
        ),
      );
    })();
  }, []);

  return (
    <div className="dashboard-view dashboard-tutorials">
      <header className="dashboard-tutorial-header">
          <div className="min-w-0">
            <h2 className="dashboard-heading">
              Tutoriales de ArepaTool
            </h2>
            <p className="dashboard-description">
              Guías breves, por módulo y pensadas para que cada proceso se haga
              en el orden correcto.
            </p>
            <div className="dashboard-tutorial-intro text-muted-foreground flex items-center gap-2 text-sm">
              <Sparkles className="size-4" /> Aprende con ArepaTool
            </div>
          </div>
          <div className="dashboard-tutorial-count">
            <MonitorPlay className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-base font-semibold">{readyCount} de 8</p>
              <p className="text-muted-foreground text-xs">guías disponibles</p>
            </div>
          </div>
      </header>

      <div className="dashboard-tutorial-layout">
        <section className="dashboard-tutorial-player">
          <div className="dashboard-player-topbar">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Ahora viendo</p>
              <p className="mt-1 text-sm font-medium">{selected.title}</p>
            </div>
            <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1.5 text-xs"><Clock3 className="size-3" /> {selected.duration}</span>
          </div>
          <div className="dashboard-player-media">
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
              <div className="dashboard-video-empty">
                <span className="text-muted-foreground">
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
          <div className="dashboard-tutorial-detail">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="dashboard-section-title">
              {selected.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">{selected.module}</p>
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

        <aside className="dashboard-tutorial-library">
          <div className="dashboard-library-heading">
            <h3 className="flex items-center gap-2 font-medium"><Layers3 className="text-muted-foreground size-4" /> Guías</h3>
            <span className="text-muted-foreground text-xs">Selecciona una</span>
          </div>
          <div className="dashboard-tutorial-list">
            {tutorials.map((tutorial, index) => {
              const isSelected = tutorial.id === selected.id;
              return (
                <button
                  key={tutorial.id}
                  type="button"
                  onClick={() => setSelectedId(tutorial.id)}
                  aria-pressed={isSelected}
                  className="dashboard-tutorial-choice"
                >
                  <span
                    className="dashboard-tutorial-number"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug">
                      {tutorial.title}
                    </span>
                    <span
                      className="dashboard-tutorial-module mt-1 block text-xs"
                    >
                      {tutorial.module}
                    </span>
                  </span>
                  {videos[tutorial.id] || tutorial.videoSrc ? (
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                  ) : isSelected ? (
                    <Play className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
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
