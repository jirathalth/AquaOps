import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-lg border p-4 text-sm", { variants: { variant: { default: "bg-card text-card-foreground", danger: "border-danger/35 bg-danger/8 text-danger", info: "border-info/35 bg-info/8 text-foreground" } }, defaultVariants: { variant: "default" } });
function Alert({ className, variant, ...props }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) { return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />; }
function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h5 className={cn("mb-1 font-medium", className)} {...props} />; }
function AlertDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("text-sm opacity-90", className)} {...props} />; }
export { Alert, AlertTitle, AlertDescription };
