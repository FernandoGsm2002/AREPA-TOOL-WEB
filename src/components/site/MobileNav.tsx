import { useState } from "react";
import { Menu, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WhatsAppIcon } from "@/components/icons/BrandIcons";
import { navLinks } from "@/lib/site-data";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menú">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex h-14 w-40 items-center overflow-hidden rounded-xl border border-white/8 bg-white/[0.03] px-2">
            <img src="/pngs/arepalanding.png" alt="ArepaTool" className="-my-8 h-32 w-full object-contain" />
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl px-3 py-3 text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 px-4 pb-4">
          <Button
            className="bg-[#25D366] text-white hover:bg-[#1ea952]"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("open-wa-modal"));
            }}
          >
            <WhatsAppIcon className="size-4" />
            Grupo WhatsApp
          </Button>
          <Button variant="outline" asChild>
            <a href="/login">
              <LogIn className="size-4" />
              Iniciar sesión
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="/register">
              <UserPlus className="size-4" />
              Registro
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
