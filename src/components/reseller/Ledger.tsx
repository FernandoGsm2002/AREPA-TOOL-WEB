import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { resellerApi, type LedgerItem } from "../../lib/reseller-api";
import { dateTime, money, type Translator } from "../../lib/reseller-i18n";
import {
  CopyButton,
  DateFilter,
  Empty,
  Field,
  Modal,
  Notice,
  Pagination,
  ResourceState,
  Table,
  downloadText,
  errorText,
  useReseller,
  useResource,
} from "./shared";
function ledgerType(type: string, t: Translator) {
  return ["credit", "debit", "refund", "license", "credits", "rental"].includes(
    type,
  )
    ? t(type as "credit")
    : type;
}
function Receipt({ item, onClose }: { item: LedgerItem; onClose: () => void }) {
  const { t, language } = useReseller();
  const resource = useResource(
    () => resellerApi("receipt", { id: item.id }),
    item.id,
  );
  const receipt = resource.data?.receipt;
  const rows = receipt
    ? [
        [t("reference"), receipt.reference || receipt.id],
        [t("date"), dateTime(receipt.createdAt, language)],
        [t("amount"), money(receipt.amount, language)],
        [t("before"), money(receipt.balanceBefore, language)],
        [t("after"), money(receipt.balanceAfter, language)],
        [t("description"), receipt.description],
        [t("source"), receipt.source],
        [t("username"), receipt.reseller],
      ]
    : [];
  const text = `ArepaTool — ${t("receipt")}\n\n${rows.map(([label, value]) => `${label}: ${value || "—"}`).join("\n")}\n\n${t("receiptDisclaimer")}`;
  return (
    <Modal title={t("receipt")} onClose={onClose}>
      <ResourceState {...resource} retry={resource.refresh} />
      {receipt && (
        <>
          <article className="rs-print-receipt">
            <div className="rs-receipt-brand">ArepaTool</div>
            <h3>{t("receipt")}</h3>
            <dl className="rs-ledger">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || "—"}</dd>
                </div>
              ))}
            </dl>
            <p className="rs-small rs-muted">{t("receiptDisclaimer")}</p>
          </article>
          <div className="rs-actions rs-no-print">
            <CopyButton text={text} />
            <button
              className="rs-button rs-secondary"
              onClick={() =>
                downloadText(
                  `arepatool-topup-${receipt.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80)}.txt`,
                  text,
                )
              }
            >
              <Download size={16} aria-hidden="true" />
              {t("download")}
            </button>
            <button className="rs-button" onClick={() => window.print()}>
              <Printer size={16} aria-hidden="true" />
              {t("print")}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
export default function Ledger({ receipts = false }: { receipts?: boolean }) {
  const { t, language } = useReseller();
  const [page, setPage] = useState(1);
  const [dates, setDates] = useState<{ from?: string; to?: string }>({});
  const [type, setType] = useState("");
  const [selected, setSelected] = useState<LedgerItem>();
  const resource = useResource(
    () =>
      receipts
        ? resellerApi("receipts", { page })
        : resellerApi("history", { page, ...dates, type: type || undefined }),
    JSON.stringify({ page, dates, type, receipts }),
  );
  const data = resource.data;
  const items = data?.items.filter(
    (item) => !receipts || item.type === "credit",
  );
  return (
    <div className="rs-stack rs-section-stack">
      {!receipts && (
        <div className="rs-filter-bar">
          <DateFilter
            onApply={(value) => {
              setDates(value);
              setPage(1);
            }}
          />
          <Field label={t("type")}>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t("all")}</option>
              {(["credit", "debit", "refund"] as const).map((type) => (
                <option key={type} value={type}>
                  {t(type)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}
      {!receipts && <p className="rs-small rs-muted">{t("reportTimezone")}</p>}
      {receipts && <Notice tone="info">{t("receiptDisclaimer")}</Notice>}
      <ResourceState {...resource} retry={resource.refresh} />
      {data && (
        <>
          <section className="rs-panel rs-table-panel">
            {items?.length ? (
              <Table
                label={t(receipts ? "receipts" : "history")}
                headings={[
                  t("date"),
                  t("type"),
                  t("description"),
                  t("amount"),
                  t("before"),
                  t("after"),
                  t("reference"),
                  t("source"),
                  ...(receipts ? [t("receipt")] : []),
                ]}
              >
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="rs-date">
                      {dateTime(item.createdAt, language)}
                    </td>
                    <td>
                      <span
                        className={`rs-tag ${item.type === "credit" ? "rs-tag--success" : ""}`}
                      >
                        {ledgerType(item.type, t)}
                      </span>
                    </td>
                    <td>{item.description || "—"}</td>
                    <td className="rs-number">
                      {money(item.amount, language)}
                    </td>
                    <td className="rs-number">
                      {money(item.balanceBefore, language)}
                    </td>
                    <td className="rs-number">
                      {money(item.balanceAfter, language)}
                    </td>
                    <td>
                      <code>{item.reference || item.id}</code>
                    </td>
                    <td>{item.source || "—"}</td>
                    {receipts && (
                      <td>
                        <button
                          className="rs-button rs-secondary"
                          onClick={() => setSelected(item)}
                        >
                          {t("viewReceipt")}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </Table>
            ) : (
              <Empty>{t("noActivity")}</Empty>
            )}
          </section>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onChange={setPage}
          />
        </>
      )}
      {selected && (
        <Receipt item={selected} onClose={() => setSelected(undefined)} />
      )}
    </div>
  );
}
