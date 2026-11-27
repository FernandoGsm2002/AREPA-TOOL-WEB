import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Download, ShoppingBag } from "lucide-react";
import {
  resellerApi,
  ResellerApiError,
  type Order,
  type Quote,
  type QuoteInput,
  type Money,
} from "../../lib/reseller-api";
import { dateTime, money } from "../../lib/reseller-i18n";
import {
  CopyButton,
  Field,
  Notice,
  Table,
  downloadText,
  errorText,
  useReseller,
} from "./shared";
import {
  readPendingOrder,
  rememberPendingOrder,
  forgetPendingOrder,
} from "./pending-order";
export default function Orders({
  resellerId,
  onBalance,
}: {
  resellerId: string;
  onBalance: (balance: Money) => void;
}) {
  const { t, language } = useReseller();
  const [kind, setKind] = useState<QuoteInput["kind"]>("license");
  const [months, setMonths] = useState<3 | 6 | 12>(3);
  const [mode, setMode] = useState<"activation" | "extension">("activation");
  const [identifier, setIdentifier] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [pendingId, setPendingId] = useState<string | undefined>(() =>
    readPendingOrder(resellerId),
  );
  const [quote, setQuote] = useState<Quote>();
  const [order, setOrder] = useState<Order>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [uncertain, setUncertain] = useState(false);
  const [expired, setExpired] = useState(false);
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  useEffect(() => {
    if (!quote) return;
    const update = () =>
      setExpired(new Date(quote.expiresAt).getTime() <= Date.now());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [quote]);
  useEffect(() => {
    if (!uncertain && !busy && !(order?.accounts?.length && !credentialsSaved))
      return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uncertain, busy, order, credentialsSaved]);
  async function requestQuote(event: FormEvent) {
    event.preventDefault();
    if (busy || uncertain || pendingId) return;
    setBusy(true);
    setError(undefined);
    try {
      const result = await resellerApi("quote", {
        kind,
        quantity: kind === "license" ? 1 : Number(quantity),
        ...(kind !== "rental" ? { identifier: identifier.trim() } : {}),
        ...(kind === "license" ? { months, mode } : {}),
      });
      setQuote(result.quote);
      setOrder(undefined);
      setExpired(false);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  async function confirm() {
    const quoteId = quote?.quoteId || pendingId;
    if (!quoteId || busy) return;
    rememberPendingOrder(resellerId, quoteId);
    setPendingId(quoteId);
    setBusy(true);
    setError(undefined);
    try {
      // This quoteId remains unchanged after a timeout/transport failure, including after quote expiry.
      const result = await resellerApi("confirm", { quoteId });
      forgetPendingOrder(resellerId);
      setPendingId(undefined);
      setOrder(result.order);
      onBalance(result.order.balanceAfter);
      setUncertain(false);
      setQuote(undefined);
      setCredentialsSaved(false);
    } catch (error) {
      setError(error);
      const unresolved =
        !(error instanceof ResellerApiError) ||
        error.uncertain ||
        error.status === 401 ||
        error.status === 403;
      setUncertain(unresolved);
      if (!unresolved) {
        forgetPendingOrder(resellerId);
        setPendingId(undefined);
      }
    } finally {
      setBusy(false);
    }
  }
  const accountText =
    order?.accounts
      ?.map(
        (account) =>
          `${t("username")}: ${account.username}\n${t("email")}: ${account.email}\n${t("password")}: ${account.password}`,
      )
      .join("\n\n") || "";
  const insufficient = quote ? Number(quote.balanceAfter) < 0 : false;
  return (
    <div className="rs-order-layout">
      <section className="rs-panel">
        <h2>
          <ShoppingBag size={20} aria-hidden="true" />
          {t("newOrder")}
        </h2>
        <form onSubmit={requestQuote}>
          <fieldset
            disabled={busy || !!quote || !!order || !!pendingId}
            className="rs-stack"
          >
            <Field label={t("kind")}>
              <select
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value as QuoteInput["kind"]);
                  setQuantity("1");
                }}
              >
                <option value="license">{t("license")}</option>
                <option value="credits">{t("credits")}</option>
                <option value="rental">{t("rental")}</option>
              </select>
            </Field>
            {kind === "license" && (
              <div className="rs-form-grid">
                <Field label={t("duration")}>
                  <select
                    value={months}
                    onChange={(e) =>
                      setMonths(Number(e.target.value) as 3 | 6 | 12)
                    }
                  >
                    {[3, 6, 12].map((value) => (
                      <option key={value} value={value}>
                        {value} {t("months")}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("operation")}>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as typeof mode)}
                  >
                    <option value="activation">{t("activation")}</option>
                    <option value="extension">{t("extension")}</option>
                  </select>
                </Field>
              </div>
            )}
            {kind !== "rental" && (
              <Field label={t("identifier")}>
                <input
                  required
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </Field>
            )}
            {kind !== "license" && (
              <Field label={t("quantity")}>
                <input
                  type="number"
                  required
                  min="1"
                  max={kind === "rental" ? 50 : 100000}
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Field>
            )}
            {kind === "rental" && <p className="rs-muted">{t("rentalHelp")}</p>}
            <button className="rs-button" type="submit">
              {busy && !quote ? t("loading") : t("quote")}
            </button>
          </fieldset>
        </form>
      </section>
      <section
        className="rs-panel rs-order-review"
        aria-live="polite"
        aria-busy={busy}
      >
        <Notice>{error ? errorText(error, t) : null}</Notice>
        {pendingId && !quote && !order ? (
          <>
            <h2>{t("recoverPurchase")}</h2>
            <Notice tone="warning">{t("purchaseUncertain")}</Notice>
            <code>{pendingId}</code>
            <button className="rs-button" disabled={busy} onClick={confirm}>
              {t(busy ? "confirming" : "retryPurchase")}
            </button>
          </>
        ) : quote ? (
          <>
            <h2>{t("review")}</h2>
            <dl className="rs-ledger">
              <div>
                <dt>{t("kind")}</dt>
                <dd>{t(quote.kind)}</dd>
              </div>
              {quote.customer && (
                <div>
                  <dt>{t("customer")}</dt>
                  <dd>
                    {quote.customer.username}
                    <small>{quote.customer.email}</small>
                  </dd>
                </div>
              )}
              {quote.months && (
                <div>
                  <dt>{t("duration")}</dt>
                  <dd>
                    {quote.months} {t("months")}
                  </dd>
                </div>
              )}
              {kind === "license" && (
                <div>
                  <dt>{t("operation")}</dt>
                  <dd>{t(mode)}</dd>
                </div>
              )}
              <div>
                <dt>{t("quantity")}</dt>
                <dd>{quote.quantity}</dd>
              </div>
              <div>
                <dt>{t("unitPrice")}</dt>
                <dd>{money(quote.unitPrice, language)}</dd>
              </div>
              <div className="rs-ledger-total">
                <dt>{t("total")}</dt>
                <dd>{money(quote.total, language)}</dd>
              </div>
              <div>
                <dt>{t("before")}</dt>
                <dd>{money(quote.balanceBefore, language)}</dd>
              </div>
              <div>
                <dt>{t("after")}</dt>
                <dd>{money(quote.balanceAfter, language)}</dd>
              </div>
            </dl>
            <p className="rs-small rs-muted">
              {t("quoteUntil")} {dateTime(quote.expiresAt, language)}
            </p>
            {uncertain ? (
              <Notice tone="warning">{t("purchaseUncertain")}</Notice>
            ) : expired ? (
              <Notice tone="warning">{t("quoteExpired")}</Notice>
            ) : insufficient ? (
              <Notice>{t("insufficient")}</Notice>
            ) : null}
            <div className="rs-actions">
              <button
                className="rs-button"
                disabled={busy || (!uncertain && (expired || insufficient))}
                onClick={confirm}
              >
                {t(
                  busy ? "confirming" : uncertain ? "retryPurchase" : "confirm",
                )}
              </button>
              <button
                className="rs-button rs-secondary"
                disabled={busy || uncertain}
                onClick={() => {
                  setQuote(undefined);
                  setError(undefined);
                }}
              >
                {t("cancel")}
              </button>
            </div>
          </>
        ) : order ? (
          <>
            <span className="rs-success-icon">
              <CheckCircle2 size={28} aria-hidden="true" />
            </span>
            <h2>{t("orderDone")}</h2>
            {order.credentialsExpired && (
              <Notice tone="warning">{t("credentialsExpired")}</Notice>
            )}
            <dl className="rs-ledger">
              <div>
                <dt>{t("reference")}</dt>
                <dd>
                  <code>{order.referenceId}</code>
                </dd>
              </div>
              <div>
                <dt>{t("total")}</dt>
                <dd>{money(order.total, language)}</dd>
              </div>
              <div>
                <dt>{t("before")}</dt>
                <dd>{money(order.balanceBefore, language)}</dd>
              </div>
              <div>
                <dt>{t("after")}</dt>
                <dd>{money(order.balanceAfter, language)}</dd>
              </div>
            </dl>
            {!!order.accounts?.length && (
              <div className="rs-stack">
                <h3>{t("accounts")}</h3>
                <Notice tone="warning">{t("credentialsHelp")}</Notice>
                <Table
                  label={t("accounts")}
                  headings={[t("username"), t("email"), t("password")]}
                >
                  {order.accounts.map((account, index) => (
                    <tr key={index}>
                      <td>
                        <code>{account.username}</code>
                      </td>
                      <td>{account.email}</td>
                      <td>
                        <code>{account.password}</code>
                      </td>
                    </tr>
                  ))}
                </Table>
                <div className="rs-actions">
                  <CopyButton text={accountText} />
                  <button
                    className="rs-button rs-secondary"
                    onClick={() =>
                      downloadText(
                        "arepatool-rental-accounts.txt",
                        `${t("reference")}: ${order.referenceId}\n\n${accountText}`,
                      )
                    }
                  >
                    <Download aria-hidden="true" size={16} />
                    {t("download")}
                  </button>
                </div>
                <label className="rs-check">
                  <input
                    type="checkbox"
                    checked={credentialsSaved}
                    onChange={(e) => setCredentialsSaved(e.target.checked)}
                  />
                  {t("credentialsSaved")}
                </label>
              </div>
            )}
            <button
              className="rs-button"
              disabled={!!order.accounts?.length && !credentialsSaved}
              onClick={() => {
                setOrder(undefined);
                setError(undefined);
              }}
            >
              {t("newOrder")}
            </button>
          </>
        ) : (
          <div className="rs-review-placeholder">
            <ShoppingBag size={30} aria-hidden="true" />
            <h2>{t("review")}</h2>
            <p>{t("ordersIntro")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
