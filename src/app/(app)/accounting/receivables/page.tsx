import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/accounting/receivables"); return <PlaceholderPage title="ลูกหนี้การค้า" section="บัญชี" />; }
