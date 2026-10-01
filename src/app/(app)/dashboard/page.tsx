import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { PageHeader } from "@/components/shared/page-header";
import { requireRouteAccess } from "@/services/auth.service";
import { getDashboard } from "@/services/reporting.service";
import { reportQuerySchema } from "@/validations/reporting";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [access, params] = await Promise.all([requireRouteAccess("/dashboard"), searchParams]); const parsed = reportQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : reportQuerySchema.parse({}); const dashboard = await getDashboard(query, access.permissions); return <div className="page-stack"><PageHeader title="แดชบอร์ด" description="ภาพรวมการดำเนินงานจากธุรกรรมที่บันทึกใน AquaOps" /><DashboardOverview data={dashboard} /></div>; }
