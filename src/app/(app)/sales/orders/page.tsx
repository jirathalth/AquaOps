import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/sales/orders"); return <PlaceholderPage title="คำสั่งขาย" section="ฝ่ายขาย" />; }
