import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/accounting/payments"); return <PlaceholderPage title="รับชำระเงิน" section="บัญชี" />; }
