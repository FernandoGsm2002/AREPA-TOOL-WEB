import { useState, type FormEvent } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import {
  resellerApi,
  type Reseller,
  type Session,
} from "../../lib/reseller-api";
import { dateTime } from "../../lib/reseller-i18n";
import {
  CodeField,
  Empty,
  Field,
  Modal,
  Notice,
  ResourceState,
  SecretCodes,
  Table,
  errorText,
  useReseller,
  useResource,
} from "./shared";
type Action =
  | { kind: "password" }
  | { kind: "recovery" }
  | { kind: "revoke"; session: Session };
export default function Security({
  reseller,
  onProfile,
}: {
  reseller: Reseller;
  onProfile: (profile: Partial<Reseller>) => void;
}) {
  const { t, language } = useReseller();
  const resource = useResource(() => resellerApi("sessions", {}));
  const [action, setAction] = useState<Action>();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [validation, setValidation] = useState("");
  const [success, setSuccess] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(
    reseller.lowBalanceThreshold == null
      ? ""
      : String(reseller.lowBalanceThreshold),
  );
  const [prefBusy, setPrefBusy] = useState(false);
  const [prefError, setPrefError] = useState<unknown>();
  const [prefSaved, setPrefSaved] = useState(false);
  function begin(value: Action) {
    setAction(value);
    setCode("");
    setPassword("");
    setPasswordAgain("");
    setError(undefined);
    setValidation("");
    setSuccess(false);
  }
  function close() {
    setAction(undefined);
    setCode("");
    setPassword("");
    setPasswordAgain("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!action || busy) return;
    setValidation("");
    setError(undefined);
    if (action.kind === "password") {
      const bytes = new TextEncoder().encode(password).length;
      if (
        bytes < 12 ||
        bytes > 72 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password)
      ) {
        setValidation(t("passwordLength"));
        return;
      }
      if (password !== passwordAgain) {
        setValidation(t("passwordMismatch"));
        return;
      }
    }
    setBusy(true);
    try {
      if (action.kind === "password") {
        await resellerApi("password", { password, code: code.trim() });
        onProfile({ hasPanelPassword: true });
      } else if (action.kind === "recovery") {
        const result = await resellerApi("recovery-codes", {
          code: code.trim(),
        });
        setRecoveryCodes(result.recoveryCodes);
      } else {
        await resellerApi("sessions/revoke", {
          id: action.session.id,
          code: code.trim(),
        });
        if (action.session.current) {
          window.location.replace("/loginreseller");
          return;
        }
        resource.refresh();
      }
      close();
      setSuccess(true);
    } catch (error) {
      setError(error);
      setCode("");
    } finally {
      setBusy(false);
    }
  }
  async function saveThreshold(event: FormEvent) {
    event.preventDefault();
    if (prefBusy) return;
    setPrefBusy(true);
    setPrefError(undefined);
    setPrefSaved(false);
    try {
      const value = Number(threshold);
      if (
        !threshold.trim() ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100000
      ) {
        setPrefError(new Error(t("invalidAmount")));
        return;
      }
      const result = await resellerApi("preferences", {
        lowBalanceThreshold: value,
      });
      onProfile(result.reseller || { lowBalanceThreshold: value });
      setPrefSaved(true);
    } catch (error) {
      setPrefError(error);
    } finally {
      setPrefBusy(false);
    }
  }
  const title =
    action?.kind === "password"
      ? t("passwordTitle")
      : action?.kind === "recovery"
        ? t("recovery")
        : t("revoke");
  return (
    <div className="rs-stack rs-section-stack">
      {success && <Notice tone="success">{t("saved")}</Notice>}
      <section className="rs-panel rs-security-status">
        <ShieldCheck size={25} aria-hidden="true" />
        <div>
          <h2>{t("twoFactor")}</h2>
          <p className="rs-muted">{t("sensitiveHelp")}</p>
        </div>
        <span className="rs-tag rs-tag--success">{t("enabled")}</span>
      </section>
      <div className="rs-two-columns">
        <section className="rs-panel rs-stack">
          <h2>{t("passwordTitle")}</h2>
          <p className="rs-muted">{t("passwordHelp")}</p>
          <button
            className="rs-button rs-secondary"
            onClick={() => begin({ kind: "password" })}
          >
            <KeyRound size={16} aria-hidden="true" />
            {t("changePassword")}
          </button>
        </section>
        <section className="rs-panel rs-stack">
          <h2>{t("recovery")}</h2>
          <p className="rs-muted">{t("recoveryWarning")}</p>
          <button
            className="rs-button rs-secondary"
            onClick={() => begin({ kind: "recovery" })}
          >
            {t("generateCodes")}
          </button>
        </section>
      </div>
      <section className="rs-panel rs-table-panel">
        <h2>{t("sessions")}</h2>
        <ResourceState {...resource} retry={resource.refresh} />
        {resource.data &&
          (resource.data.items.length ? (
            <Table
              label={t("sessions")}
              headings={[
                t("description"),
                t("ip"),
                t("created"),
                t("lastSeen"),
                t("action"),
              ]}
            >
              {resource.data.items.map((session) => (
                <tr key={session.id}>
                  <td>
                    <span className="rs-user-agent">{session.userAgent}</span>
                    {session.current && (
                      <span className="rs-tag rs-tag--success">
                        {t("currentSession")}
                      </span>
                    )}
                  </td>
                  <td>
                    <code>{session.ip}</code>
                  </td>
                  <td className="rs-date">
                    {dateTime(session.createdAt, language)}
                  </td>
                  <td className="rs-date">
                    {dateTime(session.lastSeenAt, language)}
                  </td>
                  <td>
                    <button
                      className="rs-button rs-secondary"
                      onClick={() => begin({ kind: "revoke", session })}
                    >
                      {t("revoke")}
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <Empty />
          ))}
      </section>
      <section className="rs-panel">
        <h2>{t("preferences")}</h2>
        <form className="rs-preferences rs-stack" onSubmit={saveThreshold}>
          <Notice>{prefError ? errorText(prefError, t) : null}</Notice>
          {prefSaved && <Notice tone="success">{t("saved")}</Notice>}
          <fieldset disabled={prefBusy} className="rs-stack">
            <Field label={t("threshold")} hint={t("thresholdHelp")}>
              <input
                type="number"
                required
                min="0"
                max="100000"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </Field>
            <button className="rs-button" type="submit">
              {t(prefBusy ? "saving" : "save")}
            </button>
          </fieldset>
        </form>
      </section>
      {action && (
        <Modal title={title} busy={busy} onClose={close}>
          <form className="rs-stack" onSubmit={submit}>
            <Notice>
              {validation || (error ? errorText(error, t) : null)}
            </Notice>
            <p className="rs-muted">{t("sensitiveHelp")}</p>
            {action.kind === "recovery" && (
              <Notice tone="warning">{t("recoveryWarning")}</Notice>
            )}
            {action.kind === "revoke" && (
              <p className="rs-plaintext">
                <code>{action.session.ip}</code>
                <br />
                {action.session.userAgent}
              </p>
            )}
            <fieldset disabled={busy} className="rs-stack">
              {action.kind === "password" && (
                <>
                  <Field label={t("newPassword")} hint={t("passwordLength")}>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field label={t("confirmPassword")}>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={passwordAgain}
                      onChange={(e) => setPasswordAgain(e.target.value)}
                    />
                  </Field>
                </>
              )}
              <CodeField value={code} onChange={setCode} />
              <button className="rs-button" type="submit">
                {busy
                  ? t("saving")
                  : action.kind === "password"
                    ? t("changePassword")
                    : action.kind === "recovery"
                      ? t("generateCodes")
                      : t("revoke")}
              </button>
            </fieldset>
          </form>
        </Modal>
      )}
      {recoveryCodes.length > 0 && (
        <Modal title={t("recovery")} busy onClose={() => {}}>
          <SecretCodes
            codes={recoveryCodes}
            onDone={() => setRecoveryCodes([])}
          />
        </Modal>
      )}
    </div>
  );
}
