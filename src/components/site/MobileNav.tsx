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
import { getLocaleCopy, getNavLinks, localeOptions, localizedPath, type Locale } from "@/lib/i18n";

export default function MobileNav({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const copy = getLocaleCopy(locale);
  const navLinks = getNavLinks(locale);

  function changeLanguage(nextLocale: Locale) {
    window.location.href = localizedPath(nextLocale, window.location.pathname);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="mobile-sheet-brand">
            <span className="mobile-sheet-brand__logo" aria-hidden="true">
              <img src="/pngs/arepatool-logo-mark.png" alt="" />
            </span>
            <span>
              <strong>ArepaTool</strong>
              <small>MDM Tool</small>
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={localizedPath(locale, link.href)}
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
            {copy.nav.whatsapp}
          </Button>
          <Button variant="outline" asChild>
            <a href="/login">
              <LogIn className="size-4" />
              {copy.nav.login}
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="/register">
              <UserPlus className="size-4" />
              {copy.nav.register}
            </a>
          </Button>
          <label className="mt-2 flex items-center justify-between gap-3 px-3 text-xs font-semibold text-muted-foreground">
            <span>{copy.language}</span>
            <select
              className="rounded-lg border border-primary/30 bg-background px-2 py-2 text-xs text-foreground"
              value={locale}
              onChange={(event) => changeLanguage(event.target.value as Locale)}
              aria-label={copy.language}
            >
              {localeOptions.map((option) => <option value={option.code} key={option.code}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </SheetContent>
    </Sheet>
  );
}
