import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const RadioGroup = forwardRef<HTMLDivElement, ComponentProps<"div">>(function RadioGroup({ className, ...props }, ref) { return <div ref={ref} role="radiogroup" className={cn("flex flex-wrap gap-x-4 gap-y-2", className)} {...props} />; });

const RadioGroupItem = forwardRef<HTMLInputElement, Omit<ComponentProps<"input">, "type">>(function RadioGroupItem({ className, ...props }, ref) { return <input ref={ref} type="radio" className={cn("size-4 shrink-0 cursor-pointer accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />; });

export { RadioGroup, RadioGroupItem };
