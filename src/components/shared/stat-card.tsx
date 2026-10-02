import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = { label: string; value: ReactNode; helper: string; icon: LucideIcon; tone?: "default" | "success" | "warning" | "danger" };
const tones = { default: "bg-primary/10 text-primary", success: "bg-success/10 text-success", warning: "bg-warning/15 text-warning-foreground dark:text-warning", danger: "bg-danger/10 text-danger" };

export function StatCard({ label, value, helper, icon: Icon, tone = "default" }: StatCardProps) { return <Card><CardContent className="flex min-h-28 items-start justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate text-[13px] font-medium text-muted-foreground">{label}</p><p className="mt-1.5 text-2xl font-semibold leading-none tracking-tight tabular-nums">{value}</p><p className="mt-2 truncate text-xs leading-4 text-muted-foreground">{helper}</p></div><div className={`rounded-md p-2 ${tones[tone]}`}><Icon className="size-4" aria-hidden="true" /></div></CardContent></Card>; }
