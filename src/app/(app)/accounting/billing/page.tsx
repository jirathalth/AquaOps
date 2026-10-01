import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { BillingTable } from "@/features/accounting/components/accounting-tables";
import { requireRouteAccess } from "@/services/auth.service";
import { getBillingList } from "@/services/accounting.service";
export default async function Page() { const [access, rows] = await Promise.all([requireRouteAccess("/accounting/billing"), getBillingList()]); return <div className="page-stack"><PageHeader title="ใบวางบิล" description="จัดกลุ่มใบแจ้งหนี้ค้างชำระของลูกค้ารายเดียวกันเพื่อการติดตามรับชำระ" parent={{ label: "บัญชี" }} primaryAction={access.permissions.includes("billing.manage") ? <Button size="sm" asChild><Link href="/accounting/billing/new"><Plus className="size-4" aria-hidden="true" />สร้างใบวางบิล</Link></Button> : undefined} /><BillingTable rows={rows} /></div>; }
