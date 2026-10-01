export type AgingBucket = "CURRENT" | "DAYS_1_30" | "DAYS_31_60" | "DAYS_61_90" | "DAYS_90_PLUS";

function cents(value: string) {
  const match = value.trim().match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new Error("จำนวนเงินไม่ถูกต้อง");
  const amount = BigInt(match[2]!) * 100n + BigInt((match[3] ?? "").padEnd(2, "0"));
  return match[1] ? -amount : amount;
}

function money(value: bigint) { const sign = value < 0n ? "-" : ""; const absolute = value < 0n ? -value : value; return `${sign}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, "0")}`; }
export function normalizeMoney(value: string) { return money(cents(value)); }
export function addMoney(values: readonly string[]) { return money(values.reduce((sum, value) => sum + cents(value), 0n)); }
export function subtractMoney(left: string, right: string) { return money(cents(left) - cents(right)); }
export function compareMoney(left: string, right: string) { return cents(left) === cents(right) ? 0 : cents(left) < cents(right) ? -1 : 1; }
export function calculateOutstanding(total: string, allocations: readonly string[]) { const outstanding = cents(total) - allocations.reduce((sum, value) => sum + cents(value), 0n); if (outstanding < 0n) throw new Error("ยอดจัดสรรเกินยอดใบแจ้งหนี้"); return money(outstanding); }

export function addBusinessDays(date: string, days: number) { const [year, month, day] = date.split("-").map(Number); if (!year || !month || !day || days < 0) throw new Error("วันที่หรือจำนวนวันเครดิตไม่ถูกต้อง"); const value = new Date(Date.UTC(year, month - 1, day)); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10); }
export function daysOverdue(dueDate: string, asOfDate: string) { const due = Date.parse(`${dueDate}T00:00:00Z`); const asOf = Date.parse(`${asOfDate}T00:00:00Z`); if (!Number.isFinite(due) || !Number.isFinite(asOf)) throw new Error("วันที่ไม่ถูกต้อง"); return Math.max(0, Math.floor((asOf - due) / 86_400_000)); }
export function agingBucket(dueDate: string, asOfDate: string): AgingBucket { const days = daysOverdue(dueDate, asOfDate); if (!days) return "CURRENT"; if (days <= 30) return "DAYS_1_30"; if (days <= 60) return "DAYS_31_60"; if (days <= 90) return "DAYS_61_90"; return "DAYS_90_PLUS"; }
export function deriveInvoiceStatus(input: { total: string; outstanding: string; dueDate: string; asOfDate: string }) { if (compareMoney(input.outstanding, "0.00") === 0) return "PAID" as const; if (input.dueDate < input.asOfDate) return "OVERDUE" as const; if (compareMoney(input.outstanding, input.total) < 0) return "PARTIALLY_PAID" as const; return "ISSUED" as const; }
