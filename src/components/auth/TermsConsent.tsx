import { useState } from "react";
import { ArrowLeft, Check, FileText, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { localeOptions, type Locale } from "@/lib/i18n";
import { TERMS_VERSION, termsCopy } from "@/lib/terms-copy";

type Props = {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  initialLocale?: Locale;
  disabled?: boolean;
};

export default function TermsConsent({
  accepted,
  onAcceptedChange,
  initialLocale = "es",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const copy = termsCopy[locale];

  const accept = () => {
    onAcceptedChange(true);
    setOpen(false);
  };

  const decline = () => {
    onAcceptedChange(false);
    setOpen(false);
  };

  return (
    <>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-muted-foreground">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          disabled={disabled}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span>
          {copy.checkboxPrefix}{" "}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {copy.termsLink}
          </button>{" "}
          {copy.checkboxSuffix}
        </span>
      </label>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="grid max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-2xl border border-amber-300/30 bg-[#0b141d] p-0 text-slate-100 shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:max-h-[calc(100dvh-2rem)] sm:w-[min(94vw,48rem)]"
        >
          <header className="border-b border-white/10 bg-[#0e1a25] px-5 py-4 sm:px-7">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300/10 text-amber-300">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading font-bold text-white">ArepaTool</p>
                  <p className="font-mono text-[.58rem] uppercase tracking-[.14em] text-amber-300/80">
                    Terms · {TERMS_VERSION}
                  </p>
                </div>
              </div>
              <div className="flex items-center border border-white/10 bg-[#09121b] p-1" aria-label="Language">
                {localeOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setLocale(option.code)}
                    className={`px-2.5 py-1.5 text-xs font-bold transition-colors ${
                      locale === option.code ? "bg-amber-400 text-[#17202a]" : "text-slate-300 hover:text-white"
                    }`}
                    aria-pressed={locale === option.code}
                  >
                    {option.short}
                  </button>
                ))}
              </div>
            </div>
            <DialogTitle className="font-heading text-xl font-bold leading-tight text-white sm:text-2xl">
              {copy.documentTitle}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {copy.documentIntro}
            </DialogDescription>
          </header>

          <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <div className="space-y-7">
              {copy.sections.map((section, index) => (
                <section key={section.title} className="grid gap-3 sm:grid-cols-[2rem_minmax(0,1fr)]">
                  <span className="font-mono text-xs font-bold text-amber-300/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-heading text-base font-bold text-white">{section.title}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-3 text-sm leading-6 text-slate-300">
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets && (
                      <ul className="mt-3 space-y-2">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3 text-sm leading-6 text-slate-300">
                            <Check className="mt-1 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-white/10 bg-[#0e1a25] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center justify-center gap-2 border border-white/15 px-5 text-sm font-semibold text-slate-300 hover:border-white/30 hover:bg-white/[.05] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {copy.back}
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={decline}
                className="h-11 border border-red-300/30 px-5 text-sm font-semibold text-red-200 hover:bg-red-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
              >
                {copy.decline}
              </button>
              <button
                type="button"
                onClick={accept}
                className="inline-flex h-11 items-center justify-center gap-2 bg-amber-400 px-6 text-sm font-bold text-[#17202a] hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
              >
                <FileText className="size-4" aria-hidden="true" />
                {copy.accept}
              </button>
            </div>
          </footer>
        </DialogContent>
      </Dialog>
    </>
  );
}
