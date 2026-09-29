import { redirect } from "next/navigation";
import { requireRouteAccess } from "@/services/auth.service";
export default async function LegacyCustomersPage() { await requireRouteAccess("/sales/customers"); redirect("/customers"); }
