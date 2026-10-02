import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", { variants: { variant: { default: "button-filled-primary", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", outline: "border border-border bg-card shadow-xs hover:bg-accent hover:text-accent-foreground", ghost: "hover:bg-accent hover:text-accent-foreground", link: "text-primary underline-offset-4 hover:underline", destructive: "button-filled-danger" }, size: { default: "h-10 px-4 py-2 sm:h-9", sm: "h-9 rounded-md px-3 text-xs sm:h-8", lg: "h-11 px-6 sm:h-10", icon: "size-10 sm:size-9" } }, defaultVariants: { variant: "default", size: "default" } });

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean };
function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) { const classes = cn(buttonVariants({ variant, size }), className); if (asChild) return <Slot className={classes} {...props}>{children}</Slot>; return <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}{children}</button>; }
export { Button, buttonVariants };
