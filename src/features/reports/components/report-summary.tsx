import { CircleDollarSign, ListChecks } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrencyDecimal, formatNumber } from "@/lib/formatters";
import type { ReportResult } from "@/features/reports/types";

export function ReportSummary({ items }: { items: ReportResult["summary"] }) { return <section aria-label="สรุปรายงาน" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{items.map((item) => <StatCard key={item.label} label={item.label} value={item.format === "money" ? formatCurrencyDecimal(item.value) : item.format === "number" ? formatNumber(Number(item.value), 0) : item.value} helper="ตามตัวกรองทั้งหมด" icon={item.format === "money" ? CircleDollarSign : ListChecks} />)}</section>; }
