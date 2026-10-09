import { useState } from "react";
import { CheckCircle2, Rocket, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { modalCopy, type Locale } from "@/lib/i18n";

export default function UpdateLaunchModal({ locale = "es" }: { locale?: Locale }) {
  const [open, setOpen] = useState(true);
  const copy = modalCopy[locale];
  const reopenLabel = locale === "es" ? "Novedades 2.2.7" : locale === "pt-br" ? "Novidades 2.2.7" : "What’s new in 2.2.7";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="w-[calc(100vw-1rem)] max-w-none max-h-[calc(100dvh-1rem)] gap-0 overflow-y-auto rounded-[1.35rem] border-cyan-400/35 bg-[#07121d] p-0 text-white shadow-2xl shadow-cyan-500/20 sm:w-[min(94vw,58rem)] sm:max-h-[calc(100vh-2rem)]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{copy.updateTitle}</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="sticky top-3 z-20 ml-auto mr-3 mt-3 -mb-12 flex size-10 items-center justify-center rounded-full border border-cyan-300/35 bg-[#07121d]/90 text-cyan-100 shadow-lg shadow-cyan-500/20 backdrop-blur transition-colors hover:bg-[#102b42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              aria-label={locale === "es" ? "Cerrar anuncio" : locale === "en" ? "Close announcement" : "Fechar anúncio"}
            >
              <X className="size-5" />
            </button>
          </DialogClose>
          <div className="bg-[#06101a] px-2 pb-2 sm:px-3 sm:pb-3">
            <img
              src="/pngs/arepatool-2.2.7-whats-new.png"
              alt="ArepaTool 2.2.7 — ZTE, Nubia Unisoc y mejoras de Transsion Metamode"
              className="block max-h-[44dvh] w-full rounded-[1rem] border border-cyan-400/25 bg-[#02070c] object-contain shadow-lg shadow-cyan-500/15 sm:max-h-[64vh]"
            />
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-cyan-400/20 bg-[#091827] px-6 py-4 text-center">
            <Rocket className="size-5 shrink-0 text-cyan-300" />
            <p className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
              {copy.updateTitle}
            </p>
          </div>
          <section className="border-t border-cyan-400/20 bg-[#07121d] px-5 py-5 text-left sm:px-7">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cyan-300" />
              <div className="space-y-3 text-sm leading-6 text-slate-300">
                <h2 className="font-display font-bold text-cyan-300">{copy.updateHeading}</h2>
                <p>{copy.updateIntro}</p>
                <ul className="list-disc space-y-1 pl-5 text-slate-300 marker:text-cyan-400">
                  {copy.updateBullets.map((bullet) => <li>{bullet}</li>)}
                </ul>
                <p className="font-semibold text-cyan-100">{copy.updateImportant}</p>
              </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-cyan-400/45 bg-[#07121d] px-4 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-500/20 transition-colors hover:bg-[#102b42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          aria-label={reopenLabel}
          title={reopenLabel}
        >
          <Rocket className="size-5 shrink-0 text-cyan-300" />
          <span>{reopenLabel}</span>
        </button>
      )}
    </>
  );
}
