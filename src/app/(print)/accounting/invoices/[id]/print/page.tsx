import { notFound } from "next/navigation";
import { invoiceStatusConfig } from "@/config/accounting";
import { formatAddress } from "@/features/printable-documents/printable-document-core";
import { PrintableDocument } from "@/features/printable-documents/components/printable-document";
import { formatCurrencyDecimal, formatDate, formatQuantityDecimal } from "@/lib/formatters";
import { thaiBahtText } from "@/lib/thai-baht-text";
import { compareMoney, subtractMoney } from "@/services/accounting-core";
import { getInvoice } from "@/services/accounting.service";
import { requireRouteAccess } from "@/services/auth.service";
import { getPrintableDocumentContext } from "@/services/printable-document.service";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [, invoice, context] = await Promise.all([requireRouteAccess(`/accounting/invoices/${id}/print`), getInvoice(id), getPrintableDocumentContext()]);
  if (!invoice) notFound();
  const taxRates = [...new Set(invoice.items.filter((item) => compareMoney(item.taxAmount, "0.00") > 0).map((item) => formatQuantityDecimal(item.taxRate)))];
  const taxLabel = taxRates.length === 1 ? `VAT ${taxRates[0]}%` : "VAT";
  const totals = [
    { label: "รวมราคา", amount: formatCurrencyDecimal(invoice.subtotal) },
    ...(compareMoney(invoice.discountAmount, "0.00") > 0 ? [{ label: "ส่วนลด", amount: `-${formatCurrencyDecimal(invoice.discountAmount)}` }] : []),
    { label: "ยอดก่อน VAT", amount: formatCurrencyDecimal(subtractMoney(invoice.subtotal, invoice.discountAmount)) },
    { label: taxLabel, amount: formatCurrencyDecimal(invoice.taxAmount) },
    { label: "ยอดสุทธิ", amount: formatCurrencyDecimal(invoice.totalAmount), strong: true },
  ];
  const statusLabel = ["DRAFT", "VOID"].includes(invoice.status) ? invoiceStatusConfig[invoice.status].label : undefined;
  return <PrintableDocument backHref={`/accounting/invoices/${id}`} business={context.business} customer={{ name: invoice.customerNameSnapshot, code: invoice.customerCodeSnapshot, address: formatAddress(invoice.billingAddress), taxId: invoice.taxIdSnapshot, branch: invoice.taxBranchCodeSnapshot }} title="ใบแจ้งหนี้" subtitle="INVOICE" documentNumber={invoice.invoiceNo} statusLabel={statusLabel} metadata={[{ label: "วันที่เอกสาร", value: formatDate(invoice.invoiceDate) }, { label: "วันครบกำหนด", value: formatDate(invoice.dueDate) }, { label: "เลขที่คำสั่งซื้อ", value: invoice.salesOrder?.orderNo }]} columns={[{ key: "line", label: "ลำดับ", align: "center", width: "7%" }, { key: "sku", label: "รหัสสินค้า", width: "14%" }, { key: "description", label: "รายละเอียด", width: "42%" }, { key: "quantity", label: "จำนวน", align: "right", width: "9%" }, { key: "unitPrice", label: "หน่วยละ", align: "right", width: "9%" }, { key: "discount", label: "ส่วนลด", align: "right", width: "9%" }, { key: "amount", label: "จำนวนเงิน", align: "right", width: "10%" }]} rows={invoice.items.map((item) => ({ key: item.id, cells: { line: item.lineNo, sku: item.skuSnapshot, description: <>{item.productNameSnapshot}{item.description !== item.productNameSnapshot && <><br />{item.description}</>}</>, quantity: formatQuantityDecimal(item.quantity, item.unitNameSnapshot), unitPrice: formatCurrencyDecimal(item.unitPrice), discount: formatCurrencyDecimal(item.discountAmount), amount: formatCurrencyDecimal(item.lineTotal) } }))} totals={totals} amountWords={thaiBahtText(invoice.totalAmount)} notes={invoice.notes} footer={context.footer} signatures={[{ label: "ผู้รับเงิน", showName: true, dateLabel: "วันที่" }, { label: "ผู้มีอำนาจลงนาม", showName: true, dateLabel: "วันที่" }]} signaturePlacement="summary" tableCaption={`รายการสินค้าในใบแจ้งหนี้ ${invoice.invoiceNo}`} />;
}
