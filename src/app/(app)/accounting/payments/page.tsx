import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PaymentTable } from "@/features/accounting/components/accounting-tables";
import { requireRouteAccess } from "@/services/auth.service";
import { getPaymentList } from "@/services/accounting.service";
export default async function Page() { const [access, rows] = await Promise.all([requireRouteAccess("/accounting/payments"), getPaymentList()]); return <div className="page-stack"><PageHeader title="การรับชำระเงิน" description="บันทึกเงินที่ได้รับ แยกยอดจัดสรรและยอดที่ยังไม่จัดสรรอย่างตรวจสอบย้อนหลังได้" parent={{ label: "บัญชี" }} primaryAction={access.permissions.includes("payment.create") ? <Button size="sm" asChild><Link href="/accounting/payments/new"><Plus className="size-4" aria-hidden="true" />บันทึกรับชำระ</Link></Button> : undefined} /><PaymentTable rows={rows} /></div>; }
