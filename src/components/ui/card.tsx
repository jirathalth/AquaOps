import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-md border bg-card text-card-foreground shadow-xs", className)} {...props} />; }
function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex flex-col gap-1 p-4", className)} {...props} />; }
function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("type-card-title", className)} {...props} />; }
function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("type-secondary", className)} {...props} />; }
function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-4 pt-0", className)} {...props} />; }
function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex items-center p-4 pt-0", className)} {...props} />; }
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
