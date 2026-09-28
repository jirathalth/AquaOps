import type { HTMLAttributes } from "react";
import { formatCurrency, formatNumber, formatPercentage, formatQuantity } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type ValueKind = "currency" | "number" | "quantity" | "percentage";
type FinancialValueProps = HTMLAttributes<HTMLSpanElement> & { value: number; kind?: ValueKind; unit?: string; fractionDigits?: number };

export function FinancialValue({ value, kind = "currency", unit, fractionDigits, className, ...props }: FinancialValueProps) { const formatted = kind === "currency" ? formatCurrency(value, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }) : kind === "percentage" ? formatPercentage(value, fractionDigits) : kind === "quantity" ? formatQuantity(value, unit) : formatNumber(value, fractionDigits); return <span className={cn("tabular-nums whitespace-nowrap", value < 0 && "text-danger", className)} {...props}>{formatted}</span>; }
