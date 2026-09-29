import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn("flex min-h-20 w-full rounded-md border bg-background px-3 py-2 text-base leading-6 shadow-xs placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 read-only:bg-muted/60 aria-invalid:border-danger aria-invalid:focus-visible:outline-danger sm:text-sm", className)} {...props} />; }
export { Textarea };
