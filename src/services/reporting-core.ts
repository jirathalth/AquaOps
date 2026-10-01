import { BUSINESS_TIMEZONE } from "@/constants/app";
import { addMoney } from "@/services/accounting-core";

export const REPORT_EXPORT_LIMIT = 10_000;
export const REPORTABLE_SALES_STATUSES = ["CONFIRMED", "PREPARING", "READY", "DELIVERING", "DELIVERED", "COMPLETED"] as const;
export type ReportPeriod = "today" | "this-month" | "previous-month" | "custom";
export function isReportableSalesStatus(value: string): value is (typeof REPORTABLE_SALES_STATUSES)[number] { return (REPORTABLE_SALES_STATUSES as readonly string[]).includes(value); }
export function aggregateMoneyByKey<T extends string>(rows: Array<{ key: T; value: string }>, keys: readonly T[]) { return Object.fromEntries(keys.map((key) => [key, addMoney(rows.filter((row) => row.key === key).map((row) => row.value))])) as Record<T, string>; }

export function businessDateKey(now = new Date()) { return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now); }
function parts(value: string) { const [year, month, day] = value.split("-").map(Number); return { year: year!, month: month!, day: day! }; }
function dateKeyUtc(year: number, month: number, day: number) { return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10); }

export function resolveReportRange(input: { period?: string; dateFrom?: string; dateTo?: string }, now = new Date()) {
  const today = businessDateKey(now); const current = parts(today); const period: ReportPeriod = input.period === "today" || input.period === "previous-month" || input.period === "custom" ? input.period : "this-month";
  if (period === "today") return { period, dateFrom: today, dateTo: today };
  if (period === "custom" && input.dateFrom && input.dateTo && input.dateFrom <= input.dateTo) return { period, dateFrom: input.dateFrom, dateTo: input.dateTo };
  if (period === "previous-month") { const first = new Date(Date.UTC(current.year, current.month - 2, 1)); const last = new Date(Date.UTC(current.year, current.month - 1, 0)); return { period, dateFrom: first.toISOString().slice(0, 10), dateTo: last.toISOString().slice(0, 10) }; }
  return { period: "this-month" as const, dateFrom: dateKeyUtc(current.year, current.month, 1), dateTo: today };
}

export function dateOnly(value: string) { return new Date(`${value}T00:00:00.000Z`); }
export function bangkokTimestampRange(dateFrom: string, dateTo: string) { return { gte: new Date(`${dateFrom}T00:00:00.000+07:00`), lt: new Date(`${dateKeyUtc(parts(dateTo).year, parts(dateTo).month, parts(dateTo).day + 1)}T00:00:00.000+07:00`) }; }
export function dateOnlyRange(dateFrom: string, dateTo: string) { return { gte: dateOnly(dateFrom), lte: dateOnly(dateTo) }; }

export function sanitizeCsvCell(value: unknown) { const raw = value == null ? "" : String(value); const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw; return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe; }
export function createCsv(headers: string[], rows: unknown[][]) { return `\uFEFF${[headers, ...rows].map((row) => row.map(sanitizeCsvCell).join(",")).join("\r\n")}`; }
