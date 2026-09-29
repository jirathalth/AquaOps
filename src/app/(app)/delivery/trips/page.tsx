import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/delivery/trips"); return <PlaceholderPage title="เที่ยวจัดส่ง" section="การจัดส่ง" />; }
