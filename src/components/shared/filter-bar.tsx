"use client";

import { Funnel, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type FilterBarProps = { search?: ReactNode; filters?: ReactNode; actions?: ReactNode; activeFilterCount?: number; onReset?: () => void; className?: string; children?: ReactNode };

export function FilterBar({ search, filters, actions, activeFilterCount = 0, onReset, className, children }: FilterBarProps) {
  const filterContent = filters ?? children;
  return (
    <div className={cn("flex flex-col gap-2.5 border-y border-border/80 bg-card px-3 py-3 shadow-xs sm:rounded-md sm:border", className)}>
      <div className="flex min-w-0 flex-wrap items-center gap-2 md:flex-nowrap">
        {search && <div className="min-w-0 flex-1 basis-full sm:max-w-sm xl:basis-auto">{search}</div>}
        <div className="hidden min-w-0 flex-1 items-center gap-2 xl:flex">{filterContent}{activeFilterCount > 0 && onReset && <Button type="button" variant="ghost" size="sm" onClick={onReset}><RotateCcw className="size-3.5" />ล้างตัวกรอง</Button>}</div>
        {filterContent && <Sheet><SheetTrigger asChild><Button type="button" variant="outline" size="sm" className="xl:hidden"><Funnel className="size-4" />ตัวกรอง{activeFilterCount > 0 && <Badge className="ml-0.5 px-1.5" variant="secondary">{activeFilterCount}</Badge>}</Button></SheetTrigger><SheetContent side="right" className="w-72 p-4"><SheetTitle className="pr-8">ตัวกรอง</SheetTitle><SheetDescription>เลือกเงื่อนไขเพื่อจำกัดข้อมูลที่แสดง</SheetDescription><div className="mt-5 flex flex-col gap-3">{filterContent}</div>{activeFilterCount > 0 && onReset && <Button type="button" variant="outline" className="mt-4 w-full" onClick={onReset}><RotateCcw className="size-4" />ล้างตัวกรอง</Button>}</SheetContent></Sheet>}
        {actions && <div className="ml-auto shrink-0">{actions}</div>}
      </div>
      {activeFilterCount > 0 && <p className="type-caption">ใช้ตัวกรองอยู่ {activeFilterCount} รายการ</p>}
    </div>
  );
}
