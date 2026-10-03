import type { ReactNode } from "react";

export type PrintableBusiness = { businessName: string; legalName: string | null; address: string; taxId: string | null; branch: string | null; phone: string | null; email: string | null; logoUrl: string | null };
export type PrintableCustomer = { name: string; code: string; address?: string; taxId?: string | null; branch?: string | null; phone?: string | null };
export type PrintableMeta = { label: string; value?: ReactNode };
export type PrintableColumn = { key: string; label: string; align?: "left" | "center" | "right"; width?: string };
export type PrintableRow = { key: string; cells: Record<string, ReactNode> };
export type PrintableTotal = { label: string; amount: string; strong?: boolean };
export type PrintableSignature = { label: string; showName?: boolean; dateLabel?: string };
