import { TableSkeleton } from "@/components/shared/table-skeleton";

export default function ProductsLoading() { return <div className="page-stack"><div className="h-16 animate-pulse rounded-md bg-muted" /><TableSkeleton rows={8} columns={7} /></div>; }
