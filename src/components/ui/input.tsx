import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input({ className, type, ...props }, ref) { return <input ref={ref} type={type} className={cn("flex h-10 w-full rounded-md border border-input bg-card px-3 py-1 text-base shadow-xs transition-[color,background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 read-only:bg-muted/60 aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:outline-danger sm:h-9 sm:text-sm", className)} {...props} />; });
export { Input };
