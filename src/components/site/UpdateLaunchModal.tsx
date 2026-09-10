import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function UpdateLaunchModal() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[min(92vw,54rem)] max-w-none gap-0 overflow-hidden border-primary/45 bg-[#070d16] p-0 shadow-2xl shadow-black/80 sm:w-[min(90vw,58rem)]" aria-describedby={undefined}>
        <DialogTitle className="sr-only">ArepaTool v2.2.2 ya está disponible</DialogTitle>
        <img
          src="/pngs/arepatool-v2.2.2-update.png"
          alt="ArepaTool v2.2.2: actualización con soporte Infinix, Tecno e Itel"
          className="block max-h-[72vh] w-full object-contain"
        />
        <p className="border-primary/25 border-t bg-[#090f19] px-6 py-4 text-center font-display text-sm font-bold tracking-tight text-foreground sm:text-base">
          🚀 ArepaTool v2.2.2 ya está disponible
        </p>
      </DialogContent>
    </Dialog>
  );
}
