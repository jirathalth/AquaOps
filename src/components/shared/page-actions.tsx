import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex flex-wrap items-center gap-2", className)} {...props} />; }
