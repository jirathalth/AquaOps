import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { PageActions } from "@/components/shared/page-actions";

type BreadcrumbEntry = { label: string; href?: string };
type PageHeaderProps = { title: string; description?: string; parent?: BreadcrumbEntry; breadcrumbs?: BreadcrumbEntry[]; primaryAction?: ReactNode; secondaryActions?: ReactNode; actions?: ReactNode };

export function PageHeader({ title, description, parent, breadcrumbs, primaryAction, secondaryActions, actions }: PageHeaderProps) {
  const trail = breadcrumbs ?? (parent ? [parent] : []);
  const allActions = actions ?? (primaryAction || secondaryActions ? <PageActions>{secondaryActions}{primaryAction}</PageActions> : null);
  return <header className="space-y-3"><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/dashboard">AquaOps</BreadcrumbLink></BreadcrumbItem>{trail.map((item) => <Fragment key={`${item.href ?? "label"}-${item.label}`}><BreadcrumbSeparator /><BreadcrumbItem>{item.href ? <Link className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" href={item.href}>{item.label}</Link> : <span>{item.label}</span>}</BreadcrumbItem></Fragment>)}<BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{title}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h1 className="type-page-title">{title}</h1>{description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{allActions && <div className="w-full shrink-0 sm:w-auto">{allActions}</div>}</div></header>;
}
