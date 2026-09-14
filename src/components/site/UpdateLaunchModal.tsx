import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function UpdateLaunchModal() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="w-[calc(100vw-1rem)] max-w-none max-h-[calc(100dvh-1rem)] gap-0 overflow-y-auto border-primary/45 bg-[#070d16] p-0 shadow-2xl shadow-black/80 sm:w-[min(94vw,62rem)] sm:max-h-[calc(100vh-2rem)]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">ArepaTool v2.2.3 ya está disponible</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="sticky top-2 z-20 ml-auto mr-2 mt-2 -mb-11 flex size-11 items-center justify-center rounded-full border border-white/20 bg-[#070d16]/95 text-white shadow-lg shadow-black/40 backdrop-blur transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Cerrar anuncio"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
          <img
            src="/pngs/arepatool-v2.2.3-update.png"
            alt="ArepaTool v2.2.3: Infinix y Tecno bootloader, Samsung Exynos y Unisoc"
            className="block max-h-[44dvh] w-full object-contain sm:max-h-[72vh]"
          />
          <p className="border-primary/25 border-t bg-[#090f19] px-6 py-4 text-center font-display text-sm font-bold tracking-tight text-foreground sm:text-base">
            🚀 ArepaTool v2.2.3 ya está disponible
          </p>
          <section className="border-amber-300/25 bg-amber-300/7 border-t px-5 py-5 text-left sm:px-7">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" />
              <div className="space-y-3 text-sm leading-6 text-foreground/86">
                <h2 className="font-display font-bold text-amber-200">Advertencia — ROM Patch Transsion</h2>
                <p>Para equipos Infinix, Tecno e Itel, verifica que la ROM Patch corresponda exactamente al modelo y versión de Android del dispositivo.</p>
                <ul className="list-disc space-y-1 pl-5 text-foreground/76">
                  <li>Existe riesgo de bootloop o brick si el equipo rechaza el firmware o se usa una ROM incompatible.</li>
                  <li>Para mayor seguridad, se recomienda contar con una herramienta de flash vía BROM, como Android Multi Tool (AMT), para recuperación si fuese necesaria.</li>
                  <li>El soporte puede orientarte si el proceso presenta inconvenientes.</li>
                </ul>
                <p className="font-semibold text-amber-100">🔒 Importante: ArepaTool no desbloquea el bootloader. El equipo debe tenerlo desbloqueado antes de aplicar cualquier ROM Patch.</p>
              </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-amber-300/45 bg-[#12120d] px-4 text-sm font-semibold text-amber-100 shadow-lg shadow-black/40 transition-colors hover:bg-amber-300/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          aria-label="Abrir aviso de ROM Patch"
          title="Aviso de ROM Patch"
        >
          <AlertTriangle className="size-5 shrink-0 text-amber-300" />
          <span>Anuncio importante</span>
        </button>
      )}
    </>
  );
}
