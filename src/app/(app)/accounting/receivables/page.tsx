import { redirect } from "next/navigation";
import { requireRouteAccess } from "@/services/auth.service";
export default async function Page() { await requireRouteAccess("/accounting/receivables"); redirect("/accounting/ar"); }
