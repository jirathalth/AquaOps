import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/accounting/invoices"); return <PlaceholderPage title="ใบแจ้งหนี้" section="บัญชี" />; }
