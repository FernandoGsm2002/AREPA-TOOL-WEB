import { useState } from "react";
import { CheckCircle2, Rocket, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { modalCopy, type Locale } from "@/lib/i18n";

export default function UpdateLaunchModal({ locale = "es" }: { locale?: Locale }) {
  const [open, setOpen] = useState(true);
  const copy = modalCopy[locale];
  const reopenLabel = locale === "es" ? "Novedades 3.0.9" : locale === "pt-br" ? "Novidades 3.0.9" : "What’s new in 3.0.9";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="w-[calc(100vw-1rem)] max-w-none max-h-[calc(100dvh-1rem)] gap-0 overflow-y-auto rounded-[1.35rem] border-emerald-400/35 bg-[#07150f] p-0 text-white shadow-2xl shadow-red-900/30 sm:w-[min(94vw,58rem)] sm:max-h-[calc(100vh-2rem)]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{copy.updateTitle}</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="sticky top-3 z-20 ml-auto mr-3 mt-3 -mb-12 flex size-10 items-center justify-center rounded-full border border-emerald-200/30 bg-[#07150f]/90 text-emerald-50 shadow-lg shadow-emerald-900/30 backdrop-blur transition-colors hover:bg-[#133322] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              aria-label={locale === "es" ? "Cerrar anuncio" : locale === "en" ? "Close announcement" : "Fechar anúncio"}
            >
              <X className="size-5" />
            </button>
          </DialogClose>
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(187,45,50,.28),transparent_36%),radial-gradient(circle_at_85%_20%,rgba(63,164,106,.24),transparent_32%),linear-gradient(135deg,#07150f,#10271b_55%,#07150f)] px-6 py-7 text-center sm:px-12 sm:py-9">
            <img src="/pngs/windowslog-christmas.png" alt="" className="pointer-events-none absolute -right-6 -bottom-14 w-36 opacity-60 sm:right-4 sm:-bottom-16 sm:w-48" />
            <p className="relative text-sm font-black uppercase tracking-[0.28em] text-emerald-200">🎄 AREPATOOL · CHRISTMAS EDITION 🎄</p>
            <p className="relative mt-3 font-display text-5xl font-black tracking-[-0.08em] text-white sm:text-7xl">v3.0.9</p>
            <p className="relative mx-auto mt-3 max-w-xl text-sm font-semibold text-emerald-50/85 sm:text-base">{copy.updateHeading}</p>
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-emerald-300/20 bg-[#0c1e14] px-6 py-4 text-center">
            <Rocket className="size-5 shrink-0 text-red-300" />
            <p className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
              {copy.updateTitle}
            </p>
          </div>
          <section className="border-t border-emerald-300/20 bg-[#07150f] px-5 py-5 text-left sm:px-7">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
              <div className="space-y-3 text-sm leading-6 text-slate-200">
                <h2 className="font-display font-bold text-emerald-200">{copy.updateHeading}</h2>
                <p>{copy.updateIntro}</p>
                <ul className="list-disc space-y-2 pl-5 text-slate-200 marker:text-red-300">
                  {copy.updateBullets.map((bullet) => <li>{bullet}</li>)}
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
          className="fixed bottom-5 left-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-emerald-400/40 bg-[#07150f] px-4 text-sm font-semibold text-emerald-100 shadow-lg shadow-emerald-900/30 transition-colors hover:bg-[#133322] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
          aria-label={reopenLabel}
          title={reopenLabel}
        >
          <Rocket className="size-5 shrink-0 text-red-300" />
          <span>{reopenLabel}</span>
        </button>
      )}
    </>
  );
}
