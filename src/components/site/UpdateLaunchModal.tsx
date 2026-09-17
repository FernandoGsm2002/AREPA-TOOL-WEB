import { useState } from "react";
import { AlertTriangle, Rocket, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function UpdateLaunchModal() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="w-[calc(100vw-1rem)] max-w-none max-h-[calc(100dvh-1rem)] gap-0 overflow-y-auto rounded-[1.35rem] border-[#e98a24]/45 bg-[#fffaf2] p-0 text-[#34261c] shadow-2xl shadow-[#9b5c1c]/20 sm:w-[min(94vw,58rem)] sm:max-h-[calc(100vh-2rem)]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">ArepaTool v2.2.3 ya está disponible</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="sticky top-3 z-20 ml-auto mr-3 mt-3 -mb-12 flex size-10 items-center justify-center rounded-full border border-[#e98a24]/30 bg-[#fffaf2]/95 text-[#8f4b12] shadow-lg shadow-[#9b5c1c]/15 backdrop-blur transition-colors hover:bg-[#ffe5bf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e98a24]"
              aria-label="Cerrar anuncio"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
          <div className="bg-[#fff0dc] px-2 pb-2 sm:px-3 sm:pb-3">
            <img
              src="/pngs/arepatool-v2.2.3-update.png"
              alt="ArepaTool v2.2.3: Infinix y Tecno bootloader, Samsung Exynos y Unisoc"
              className="block max-h-[44dvh] w-full rounded-[1rem] border border-[#e98a24]/25 bg-[#121820] object-contain shadow-lg shadow-[#9b5c1c]/15 sm:max-h-[64vh]"
            />
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-[#e98a24]/20 bg-[#fffaf2] px-6 py-4 text-center">
            <Rocket className="size-5 shrink-0 text-[#d66e12]" />
            <p className="font-display text-sm font-bold tracking-tight text-[#4b2b14] sm:text-base">
              ArepaTool v2.2.3 ya está disponible
            </p>
          </div>
          <section className="border-t border-[#e98a24]/20 bg-[#fff0dc] px-5 py-5 text-left sm:px-7">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#d66e12]" />
              <div className="space-y-3 text-sm leading-6 text-[#5f4735]">
                <h2 className="font-display font-bold text-[#ad5511]">Advertencia — ROM Patch Transsion</h2>
                <p>Para equipos Infinix, Tecno e Itel, verifica que la ROM Patch corresponda exactamente al modelo y versión de Android del dispositivo.</p>
                <ul className="list-disc space-y-1 pl-5 text-[#745b47]">
                  <li>Existe riesgo de bootloop o brick si el equipo rechaza el firmware o se usa una ROM incompatible.</li>
                  <li>Para mayor seguridad, se recomienda contar con una herramienta de flash vía BROM, como Android Multi Tool (AMT), para recuperación si fuese necesaria.</li>
                  <li>El soporte puede orientarte si el proceso presenta inconvenientes.</li>
                </ul>
                <p className="font-semibold text-[#8f4b12]">Importante: ArepaTool no desbloquea el bootloader. El equipo debe tenerlo desbloqueado antes de aplicar cualquier ROM Patch.</p>
              </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-[#e98a24]/45 bg-[#fff0dc] px-4 text-sm font-semibold text-[#8f4b12] shadow-lg shadow-[#9b5c1c]/20 transition-colors hover:bg-[#ffe0b2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e98a24]"
          aria-label="Abrir aviso de ROM Patch"
          title="Aviso de ROM Patch"
        >
          <AlertTriangle className="size-5 shrink-0 text-[#d66e12]" />
          <span>Anuncio importante</span>
        </button>
      )}
    </>
  );
}
