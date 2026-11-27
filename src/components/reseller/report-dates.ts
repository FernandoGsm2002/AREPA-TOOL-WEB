export interface ReportDates {
  from?: string;
  to?: string;
}
export function defaultReportDates(now = new Date()): {
  from: string;
  to: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) =>
    parts.find((part) => part.type === type)!.value;
  const to = `${value("year")}-${value("month")}-${value("day")}`;
  return { from: `${to.slice(0, 8)}01`, to };
}
export function resolveReportDates(dates: ReportDates, now = new Date()) {
  const fallback = defaultReportDates(now);
  return { from: dates.from || fallback.from, to: dates.to || fallback.to };
}
/** Mirrors the server's exact calendar-day validation and 3 × 366 day range cap. */
export function validateReportDates(
  dates: ReportDates,
): "invalidDates" | "dateRangeLimit" | undefined {
  const valid = (date: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date;
  if (!dates.from && !dates.to) return;
  const { from, to } = resolveReportDates(dates);
  if (!valid(from) || !valid(to) || from > to) return "invalidDates";
  if (Date.parse(to) - Date.parse(from) > 3 * 366 * 86400000)
    return "dateRangeLimit";
}
