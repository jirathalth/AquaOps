import { statusConfig } from "@/config/statuses";
import type { Locale } from "@/config/i18n";
import type { BusinessStatus } from "@/types/status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, locale = "th", className }: { status: BusinessStatus; locale?: Locale; className?: string }) { const config = statusConfig[status]; return <Badge variant="outline" className={cn(config.className, className)}>{config[locale]}</Badge>; }
