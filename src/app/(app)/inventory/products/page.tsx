import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/inventory/products"); return <PlaceholderPage title="สินค้า" section="สินค้าคงคลัง" />; }
