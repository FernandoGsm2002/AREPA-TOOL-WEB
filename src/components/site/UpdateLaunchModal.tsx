import { useState } from "react";
import { CheckCircle2, Rocket, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { modalCopy, type Locale } from "@/lib/i18n";

export default function UpdateLaunchModal({ locale = "es" }: { locale?: Locale }) {
  const [open, setOpen] = useState(true);
  const copy = modalCopy[locale];
  const reopenLabel = locale === "es" ? "Novedades 3.1.0" : locale === "pt-br" ? "Novidades 3.1.0" : "What’s new in 3.1.0";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="w-[calc(100vw-1rem)] max-w-none max-h-[calc(100dvh-1rem)] gap-0 overflow-y-auto rounded-[1.35rem] border-white/15 bg-[#101112] p-0 text-white shadow-2xl shadow-black/40 sm:w-[min(94vw,58rem)] sm:max-h-[calc(100vh-2rem)]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{copy.updateTitle}</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="sticky top-3 z-20 ml-auto mr-3 mt-3 -mb-12 flex size-10 items-center justify-center rounded-full border border-white/20 bg-[#101112] text-white shadow-lg transition-colors hover:bg-[#242526] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
              aria-label={locale === "es" ? "Cerrar anuncio" : locale === "en" ? "Close announcement" : "Fechar anúncio"}
            >
              <X className="size-5" />
            </button>
          </DialogClose>
          <img
            src="/pngs/arepatool-v3.1.0-update.png"
            alt={copy.updateTitle}
            width={1024}
            height={1536}
            className="block h-auto w-full"
          />
          <div className="flex items-center justify-center gap-2 border-t border-white/15 bg-[#171819] px-6 py-4 text-center">
            <Rocket className="size-5 shrink-0 text-amber-300" />
            <p className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
              {copy.updateTitle}
            </p>
          </div>
          <section className="border-t border-white/15 bg-[#101112] px-5 py-5 text-left sm:px-7">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-amber-300" />
              <div className="space-y-3 text-sm leading-6 text-slate-200">
                <h2 className="font-display font-bold text-amber-200">{copy.updateHeading}</h2>
                <p>{copy.updateIntro}</p>
                <ul className="list-disc space-y-2 pl-5 text-slate-200 marker:text-amber-300">
                  {copy.updateBullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
                <p className="font-semibold text-amber-200">{copy.updateImportant}</p>
              </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="site-update-trigger fixed bottom-5 left-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-[#171819] px-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#242526] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          aria-label={reopenLabel}
          title={reopenLabel}
        >
          <Rocket className="size-5 shrink-0 text-amber-300" />
          <span>{reopenLabel}</span>
        </button>
      )}
    </>
  );
}
