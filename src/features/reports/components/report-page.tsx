import { PageHeader } from "@/components/shared/page-header";
import { reportDefinitions } from "@/config/reports";
import { ReportDataTable } from "@/features/reports/components/report-data-table";
import { ReportFilters } from "@/features/reports/components/report-filters";
import { ReportSummary } from "@/features/reports/components/report-summary";
import type { ReportOptions, ReportResult } from "@/features/reports/types";
import type { ReportKey } from "@/services/reporting.service";
import type { ReportQuery } from "@/validations/reporting";

export function ReportPage({ report, query, result, options, children }: { report: ReportKey; query: ReportQuery; result: ReportResult; options: ReportOptions; children?: React.ReactNode }) { const definition = reportDefinitions[report]; return <div className="page-stack"><PageHeader title={definition.title} description={definition.description} breadcrumbs={[{ label: "รายงาน", href: "/reports" }, { label: definition.title }]} /><ReportFilters report={report} filters={definition.filters} query={query} options={options} dateLabel={definition.dateLabel} /><ReportSummary items={result.summary} /><ReportDataTable rows={result.rows} total={result.total} pageCount={result.pageCount} query={query} columnSpecs={definition.columns} />{children}</div>; }
