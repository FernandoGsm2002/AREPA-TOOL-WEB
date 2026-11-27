import { useState, type FormEvent } from "react";
import { KeyRound, Pause, Play, RotateCw } from "lucide-react";
import { resellerApi } from "../../lib/reseller-api";
import { dateTime } from "../../lib/reseller-i18n";
import {
  CodeField,
  CopyButton,
  Empty,
  Modal,
  Notice,
  ResourceState,
  Table,
  errorText,
  useReseller,
  useResource,
} from "./shared";
type Action = "pause" | "key" | "rotate";
export default function ApiConnection({
  onPaused,
}: {
  onPaused: (paused: boolean) => void;
}) {
  const { t, language } = useReseller();
  const resource = useResource(() => resellerApi("api/status", {}));
  const [action, setAction] = useState<Action>();
  const [code, setCode] = useState("");
  const [ack, setAck] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [success, setSuccess] = useState(false);
  const data = resource.data;
  function begin(value: Action) {
    setAction(value);
    setCode("");
    setAck(false);
    setError(undefined);
    setSuccess(false);
    setApiKey("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !action || !data) return;
    setBusy(true);
    setError(undefined);
    try {
      if (action === "pause") {
        await resellerApi("api/pause", {
          paused: !data.api.paused,
          code: code.trim(),
        });
        onPaused(!data.api.paused);
      } else {
        const result = await resellerApi(
          action === "key" ? "api/key" : "api/rotate",
          { code: code.trim() },
        );
        setApiKey(result.apiKey);
      }
      setAction(undefined);
      setCode("");
      setSuccess(true);
      resource.refresh();
    } catch (error) {
      setError(error);
      setCode("");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="rs-stack rs-section-stack">
      <ResourceState {...resource} retry={resource.refresh} />
      {success && <Notice tone="success">{t("saved")}</Notice>}
      {apiKey && (
        <section className="rs-panel rs-stack">
          <h2>{t("apiKey")}</h2>
          <p className="rs-muted">{t("credentialsHelp")}</p>
          <code className="rs-secret">{apiKey}</code>
          <div className="rs-actions">
            <CopyButton text={apiKey} />
            <button
              className="rs-button rs-secondary"
              onClick={() => setApiKey("")}
            >
              {t("hideSecret")}
            </button>
          </div>
        </section>
      )}
      {data && (
        <>
          <section className="rs-panel">
            <div className="rs-section-heading">
              <h2>{t("api")}</h2>
              <span
                className={`rs-tag ${data.api.paused ? "rs-tag--warning" : "rs-tag--success"}`}
              >
                {t(data.api.paused ? "apiPaused" : "apiActive")}
              </span>
            </div>
            <p className="rs-muted rs-reading">{t("pauseHelp")}</p>
            <dl className="rs-ledger">
              <div>
                <dt>{t("endpoint")}</dt>
                <dd>
                  <code>{data.api.url}</code>
                </dd>
              </div>
              <div>
                <dt>{t("username")}</dt>
                <dd>
                  <code>{data.api.username}</code>
                </dd>
              </div>
              <div>
                <dt>{t("lastUsed")}</dt>
                <dd>
                  {data.api.lastUsedAt
                    ? dateTime(data.api.lastUsedAt, language)
                    : t("never")}
                </dd>
              </div>
            </dl>
            <div className="rs-actions">
              <button className="rs-button" onClick={() => begin("pause")}>
                {data.api.paused ? (
                  <Play size={16} aria-hidden="true" />
                ) : (
                  <Pause size={16} aria-hidden="true" />
                )}
                {t(data.api.paused ? "resume" : "pause")}
              </button>
              <button
                className="rs-button rs-secondary"
                onClick={() => begin("key")}
              >
                <KeyRound size={16} aria-hidden="true" />
                {t("revealKey")}
              </button>
              <button
                className="rs-button rs-secondary"
                onClick={() => begin("rotate")}
              >
                <RotateCw size={16} aria-hidden="true" />
                {t("rotateKey")}
              </button>
            </div>
          </section>
          <section className="rs-panel rs-table-panel">
            <h2>{t("recentActivity")}</h2>
            {data.activity.length ? (
              <Table
                label={t("recentActivity")}
                headings={[
                  t("date"),
                  t("action"),
                  t("result"),
                  "HTTP",
                  t("ip"),
                  t("error"),
                ]}
              >
                {data.activity.map((item, index) => (
                  <tr key={index}>
                    <td className="rs-date">
                      {dateTime(item.createdAt, language)}
                    </td>
                    <td>{item.action}</td>
                    <td>
                      <span
                        className={`rs-tag ${item.success ? "rs-tag--success" : "rs-tag--danger"}`}
                      >
                        {t(item.success ? "success" : "error")}
                      </span>
                    </td>
                    <td>{item.httpStatus}</td>
                    <td>
                      <code>{item.ip}</code>
                    </td>
                    <td>{item.error || "—"}</td>
                  </tr>
                ))}
              </Table>
            ) : (
              <Empty>{t("noActivity")}</Empty>
            )}
          </section>
        </>
      )}
      {action && data && (
        <Modal
          title={t(
            action === "pause"
              ? data.api.paused
                ? "resume"
                : "pause"
              : action === "key"
                ? "revealKey"
                : "rotateKey",
          )}
          busy={busy}
          onClose={() => {
            setAction(undefined);
            setCode("");
          }}
        >
          <form className="rs-stack" onSubmit={submit}>
            <Notice>{error ? errorText(error, t) : null}</Notice>
            {action === "rotate" && (
              <Notice tone="warning">{t("rotateWarning")}</Notice>
            )}
            <p className="rs-muted">{t("sensitiveHelp")}</p>
            <fieldset disabled={busy} className="rs-stack">
              <CodeField value={code} onChange={setCode} />
              {action === "rotate" && (
                <label className="rs-check">
                  <input
                    type="checkbox"
                    required
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                  />
                  {t("acknowledgeRotation")}
                </label>
              )}
              <button
                className="rs-button"
                type="submit"
                disabled={action === "rotate" && !ack}
              >
                {busy
                  ? t("saving")
                  : t(
                      action === "pause"
                        ? data.api.paused
                          ? "resume"
                          : "pause"
                        : action === "key"
                          ? "revealKey"
                          : "rotateKey",
                    )}
              </button>
            </fieldset>
          </form>
        </Modal>
      )}
    </div>
  );
}
