import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/admin/settings"); return <PlaceholderPage title="ตั้งค่า" section="ผู้ดูแลระบบ" />; }
