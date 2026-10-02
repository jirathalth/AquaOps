import type { ReactNode } from "react";
import { PageActions } from "@/components/shared/page-actions";
import { PageHeader } from "@/components/shared/page-header";

type DetailHeaderProps = { title: string; identifier: string; description?: string; section: { label: string; href?: string }; status?: ReactNode; actions?: ReactNode };
export function DetailHeader({ title, identifier, description, section, status, actions }: DetailHeaderProps) { return <div className="space-y-3"><PageHeader title={title} description={description} breadcrumbs={[section, { label: identifier }]} actions={actions ? <PageActions>{actions}</PageActions> : undefined} /><div className="flex flex-wrap items-center gap-2 border-y border-border/80 bg-card px-3 py-2 shadow-xs sm:rounded-md sm:border"><span className="type-label tabular-nums">{identifier}</span>{status}</div></div>; }
