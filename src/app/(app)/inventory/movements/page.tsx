import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/inventory/movements"); return <PlaceholderPage title="ความเคลื่อนไหวสต็อก" section="สินค้าคงคลัง" />; }
