import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function UpdateLaunchModal() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(96vw,62rem)] max-w-none gap-0 overflow-y-auto border-primary/45 bg-[#070d16] p-0 shadow-2xl shadow-black/80 sm:w-[min(94vw,62rem)]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">ArepaTool v2.2.2 ya está disponible</DialogTitle>
          <img
            src="/pngs/arepatool-v2.2.2-update.png"
            alt="ArepaTool v2.2.2: actualización con soporte Infinix, Tecno e Itel"
            className="block max-h-[72vh] w-full object-contain"
          />
          <p className="border-primary/25 border-t bg-[#090f19] px-6 py-4 text-center font-display text-sm font-bold tracking-tight text-foreground sm:text-base">
            🚀 ArepaTool v2.2.2 ya está disponible
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
          className="fixed right-5 bottom-5 z-40 inline-flex size-12 items-center justify-center rounded-full border border-amber-300/45 bg-[#12120d] text-amber-200 shadow-lg shadow-black/40 transition-colors hover:bg-amber-300/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          aria-label="Abrir aviso de ROM Patch"
          title="Aviso de ROM Patch"
        >
          <AlertTriangle className="size-5" />
        </button>
      )}
    </>
  );
}
