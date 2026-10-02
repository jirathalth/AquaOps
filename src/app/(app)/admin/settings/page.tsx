import { redirect } from "next/navigation";
import { requirePermission } from "@/services/auth.service";

export default async function Page() { await requirePermission("settings.view"); redirect("/settings"); }
