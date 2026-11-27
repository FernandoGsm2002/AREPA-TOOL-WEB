import "@/styles/auth.css";
import { useId, useState } from "react";
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
  const consentId = useId();
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
      <div className="auth-consent">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          disabled={disabled}
          id={consentId}
          aria-labelledby={`${consentId}-label`}
        />
        <span id={`${consentId}-label`} className="auth-consent__copy">
          <label htmlFor={consentId}>{copy.checkboxPrefix}</label>{" "}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
            className="auth-consent__link"
          >
            {copy.termsLink}
          </button>{" "}
          <label htmlFor={consentId}>{copy.checkboxSuffix}</label>
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="auth-terms-dialog"
        >
          <header className="auth-terms__header">
            <div className="auth-terms__toolbar">
              <div className="auth-terms__brand">
                <span>
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="auth-terms__name">ArepaTool</p>
                  <p className="auth-terms__version">
                    Terms · {TERMS_VERSION}
                  </p>
                </div>
              </div>
              <div className="auth-terms__languages" aria-label="Language">
                {localeOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setLocale(option.code)}
                    aria-pressed={locale === option.code}
                  >
                    {option.short}
                  </button>
                ))}
              </div>
            </div>
            <DialogTitle>
              {copy.documentTitle}
            </DialogTitle>
            <DialogDescription>
              {copy.documentIntro}
            </DialogDescription>
          </header>

          <div className="auth-terms__body">
            <div className="auth-terms__sections">
              {copy.sections.map((section, index) => (
                <section key={section.title} className="auth-terms__section">
                  <span className="auth-terms__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2>{section.title}</h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph}>
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets && (
                      <ul>
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>
                            <Check className="mt-1 size-4 shrink-0" aria-hidden="true" />
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

          <footer className="auth-terms__footer">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="auth-terms__button"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {copy.back}
            </button>
            <div className="auth-terms__decisions">
              <button
                type="button"
                onClick={decline}
                className="auth-terms__button auth-terms__button--decline"
              >
                {copy.decline}
              </button>
              <button
                type="button"
                onClick={accept}
                className="auth-terms__button auth-terms__button--accept"
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
