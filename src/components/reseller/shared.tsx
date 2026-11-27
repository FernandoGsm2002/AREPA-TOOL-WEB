import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, Copy, Download, LoaderCircle, X } from "lucide-react";
import {
  ResellerApiError,
  type ResellerLanguage,
} from "../../lib/reseller-api";
import { validateReportDates, type ReportDates } from "./report-dates";
import { translator, type Translator } from "../../lib/reseller-i18n";
export const ResellerContext = createContext<{
  language: ResellerLanguage;
  t: Translator;
}>({ language: "es", t: translator("es") });
export const useReseller = () => useContext(ResellerContext);
export function errorText(error: unknown, t: Translator): string {
  if (error instanceof ResellerApiError) {
    if (error.code === "ENROLLMENT_UNAVAILABLE")
      return t("enrollmentApprovalRequired");
    if (
      [
        "SESSION_REQUIRED",
        "SESSION_EXPIRED",
        "INVALID_SESSION",
        "UNAUTHORIZED",
      ].includes(error.code)
    )
      return t("sessionExpired");
    if (["NETWORK_ERROR", "TIMEOUT", "INVALID_RESPONSE"].includes(error.code))
      return t("network");
    return error.message || t("failed");
  }
  return t("failed");
}
export function useResource<T>(load: () => Promise<T>, key = "") {
  const [state, setState] = useState<{
    data?: T;
    error?: unknown;
    loading: boolean;
  }>({ loading: true });
  const [version, setVersion] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    let active = true;
    setState({ loading: true });
    loadRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false });
      })
      .catch((error) => {
        if (active) setState({ error, loading: false });
      });
    return () => {
      active = false;
    };
  }, [key, version]);
  return { ...state, refresh: () => setVersion((value) => value + 1) };
}
export function Notice({
  children,
  tone = "error",
}: {
  children?: ReactNode;
  tone?: "error" | "success" | "info" | "warning";
}) {
  if (!children) return null;
  return (
    <div
      className={`rs-notice rs-notice--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Loading() {
  const { t } = useReseller();
  return (
    <div className="rs-loading" role="status">
      <LoaderCircle aria-hidden="true" className="rs-spin" size={19} />
      {t("loading")}
    </div>
  );
}
export function ResourceState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error?: unknown;
  retry: () => void;
}) {
  const { t } = useReseller();
  if (loading) return <Loading />;
  return error ? (
    <div className="rs-stack">
      <Notice>{errorText(error, t)}</Notice>
      <button className="rs-button rs-secondary" onClick={retry}>
        {t("retry")}
      </button>
    </div>
  ) : null;
}
export function Empty({ children }: { children?: ReactNode }) {
  const { t } = useReseller();
  return <p className="rs-empty">{children || t("empty")}</p>;
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="rs-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function CodeField({
  value,
  onChange,
  recovery = false,
  label,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  recovery?: boolean;
}) {
  const { t } = useReseller();
  return (
    <Field label={label || t(recovery ? "code" : "authenticatorCode")}>
      <input
        autoComplete="one-time-code"
        inputMode={recovery ? "text" : "numeric"}
        pattern={recovery ? undefined : "[0-9]{6}"}
        minLength={recovery ? undefined : 6}
        maxLength={recovery ? 64 : 6}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rs-code-input"
      />
    </Field>
  );
}
export function LanguageSelect({
  language,
  onChange,
  disabled = false,
}: {
  language: ResellerLanguage;
  onChange: (value: ResellerLanguage) => void;
  disabled?: boolean;
}) {
  const { t } = useReseller();
  const id = useId();
  return (
    <div className="rs-language">
      <label htmlFor={id}>{t("language")}</label>
      <select
        id={id}
        aria-label={t("language")}
        value={language}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as ResellerLanguage)}
      >
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="pt-br">Português</option>
      </select>
    </div>
  );
}
export function downloadText(filename: string, contents: string) {
  const url = URL.createObjectURL(
    new Blob([contents], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function CopyButton({ text }: { text: string }) {
  const { t } = useReseller();
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  return (
    <span className="rs-copy">
      <button
        type="button"
        className="rs-button rs-secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setState("done");
          } catch {
            setState("error");
          }
        }}
      >
        {state === "done" ? (
          <Check size={15} aria-hidden="true" />
        ) : (
          <Copy size={15} aria-hidden="true" />
        )}
        {t(state === "done" ? "copied" : "copy")}
      </button>
      {state === "error" && <span role="alert">{t("copyFailed")}</span>}
    </span>
  );
}
export function SecretCodes({
  codes,
  onDone,
}: {
  codes: string[];
  onDone: () => void;
}) {
  const { t } = useReseller();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (saved) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saved]);
  return (
    <section className="rs-stack">
      <h2>{t("recoveryTitle")}</h2>
      <p className="rs-muted">{t("recoveryHelp")}</p>
      <ul className="rs-recovery-codes">
        {codes.map((code) => (
          <li key={code}>
            <code>{code}</code>
          </li>
        ))}
      </ul>
      <div className="rs-actions">
        <CopyButton text={codes.join("\n")} />
        <button
          className="rs-button rs-secondary"
          onClick={() =>
            downloadText("arepatool-recovery-codes.txt", codes.join("\n"))
          }
        >
          <Download size={16} aria-hidden="true" />
          {t("download")}
        </button>
      </div>
      <label className="rs-check">
        <input
          type="checkbox"
          checked={saved}
          onChange={(e) => setSaved(e.target.checked)}
        />
        {t("recoverySaved")}
      </label>
      <button className="rs-button" disabled={!saved} onClick={onDone}>
        {t("continue")}
      </button>
    </section>
  );
}
export function Modal({
  title,
  children,
  onClose,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const { t } = useReseller();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="rs-modal"
      aria-labelledby={headingId}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="rs-modal-header">
        <h2 id={headingId}>{title}</h2>
        <button
          type="button"
          className="rs-icon-button"
          aria-label={t("close")}
          onClick={onClose}
          disabled={busy}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function DateFilter({
  onApply,
  initialDates = {},
}: {
  onApply: (dates: ReportDates) => void;
  initialDates?: ReportDates;
}) {
  const { t } = useReseller();
  const [from, setFrom] = useState(initialDates.from || "");
  const [to, setTo] = useState(initialDates.to || "");
  const [error, setError] = useState("");
  return (
    <form
      className="rs-date-filter"
      onSubmit={(e) => {
        e.preventDefault();
        const invalid = validateReportDates({ from, to });
        if (invalid) {
          setError(t(invalid));
          return;
        }
        setError("");
        onApply({ from: from || undefined, to: to || undefined });
      }}
    >
      <Field label={t("from")}>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </Field>
      <Field label={t("to")}>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
        />
      </Field>
      <button className="rs-button rs-secondary" type="submit">
        {t("apply")}
      </button>
      {error && <Notice>{error}</Notice>}
    </form>
  );
}
export function Table({
  label,
  headings,
  children,
}: {
  label: string;
  headings: string[];
  children: ReactNode;
}) {
  return (
    <div
      className="rs-table-region"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <table>
        <caption className="rs-sr-only">{label}</caption>
        <thead>
          <tr>
            {headings.map((heading, index) => (
              <th scope="col" key={`${heading}-${index}`}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const { t } = useReseller();
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  return (
    <nav className="rs-pagination" aria-label={t("page")}>
      <button
        className="rs-button rs-secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t("previous")}
      </button>
      <span>
        {t("page")} {page} {t("of")} {pages}
      </span>
      <button
        className="rs-button rs-secondary"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        {t("next")}
      </button>
    </nav>
  );
}
