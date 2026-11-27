import { useState } from "react";
import { ArrowUpRight, Wallet } from "lucide-react";
import { resellerApi, type Reseller } from "../../lib/reseller-api";
import { dateTime, money } from "../../lib/reseller-i18n";
import { defaultReportDates, resolveReportDates } from "./report-dates";
import {
  DateFilter,
  Empty,
  Notice,
  ResourceState,
  Table,
  useReseller,
  useResource,
} from "./shared";
export default function Reporting({
  reseller,
  analytics = false,
  onOrder,
}: {
  reseller: Reseller;
  analytics?: boolean;
  onOrder: () => void;
}) {
  const { t, language } = useReseller();
  const [dates, setDates] = useState(defaultReportDates);
  const resource = useResource(
    () => resellerApi("overview", dates),
    JSON.stringify(dates),
  );
  const data = resource.data;
  const low =
    reseller.lowBalanceThreshold != null &&
    Number(reseller.balance) <= Number(reseller.lowBalanceThreshold);
  return (
    <div className="rs-stack rs-section-stack">
      {!analytics && (
        <>
          <section className="rs-balance-strip">
            <div>
              <span className="rs-muted">
                <Wallet size={17} aria-hidden="true" />
                {t("balance")}
              </span>
              <p className="rs-balance">{money(reseller.balance, language)}</p>
              <p className="rs-small rs-muted">{t("balanceHelp")}</p>
            </div>
            <div className="rs-balance-actions">
              <button className="rs-button" onClick={onOrder}>
                {t("newOrder")}
                <ArrowUpRight size={17} aria-hidden="true" />
              </button>
              <p className="rs-small rs-muted">{t("topupHelp")}</p>
            </div>
          </section>
          {low && (
            <Notice tone="warning">
              {t("lowBalance")} {t("topupHelp")}
            </Notice>
          )}
        </>
      )}
      <div className="rs-section-heading">
        <h2>{analytics ? t("analytics") : t("overview")}</h2>
        <DateFilter
          key={JSON.stringify(dates)}
          initialDates={dates}
          onApply={(value) => setDates(resolveReportDates(value))}
        />
      </div>
      <p className="rs-small rs-muted">
        {dateTime(dates.from, language)} – {dateTime(dates.to, language)}.{" "}
        {t("reportTimezone")}
      </p>
      <ResourceState {...resource} retry={resource.refresh} />
      {data && (
        <>
          <div className="rs-stat-grid">
            {(
              ["licenses", "credits", "rentals", "spent", "topups"] as const
            ).map((key) => (
              <div className="rs-stat" key={key}>
                <span>{t(key)}</span>
                <strong>
                  {key === "spent" || key === "topups"
                    ? money(data.summary[key], language)
                    : data.summary[key].toLocaleString(language)}
                </strong>
              </div>
            ))}
          </div>
          {analytics ? (
            <>
              <section className="rs-panel rs-table-panel">
                <h2>{t("byDay")}</h2>
                {data.series.length ? (
                  <Table
                    label={t("byDay")}
                    headings={[
                      t("date"),
                      t("licenses"),
                      t("credits"),
                      t("rentals"),
                      t("amount"),
                    ]}
                  >
                    {data.series.map((row) => (
                      <tr key={row.day}>
                        <td>{dateTime(row.day, language)}</td>
                        <td>{row.licenses}</td>
                        <td>{row.credits}</td>
                        <td>{row.rentals}</td>
                        <td className="rs-number">
                          {money(row.amount, language)}
                        </td>
                      </tr>
                    ))}
                  </Table>
                ) : (
                  <Empty />
                )}
              </section>
              <div className="rs-two-columns">
                <section className="rs-panel rs-table-panel">
                  <h2>{t("byPlan")}</h2>
                  {data.plans.length ? (
                    <Table
                      label={t("byPlan")}
                      headings={[t("duration"), t("count"), t("amount")]}
                    >
                      {data.plans.map((row) => (
                        <tr key={row.months}>
                          <td>
                            {row.months} {t("months")}
                          </td>
                          <td>{row.count}</td>
                          <td className="rs-number">
                            {money(row.amount, language)}
                          </td>
                        </tr>
                      ))}
                    </Table>
                  ) : (
                    <Empty />
                  )}
                </section>
                <section className="rs-panel rs-table-panel">
                  <h2>{t("bySource")}</h2>
                  {data.sources.length ? (
                    <Table
                      label={t("bySource")}
                      headings={[t("source"), t("count"), t("amount")]}
                    >
                      {data.sources.map((row) => (
                        <tr key={row.source}>
                          <td>{row.source}</td>
                          <td>{row.count}</td>
                          <td className="rs-number">
                            {money(row.amount, language)}
                          </td>
                        </tr>
                      ))}
                    </Table>
                  ) : (
                    <Empty />
                  )}
                </section>
              </div>
            </>
          ) : (
            <section className="rs-panel">
              <h2>{t("currentPrices")}</h2>
              <div className="rs-prices">
                {([3, 6, 12] as const).map((months) => (
                  <div key={months}>
                    <span>
                      {t("license")} · {months} {t("months")}
                    </span>
                    <strong>{money(reseller.prices[months], language)}</strong>
                  </div>
                ))}
                <div>
                  <span>{t("creditUnit")}</span>
                  <strong>{money(reseller.prices.credit, language)}</strong>
                </div>
                <div>
                  <span>{t("rentalUnit")}</span>
                  <strong>{money(reseller.prices.rental, language)}</strong>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
