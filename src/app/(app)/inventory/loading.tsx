import { TableSkeleton } from "@/components/shared/table-skeleton";
export default function InventoryLoading() { return <div className="page-stack"><div className="h-16 animate-pulse rounded-md bg-muted" /><div className="overflow-hidden rounded-md border bg-card"><TableSkeleton columns={8} rows={8} /></div></div>; }
