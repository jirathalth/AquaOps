import { notFound } from "next/navigation";
import { billingStatusConfig } from "@/config/accounting";
import { formatAddress } from "@/features/printable-documents/printable-document-core";
import { PrintableDocument } from "@/features/printable-documents/components/printable-document";
import { formatCurrencyDecimal, formatDate } from "@/lib/formatters";
import { thaiBahtText } from "@/lib/thai-baht-text";
import { getBillingNote } from "@/services/accounting.service";
import { requireRouteAccess } from "@/services/auth.service";
import { getPrintableDocumentContext } from "@/services/printable-document.service";

export default async function BillingPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [, billing, context] = await Promise.all([requireRouteAccess(`/accounting/billing/${id}/print`), getBillingNote(id), getPrintableDocumentContext()]);
  if (!billing) notFound();
  const snapshot = billing.invoices[0]?.invoice;
  const statusLabel = ["DRAFT", "CANCELLED"].includes(billing.status) ? billingStatusConfig[billing.status].label : undefined;
  return <PrintableDocument backHref={`/accounting/billing/${id}`} business={context.business} customer={{ name: snapshot?.customerNameSnapshot ?? billing.customer.displayName, code: snapshot?.customerCodeSnapshot ?? billing.customer.code, address: formatAddress(snapshot?.billingAddress), taxId: snapshot?.taxIdSnapshot, branch: snapshot?.taxBranchCodeSnapshot }} title="ใบวางบิล" subtitle="BILLING NOTE" documentNumber={billing.billingNo} statusLabel={statusLabel} metadata={[{ label: "วันที่วางบิล", value: formatDate(billing.billingDate) }, { label: "วันครบกำหนด", value: formatDate(billing.dueDate) }, { label: "จำนวนใบแจ้งหนี้", value: `${billing.invoices.length} รายการ` }]} columns={[{ key: "line", label: "ลำดับ", align: "center", width: "8%" }, { key: "invoiceNo", label: "เลขที่ใบแจ้งหนี้", width: "25%" }, { key: "invoiceDate", label: "วันที่", width: "17%" }, { key: "dueDate", label: "วันครบกำหนด", width: "17%" }, { key: "invoiceTotal", label: "ยอดใบแจ้งหนี้", align: "right", width: "17%" }, { key: "billedAmount", label: "ยอดวางบิล", align: "right", width: "16%" }]} rows={billing.invoices.map((link, index) => ({ key: link.id, cells: { line: index + 1, invoiceNo: link.invoice.invoiceNo, invoiceDate: formatDate(link.invoice.invoiceDate), dueDate: formatDate(link.invoice.dueDate), invoiceTotal: formatCurrencyDecimal(link.invoice.totalAmount), billedAmount: formatCurrencyDecimal(link.amount) } }))} totals={[{ label: "ยอดวางบิลรวม", amount: formatCurrencyDecimal(billing.totalAmount), strong: true }]} amountWords={thaiBahtText(billing.totalAmount)} notes={billing.notes} footer={context.footer} signatures={[{ label: "ผู้วางบิล" }, { label: "ผู้รับวางบิล", dateLabel: "วันที่รับเอกสาร" }, { label: "ผู้ตรวจสอบ" }]} tableCaption={`ใบแจ้งหนี้ในใบวางบิล ${billing.billingNo}`} />;
}
