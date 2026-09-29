import { notFound } from "next/navigation";
import { UiShowcase } from "@/features/dev-ui/components/ui-showcase";
import { requirePermission } from "@/services/auth.service";

export default async function UiShowcasePage() { if (process.env.NODE_ENV === "production") notFound(); await requirePermission("settings.view"); return <UiShowcase />; }
