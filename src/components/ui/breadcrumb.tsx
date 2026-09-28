import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Breadcrumb(props: ComponentProps<"nav">) { return <nav aria-label="breadcrumb" {...props} />; }
function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) { return <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground", className)} {...props} />; }
function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) { return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />; }
function BreadcrumbLink({ className, ...props }: ComponentProps<"a">) { return <a className={cn("transition-colors hover:text-foreground", className)} {...props} />; }
function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) { return <span aria-current="page" className={cn("font-medium text-foreground", className)} {...props} />; }
function BreadcrumbSeparator({ children, className, ...props }: ComponentProps<"li">) { return <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>{children ?? <ChevronRight />}</li>; }
function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) { return <span role="presentation" aria-hidden="true" className={cn("flex size-8 items-center justify-center", className)} {...props}><MoreHorizontal className="size-4" /></span>; }
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis };
