export type ReportOption = { id: string; label: string };
export type ReportOptions = { customers: ReportOption[]; products: ReportOption[]; categories: ReportOption[]; warehouses: ReportOption[]; users: ReportOption[]; drivers: ReportOption[]; vehicles: ReportOption[] };
export type ReportColumn = { key: string; label: string; format?: "money" | "quantity" | "date" | "datetime" | "status"; align?: "left" | "right"; linkPrefix?: string; hrefKey?: string; sortKey?: string };
export type ReportResult = { rows: Array<Record<string, string | number | null>>; total: number; pageCount: number; summary: Array<{ label: string; value: string; format?: "money" | "number" }> };
