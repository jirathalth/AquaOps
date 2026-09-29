import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/inventory/stock"); return <PlaceholderPage title="สต็อก" section="สินค้าคงคลัง" />; }
