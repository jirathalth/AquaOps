import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { InvoiceTable } from "@/features/accounting/components/accounting-tables";
import { requireRouteAccess } from "@/services/auth.service";
import { getInvoiceList } from "@/services/accounting.service";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const query = await searchParams; const q = typeof query.q === "string" ? query.q.slice(0, 120) : ""; const requestedStatus = typeof query.status === "string" ? query.status : "ALL"; const status = ["ALL", "DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"].includes(requestedStatus) ? requestedStatus : "ALL"; const access = await requireRouteAccess("/accounting/invoices"); const result = await getInvoiceList({ q, status, page: Number(query.page) || 1, pageSize: Number(query.pageSize) || 20 }); return <div className="page-stack"><PageHeader title="ใบแจ้งหนี้" description="ออกใบแจ้งหนี้จากคำสั่งซื้อที่จัดส่งแล้ว และติดตามยอดชำระจากการจัดสรรเงินจริง" parent={{ label: "บัญชี" }} primaryAction={access.permissions.includes("invoice.create") ? <Button size="sm" asChild><Link href="/accounting/invoices/new"><Plus className="size-4" aria-hidden="true" />สร้างใบแจ้งหนี้</Link></Button> : undefined} /><InvoiceTable rows={result.rows} total={result.total} page={result.page} pageSize={result.pageSize} q={q} status={status} /></div>; }
