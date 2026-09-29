import { AppShell } from "@/components/layout/app-shell";
import { requireSession } from "@/services/auth.service";

export default async function ApplicationLayout({ children }: { children: React.ReactNode }) { const access = await requireSession(); return <AppShell access={access}>{children}</AppShell>; }
