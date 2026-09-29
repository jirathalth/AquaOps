import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/sales/customers"); return <PlaceholderPage title="ลูกค้า" section="ฝ่ายขาย" />; }
