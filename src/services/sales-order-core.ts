import type { SalesOrderStatusValue } from "@/config/sales-orders";

type CalculationItem = { quantity: string; unitPrice: string; discountAmount: string; taxRate: string };
const pow10 = (scale: number) => 10n ** BigInt(scale);
function scaled(value: string, scale: number) { const [whole = "0", fraction = ""] = value.trim().split("."); return BigInt(whole || "0") * pow10(scale) + BigInt(fraction.padEnd(scale, "0").slice(0, scale) || "0"); }
function divideRound(value: bigint, divisor: bigint) { const quotient = value / divisor; const remainder = value % divisor; return quotient + (remainder * 2n >= divisor ? 1n : 0n); }
function fixed(value: bigint, scale: number) { const negative = value < 0; const absolute = negative ? -value : value; const digits = absolute.toString().padStart(scale + 1, "0"); return `${negative ? "-" : ""}${digits.slice(0, -scale)}.${digits.slice(-scale)}`; }
export function normalizeFixed(value: string, scale: number) { return fixed(scaled(value, scale), scale); }
export function isManualPriceOverride(unitPrice: string, resolvedUnitPrice: string) { return normalizeFixed(unitPrice, 4) !== normalizeFixed(resolvedUnitPrice, 4); }
export function multiplyFixed(left: string, leftScale: number, right: string, rightScale: number, outputScale: number) { return fixed(divideRound(scaled(left, leftScale) * scaled(right, rightScale), pow10(leftScale + rightScale - outputScale)), outputScale); }

export function calculateSalesOrderTotals(items: CalculationItem[], documentDiscountAmount: string) {
  const prepared = items.map((item) => { const lineSubtotal = divideRound(scaled(item.quantity, 3) * scaled(item.unitPrice, 4), pow10(5)); const discount = scaled(item.discountAmount, 2); if (discount > lineSubtotal) throw new Error("ส่วนลดรายการต้องไม่เกินมูลค่ารายการ"); return { lineSubtotal, lineDiscount: discount, net: lineSubtotal - discount, taxRate: scaled(item.taxRate, 2) }; });
  const subtotal = prepared.reduce((sum, item) => sum + item.lineSubtotal, 0n); const lineDiscount = prepared.reduce((sum, item) => sum + item.lineDiscount, 0n); const netBeforeDocumentDiscount = subtotal - lineDiscount; const documentDiscount = scaled(documentDiscountAmount, 2); if (documentDiscount > netBeforeDocumentDiscount) throw new Error("ส่วนลดท้ายเอกสารต้องไม่เกินยอดหลังส่วนลดรายการ");
  let remainingDiscount = documentDiscount; let remainingNet = netBeforeDocumentDiscount;
  const lines = prepared.map((item, index) => { const proportionalShare = index === prepared.length - 1 ? remainingDiscount : remainingNet === 0n ? 0n : divideRound(remainingDiscount * item.net, remainingNet); const documentDiscountShare = proportionalShare > item.net ? item.net : proportionalShare; remainingDiscount -= documentDiscountShare; remainingNet -= item.net; const taxableAmount = item.net - documentDiscountShare; const taxAmount = divideRound(taxableAmount * item.taxRate, 10000n); return { lineSubtotal: fixed(item.lineSubtotal, 2), discountAmount: fixed(item.lineDiscount, 2), documentDiscountShare: fixed(documentDiscountShare, 2), taxAmount: fixed(taxAmount, 2), lineTotal: fixed(taxableAmount + taxAmount, 2) }; });
  const taxAmount = lines.reduce((sum, item) => sum + scaled(item.taxAmount, 2), 0n); const discountAmount = lineDiscount + documentDiscount; return { lines, subtotal: fixed(subtotal, 2), documentDiscountAmount: fixed(documentDiscount, 2), discountAmount: fixed(discountAmount, 2), taxAmount: fixed(taxAmount, 2), totalAmount: fixed(subtotal - discountAmount + taxAmount, 2) };
}

const transitions: Record<SalesOrderStatusValue, readonly SalesOrderStatusValue[]> = { DRAFT: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["CANCELLED"], PREPARING: [], READY: [], DELIVERING: [], DELIVERED: [], COMPLETED: [], CANCELLED: [] };
export function canTransitionSalesOrder(from: SalesOrderStatusValue, to: SalesOrderStatusValue) { return transitions[from].includes(to); }
