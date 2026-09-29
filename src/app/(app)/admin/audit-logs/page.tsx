import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/admin/audit-logs"); return <PlaceholderPage title="บันทึกการใช้งาน" section="ผู้ดูแลระบบ" />; }
