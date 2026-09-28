import type { HTMLAttributes, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = HTMLAttributes<HTMLDivElement> & { label: string; htmlFor: string; required?: boolean; description?: string; error?: string; children: ReactNode };
export function FormField({ label, htmlFor, required, description, error, children, className, ...props }: FormFieldProps) { return <div className={cn("space-y-1.5", className)} {...props}><Label htmlFor={htmlFor}>{label}{required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}<span className="sr-only">{required ? "จำเป็น" : ""}</span></Label>{children}{description && <p id={`${htmlFor}-description`} className="type-caption">{description}</p>}{error && <p id={`${htmlFor}-error`} className="text-xs leading-5 text-danger" role="alert">{error}</p>}</div>; }

type FormSectionProps = HTMLAttributes<HTMLElement> & { title: string; description?: string; children: ReactNode };
export function FormSection({ title, description, children, className, ...props }: FormSectionProps) { return <section className={cn("border-b pb-6 last:border-0 last:pb-0", className)} {...props}><div className="mb-4"><h2 className="type-section-title">{title}</h2>{description && <p className="mt-0.5 type-secondary">{description}</p>}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div></section>; }

export function FormActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("flex flex-col-reverse gap-2 border-t bg-background pt-4 sm:flex-row sm:justify-end", className)} {...props} />; }
