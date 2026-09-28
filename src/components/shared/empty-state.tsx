import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title = "ยังไม่มีข้อมูล", description = "ข้อมูลจะแสดงที่นี่เมื่อพร้อมใช้งาน", action }: { title?: string; description?: string; action?: ReactNode }) { return <div className="flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center"><div className="rounded-full bg-muted p-2.5"><Inbox className="size-5 text-muted-foreground" /></div><h3 className="mt-3 text-sm font-medium">{title}</h3><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>{action && <div className="mt-4">{action}</div>}</div>; }
