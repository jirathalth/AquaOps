import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input type={type} className={cn("flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 read-only:bg-muted/60 aria-invalid:border-danger aria-invalid:focus-visible:outline-danger", className)} {...props} />; }
export { Input };
